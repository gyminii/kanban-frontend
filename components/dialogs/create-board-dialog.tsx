"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client/react";
import { Sparkles, Users, Boxes, LayoutDashboard } from "lucide-react";

import { CREATE_BOARD, INVITE_MEMBER } from "@/graphql/board";
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

type Props = { userId: string };

export default function CreateBoardDialog({ userId }: Props) {
	const router = useRouter();
	const client = useApolloClient();

	// core
	const [submitting, setSubmitting] = React.useState(false);
	const [createDefaults, setCreateDefaults] = React.useState(true);
	const nameRef = React.useRef<HTMLInputElement>(null);

	// optional fields (persisted)
	const [description, setDescription] = React.useState("");
	const [color, setColor] = React.useState("#4f46e5"); // indigo default
	const [isFavorite, setIsFavorite] = React.useState(false);
	const [isArchived, setIsArchived] = React.useState(false);
	const [tags, setTags] = React.useState(""); // comma-separated

	// presets helper
	const applyTemplate = (name: string, members?: string) => {
		if (nameRef.current) nameRef.current.value = name;
		const m = document.getElementById("members") as HTMLInputElement | null;
		if (m && members) m.value = members;
	};

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (submitting) return;

		const fd = new FormData(e.currentTarget);
		const title = (fd.get("title") as string)?.trim();
		const rawMembers = (fd.get("members") as string)?.trim();
		if (!title) {
			nameRef.current?.focus();
			return;
		}

		const memberIds = (rawMembers || "")
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		const parsedTags = tags
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		setSubmitting(true);
		try {
			// ---- 1) Create board with optional fields ----
			const nowISO = new Date().toISOString();
			const { data } = await client.mutate<{ createBoard: { id: string } }>({
				mutation: CREATE_BOARD,
				variables: {
					title,
					ownerId: userId,
					description: description.trim() || null,
					color: color || null,
					isFavorite,
					isArchived,
					tags: parsedTags.length ? parsedTags : null,
				},
				// IMPORTANT: include every field your CREATE_BOARD selection (or fragment) requests
				optimisticResponse: {
					createBoard: {
						__typename: "Board",
						id: "optimistic-board",
						title,
						ownerId: userId,
						members: [],
						description: description.trim() || null,
						color: color || null,
						isFavorite,
						isArchived,
						tags: parsedTags,
						createdAt: nowISO,
						updatedAt: nowISO,
						// if your CREATE_BOARD selection includes columns {...}, return an empty list
						columns: [], // [] is valid and prevents "Missing field 'columns'" warnings
					},
				},
			});

			const newBoardId = data?.createBoard?.id;
			if (!newBoardId) {
				router.replace("/");
				return;
			}

			// ---- 2) Optional default columns ----
			if (createDefaults) {
				const colNowISO = new Date().toISOString();
				for (const colTitle of ["Backlog", "In Progress", "Done"]) {
					await client.mutate({
						mutation: ADD_COLUMN,
						variables: { boardId: newBoardId, title: colTitle },
						// IMPORTANT: include every field your Column fragment asks for
						optimisticResponse: {
							addColumn: {
								__typename: "Column",
								id: `${newBoardId}-${colTitle}-temp`,
								boardId: newBoardId,
								title: colTitle,
								order: 999,
								// new extended fields on Column:
								description: null,
								startDate: null,
								endDate: null,
								status: null,
								createdAt: colNowISO,
								updatedAt: colNowISO,
								// cards list (likely included in your fragment)
								cards: [], // if CardFields fragment is spread, this can be []
							},
						},
					});
				}
			}

			// ---- 3) Optional invites ----
			for (const memberUserId of memberIds) {
				await client.mutate({
					mutation: INVITE_MEMBER,
					variables: { boardId: newBoardId, memberUserId },
					// Keep the selection for INVITE_MEMBER minimal on the GQL side if possible:
					// e.g. mutation InviteMember { inviteMember(boardId:..., memberUserId:...) { id members updatedAt } }
					optimisticResponse: {
						inviteMember: {
							__typename: "Board",
							id: newBoardId,
							members: memberIds, // or [...prevMembers, ...newOnes] if you track prev
							updatedAt: new Date().toISOString(),
						},
					},
				});
			}

			// ---- 4) Navigate to the new board ----
			router.replace(`/boards/${newBoardId}`);
		} catch (err) {
			console.error(err);
			router.replace("/");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open>
			<DialogContent
				className="h-screen min-w-screen max-w-none rounded-none border-0 p-0"
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
			>
				{/* Responsive split: column on mobile, row on lg+ */}
				<div className="flex h-full flex-col lg:flex-row">
					{/* Left: presets & instructions */}
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

							<ul className="space-y-2 text-sm">
								<li className="flex items-center gap-2">
									<Users className="size-4" />
									Invite by user ID (optional)
								</li>
								<li className="flex items-center gap-2">
									<Boxes className="size-4" />
									Toggle default columns any time
								</li>
							</ul>
						</div>
						<div className="border-t border-white/10 px-6 py-4 text-xs text-indigo-100/70">
							Pro tip: you can rename or reorder columns later.
						</div>
					</aside>

					{/* Right: form */}
					<main className="flex flex-1 flex-col bg-muted/30">
						<div className="flex items-center justify-between border-b px-6 py-4">
							<DialogHeader className="space-y-0.5">
								<DialogTitle className="text-lg font-semibold">
									Create a new project
								</DialogTitle>
								<DialogDescription className="text-xs text-muted-foreground">
									Name it, invite teammates, and choose defaults.
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
									value={description}
									onChange={(e) => setDescription(e.target.value)}
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
											value={color}
											onChange={(e) => setColor(e.target.value)}
											disabled={submitting}
											className="h-10 w-16 p-1"
											title={color}
										/>
										<Input
											value={color}
											onChange={(e) => setColor(e.target.value)}
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
										value={tags}
										onChange={(e) => setTags(e.target.value)}
										disabled={submitting}
									/>
								</div>
							</div>

							{/* Members */}
							<div className="space-y-2">
								<Label htmlFor="members">Invite members (user IDs)</Label>
								<Input
									id="members"
									name="members"
									placeholder="comma-separated, e.g. u_123, u_456"
									disabled={submitting}
								/>
								<p className="text-xs text-muted-foreground">
									Use IDs your backend recognizes. You can invite more later.
								</p>
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
										checked={isFavorite}
										onCheckedChange={setIsFavorite}
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
										checked={isArchived}
										onCheckedChange={setIsArchived}
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
									checked={createDefaults}
									onCheckedChange={setCreateDefaults}
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
