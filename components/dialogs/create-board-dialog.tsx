"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useApolloClient } from "@apollo/client/react";
import { LayoutDashboard, Sparkles } from "lucide-react";

import { CREATE_BOARD } from "@/graphql/board";
import { ADD_COLUMN } from "@/graphql/column";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BoardT, ColumnT } from "../kanban/types";

type Props = { userId: string };

export default function CreateBoardDialog({ userId }: Props) {
	const router = useRouter();
	const client = useApolloClient();

	const [submitting, setSubmitting] = React.useState(false);
	const nameRef = React.useRef<HTMLInputElement>(null);

	// 👇 single state object for form
	const [form, setForm] = React.useState({
		description: "",
		color: "#4f46e5",
		isFavorite: false,
		isArchived: false,
		tags: "",
		createDefaults: true,
	});

	// quick helper to update state
	const updateForm = <K extends keyof typeof form>(
		key: K,
		value: (typeof form)[K]
	) => setForm((prev) => ({ ...prev, [key]: value }));

	// quick template buttons
	const applyTemplate = (name: string) => {
		if (nameRef.current) nameRef.current.value = name;
	};

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (submitting) return;

		const fd = new FormData(e.currentTarget);
		const title = (fd.get("title") as string)?.trim();
		if (!title) {
			nameRef.current?.focus();
			return;
		}

		const parsedTags = form.tags
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		setSubmitting(true);
		try {
			const now = new Date().toISOString();
			const clientId = `board-${uuidv4()}`;

			const optimisticBoard: BoardT = {
				__typename: "Board",
				id: clientId,
				title,
				ownerId: userId,
				members: [],
				description: form.description.trim() || null,
				color: form.color || null,
				isFavorite: form.isFavorite,
				isArchived: form.isArchived,
				tags: parsedTags,
				createdAt: now,
				updatedAt: now,
				columns: [],
			};

			const { data } = await client.mutate<{ createBoard: BoardT }>({
				mutation: CREATE_BOARD,
				variables: {
					title,
					ownerId: userId,
					description: optimisticBoard.description,
					color: optimisticBoard.color,
					isFavorite: form.isFavorite,
					isArchived: form.isArchived,
					tags: parsedTags.length ? parsedTags : null,
				},
				optimisticResponse: { createBoard: optimisticBoard },
				update(cache, { data }) {
					const real = data?.createBoard;
					if (!real) return;
					cache.modify({
						id: cache.identify({ __typename: "Board", id: optimisticBoard.id }),
						fields: {
							id() {
								return real.id;
							},
						},
					});
				},
			});

			const newBoardId = data?.createBoard?.id;
			if (!newBoardId) {
				router.back();
				return;
			}

			if (form.createDefaults) {
				for (const [index, colTitle] of [
					"Backlog",
					"In Progress",
					"Done",
				].entries()) {
					const clientColId = `column-${uuidv4()}`;
					const stamp = new Date().toISOString();
					const optimisticColumn: ColumnT = {
						__typename: "Column",
						id: clientColId,
						boardId: newBoardId,
						title: colTitle,
						order: index,
						description: null,
						startDate: null,
						endDate: null,
						status: null,
						createdAt: stamp,
						updatedAt: stamp,
						cards: [],
					};

					await client.mutate({
						mutation: ADD_COLUMN,
						variables: { boardId: newBoardId, title: colTitle },
						optimisticResponse: { addColumn: optimisticColumn },
					});
				}
			}

			router.replace(`/boards/${newBoardId}`);
		} catch (err) {
			console.error(err);
			router.back();
		} finally {
			setSubmitting(false);
		}
	}

	const tagPreview = form.tags
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean)
		.slice(0, 12);

	return (
		<Dialog open onOpenChange={(v) => (v ? null : router.back())}>
			<DialogContent className="h-screen min-w-screen max-w-none rounded-none border-0 p-0">
				<div className="flex h-full flex-col lg:flex-row">
					{/* Left panel */}
					<aside className="flex w-full flex-col justify-between bg-gradient-to-b from-indigo-600 via-indigo-600/95 to-indigo-700 text-indigo-50 lg:max-w-sm">
						<div className="space-y-6 p-6 overflow-auto">
							<div className="flex items-center gap-2">
								<span className="inline-flex size-9 items-center justify-center rounded-xl bg-white/15">
									<LayoutDashboard className="size-5" />
								</span>
								<div className="text-lg font-semibold tracking-tight">
									Start a Project
								</div>
							</div>

							<div className="rounded-xl border border-white/10 bg-black/10 p-5 backdrop-blur-sm">
								<div className="flex items-start gap-3">
									<span className="mt-0.5 inline-flex rounded-full bg-white/15 p-2">
										<Sparkles className="size-4" />
									</span>
									<div>
										<div className="text-sm font-medium">Quick start</div>
										<p className="mt-1 text-xs text-indigo-100/80">
											Pick a template or type your own. You can change
											everything later.
										</p>
									</div>
								</div>
								<div className="mt-4 flex flex-wrap gap-2">
									<Button
										type="button"
										variant="secondary"
										className="bg-white text-indigo-700 hover:bg-white/90"
										onClick={() => applyTemplate("Sprint Board")}
									>
										Sprint Board
									</Button>
									<Button
										type="button"
										variant="secondary"
										className="bg-white/90 text-indigo-700 hover:bg-white"
										onClick={() => applyTemplate("Personal Kanban")}
									>
										Personal Kanban
									</Button>
									<Button
										type="button"
										variant="secondary"
										className="bg-white/90 text-indigo-700 hover:bg-white"
										onClick={() => applyTemplate("Product Roadmap")}
									>
										Product Roadmap
									</Button>
								</div>
							</div>
						</div>
						<div className="border-t border-white/10 px-6 py-4 text-xs text-indigo-100/70">
							Pro tip: you can rename or reorder columns later.
						</div>
					</aside>

					{/* Right panel */}
					<main className="flex flex-1 flex-col bg-muted/30">
						<div className="flex items-center justify-between border-b px-6 py-4">
							<DialogHeader className="space-y-0.5">
								<DialogTitle className="text-lg font-semibold">
									Create a new project
								</DialogTitle>
								<DialogDescription className="text-xs text-muted-foreground">
									Name it and choose defaults.
								</DialogDescription>
							</DialogHeader>
						</div>

						<form
							onSubmit={onSubmit}
							className="mx-auto w-full max-w-3xl flex-1 overflow-auto p-6 space-y-6"
						>
							{/* Title */}
							<div className="space-y-2">
								<Label htmlFor="title">Project name</Label>
								<Input
									id="title"
									name="title"
									ref={nameRef}
									placeholder="e.g., Sprint Board, Personal Kanban"
									required
									disabled={submitting}
								/>
							</div>

							{/* Description */}
							<div className="space-y-2">
								<Label htmlFor="description">Description (optional)</Label>
								<Textarea
									id="description"
									name="description"
									placeholder="What is this project about?"
									value={form.description}
									onChange={(e) => updateForm("description", e.target.value)}
									disabled={submitting}
									className="min-h-[96px]"
								/>
							</div>

							{/* Color + Tags */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="color">Accent color</Label>
									<div className="flex items-center gap-3">
										<Input
											id="color"
											name="color"
											type="color"
											value={form.color}
											onChange={(e) => updateForm("color", e.target.value)}
											disabled={submitting}
											className="h-10 w-16 p-1"
											title={form.color}
										/>
										<Input
											value={form.color}
											onChange={(e) => updateForm("color", e.target.value)}
											disabled={submitting}
											placeholder="#4f46e5"
											aria-label="Color hex"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="tags">Tags (comma separated)</Label>
									<Input
										id="tags"
										name="tags"
										placeholder="marketing, q3, priority"
										value={form.tags}
										onChange={(e) => updateForm("tags", e.target.value)}
										disabled={submitting}
									/>
									{tagPreview.length > 0 && (
										<div className="mt-2 flex flex-wrap gap-1">
											{tagPreview.map((t) => (
												<Badge
													key={t}
													variant="outline"
													className="h-5 rounded-full"
												>
													{t}
												</Badge>
											))}
										</div>
									)}
								</div>
							</div>

							{/* Toggles */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
									<div className="text-sm">
										<div className="font-medium">Mark as favorite</div>
										<div className="text-xs text-muted-foreground">
											Pin this project for quick access.
										</div>
									</div>
									<Switch
										checked={form.isFavorite}
										onCheckedChange={(v) => updateForm("isFavorite", v)}
										disabled={submitting}
									/>
								</div>

								<div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
									<div className="text-sm">
										<div className="font-medium">Archive immediately</div>
										<div className="text-xs text-muted-foreground">
											Hide this project from active lists.
										</div>
									</div>
									<Switch
										checked={form.isArchived}
										onCheckedChange={(v) => updateForm("isArchived", v)}
										disabled={submitting}
									/>
								</div>
							</div>

							{/* Default columns */}
							<div className="flex items-center justify-between rounded-md border px-3 py-2">
								<div className="text-sm">
									<div className="font-medium">Create default columns</div>
									<div className="text-xs text-muted-foreground">
										Adds Backlog, In Progress, Done
									</div>
								</div>
								<Switch
									checked={form.createDefaults}
									onCheckedChange={(v) => updateForm("createDefaults", v)}
									disabled={submitting}
								/>
							</div>

							{/* Submit */}
							<div className="flex justify-end">
								<Button
									type="submit"
									className="bg-indigo-600 text-white hover:bg-indigo-600/90"
									disabled={submitting}
								>
									{submitting ? "Creating..." : "Create project"}
								</Button>
							</div>
						</form>

						<div className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
							You’ll be redirected once it’s created.
						</div>
					</main>
				</div>
			</DialogContent>
		</Dialog>
	);
}
