"use client";

import { useApolloClient } from "@apollo/client/react";
import { toast } from "sonner";
import {
	Palette,
	Star,
	Archive,
	Hash,
	Tag,
	Check,
	Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { UPDATE_BOARD } from "@/graphql/board";

import type { BoardT } from "../kanban/types";
import { useEffect, useState } from "react";
import {
	DASHBOARD_BOARD_FIELDS,
	COLUMN_FIELDS,
	BOARD_FIELDS,
} from "@/graphql/fragments";

type Props = {
	open: boolean;
	onOpenChange: (v: boolean) => void;
	board: BoardT;
};

const SUGGESTED_COLORS = [
	"#4f46e5",
	"#22c55e",
	"#06b6d4",
	"#f97316",
	"#ef4444",
];

type FormState = {
	title: string;
	description: string;
	color: string;
	isFavorite: boolean;
	isArchived: boolean;
	tagsInput: string;
};

export default function EditBoardDialog({ open, onOpenChange, board }: Props) {
	const client = useApolloClient();
	const [submitting, setSubmitting] = useState(false);
	const boardId = board.id;
	const [form, setForm] = useState<FormState>({
		title: board.title ?? "",
		description: board.description ?? "",
		color: board.color ?? "",
		isFavorite: !!board.isFavorite,
		isArchived: !!board.isArchived,
		tagsInput: (board.tags ?? []).join(", "),
	});
	useEffect(() => {
		if (!open) return;
		setForm({
			title: board.title ?? "",
			description: board.description ?? "",
			color: board.color ?? "",
			isFavorite: !!board.isFavorite,
			isArchived: !!board.isArchived,
			tagsInput: (board.tags ?? []).join(", "),
		});
	}, [open, board]);
	function randomizeColor() {
		const pick =
			SUGGESTED_COLORS[Math.floor(Math.random() * SUGGESTED_COLORS.length)];
		setForm((f) => ({ ...f, color: pick }));
	}

	async function onSave() {
		if (submitting) return;
		setSubmitting(true);
		try {
			const parsedTags = form.tagsInput
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean);

			await client.mutate<{ updateBoard: BoardT }>({
				mutation: UPDATE_BOARD,
				variables: {
					boardId: boardId,
					title: form.title || null,
					description: form.description || null,
					color: form.color || null,
					isFavorite: form.isFavorite,
					isArchived: form.isArchived,
					tags: parsedTags.length ? parsedTags : null,
				},
				optimisticResponse: {
					updateBoard: {
						__typename: "Board",
						id: boardId,
						title: form.title,
						description: form.description,
						ownerId: board.ownerId,
						members: board.members ?? [],
						createdAt: board.createdAt,
						color: form.color || null,
						isFavorite: form.isFavorite,
						isArchived: form.isArchived,
						tags: parsedTags,
						updatedAt: new Date().toISOString(),
						columns: board.columns,
					},
				},
				update(cache, { data }) {
					console.log("--- Update function for UPDATE_BOARD started ---");
					const updatedBoard = data?.updateBoard;

					if (!updatedBoard) {
						console.warn(
							"Update function: No board data returned from mutation."
						);
						return;
					}

					console.log(
						"Writing to cache for BOARD_FIELDS fragment:",
						updatedBoard
					);
					cache.writeFragment({
						id: cache.identify({ __typename: "Board", id: updatedBoard.id }),
						fragment: BOARD_FIELDS,
						fragmentName: "BoardFields",
						data: updatedBoard,
					});
					console.log(
						"Writing to cache for DASHBOARD_BOARD_FIELDS fragment:",
						updatedBoard
					);
					cache.writeFragment({
						id: cache.identify({ __typename: "Board", id: updatedBoard.id }),
						fragment: DASHBOARD_BOARD_FIELDS,
						fragmentName: "DashboardBoardFields",
						data: {
							...updatedBoard,
							columns: updatedBoard.columns.map((col) =>
								cache.writeFragment({
									data: col,
									fragment: COLUMN_FIELDS,
									fragmentName: "ColumnFields",
								})
							),
						},
					});

					console.log("Board cache updated successfully.");
					console.log("--- Update function for UPDATE_BOARD finished ---");
				},
			});

			toast.success("Board updated");
			onOpenChange(false);
		} catch {
			toast.error("Failed to update board");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
			<DialogContent className="min-w-[50vw] max-w-none p-0">
				<div className="flex flex-col md:flex-row">
					{/* Left panel */}
					<div className="relative hidden md:flex md:basis-[40%] md:shrink-0">
						<div
							className="absolute inset-0"
							style={{
								background:
									"radial-gradient(120% 120% at 0% 0%, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0.06) 40%, transparent 70%)",
							}}
						/>
						<div className="relative z-10 flex h-full w-full flex-col justify-between p-6">
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<Sparkles className="h-5 w-5 opacity-80" />
									<h3 className="text-sm font-semibold">Board quick tips</h3>
								</div>
								<ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
									<li>Use a short, action-oriented title.</li>
									<li>Tags help filter across boards.</li>
									<li>Archived boards stay accessible in search.</li>
								</ul>
							</div>

							<div className="rounded-xl border bg-background/70 p-4 shadow-sm backdrop-blur">
								<div className="mb-3 flex items-center gap-2">
									<Palette className="h-4 w-4" />
									<span className="text-sm font-medium">Accent preview</span>
								</div>
								<div className="flex items-center gap-3">
									<div
										className="h-10 w-10 rounded-lg border"
										style={{ background: form.color || "#e5e7eb" }}
									/>
								</div>
								<div className="mt-2 text-xs text-muted-foreground">
									This color is used in headers, chips, or highlights.
								</div>
							</div>

							<div className="mt-4 flex flex-wrap gap-2">
								{SUGGESTED_COLORS.map((c) => (
									<button
										key={c}
										type="button"
										onClick={() => setForm((f) => ({ ...f, color: c }))}
										className="h-8 w-8 rounded-md border shadow-sm"
										style={{ background: c }}
										aria-label={`Use ${c}`}
										title={c}
									/>
								))}
								<Button
									variant="outline"
									size="sm"
									onClick={randomizeColor}
									className="ml-1"
								>
									Randomize
								</Button>
							</div>
						</div>
					</div>

					{/* Right form */}
					<div className="flex min-h-0 flex-1 flex-col">
						<DialogHeader className="px-8 pb-2 pt-6">
							<DialogTitle>Edit board</DialogTitle>
							<DialogDescription>
								Update basic settings for this board.
							</DialogDescription>
						</DialogHeader>

						<div className="min-h-0 flex-1 overflow-auto px-8 pb-6">
							<div className="mx-auto w-full max-w-[820px] space-y-5">
								{/* Title */}
								<div className="space-y-2">
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										value={form.title}
										onChange={(e) =>
											setForm((f) => ({ ...f, title: e.target.value }))
										}
										autoFocus
									/>
								</div>

								{/* Description */}
								<div className="space-y-2">
									<Label htmlFor="desc">Description</Label>
									<Textarea
										id="desc"
										rows={3}
										value={form.description}
										onChange={(e) =>
											setForm((f) => ({ ...f, description: e.target.value }))
										}
										placeholder="What is this board about?"
									/>
								</div>

								{/* Color + Toggles */}
								<div className="flex flex-col gap-4 sm:flex-row">
									{/* Color */}
									<div className="flex-1 space-y-2">
										<Label htmlFor="color" className="flex items-center gap-1">
											<Palette className="h-4 w-4 opacity-70" />
											Color
										</Label>
										<div className="flex items-center gap-2">
											<Input
												id="color"
												placeholder="indigo or #4f46e5"
												value={form.color}
												onChange={(e) =>
													setForm((f) => ({ ...f, color: e.target.value }))
												}
											/>
											<Input
												type="color"
												value={form.color || "#4f46e5"}
												onChange={(e) =>
													setForm((f) => ({ ...f, color: e.target.value }))
												}
												className="h-10 w-12 p-1"
												aria-label="Pick color"
											/>
										</div>
									</div>

									{/* Toggles */}
									<div className="flex-1">
										<div className="grid grid-cols-1 gap-3">
											<div className="flex items-center justify-between rounded-md border p-3">
												<div className="space-y-0.5">
													<Label className="cursor-pointer flex items-center gap-1">
														<Star className="h-4 w-4 opacity-70" />
														Favorite
													</Label>
													<p className="text-xs text-muted-foreground">
														Pin this board for quick access.
													</p>
												</div>
												<Switch
													checked={form.isFavorite}
													onCheckedChange={(v) =>
														setForm((f) => ({ ...f, isFavorite: v }))
													}
												/>
											</div>

											<div className="flex items-center justify-between rounded-md border p-3">
												<div className="space-y-0.5">
													<Label className="cursor-pointer flex items-center gap-1">
														<Archive className="h-4 w-4 opacity-70" />
														Archived
													</Label>
													<p className="text-xs text-muted-foreground">
														Hide this board from active lists.
													</p>
												</div>
												<Switch
													checked={form.isArchived}
													onCheckedChange={(v) =>
														setForm((f) => ({ ...f, isArchived: v }))
													}
												/>
											</div>
										</div>
									</div>
								</div>

								{/* Tags */}
								<div className="space-y-2">
									<Label htmlFor="tags" className="flex items-center gap-1">
										<Tag className="h-4 w-4 opacity-70" />
										Tags (comma-separated)
									</Label>
									<Input
										id="tags"
										value={form.tagsInput}
										onChange={(e) =>
											setForm((f) => ({ ...f, tagsInput: e.target.value }))
										}
										placeholder="kanban, weekly, team-a"
									/>
									<div className="mt-2 flex flex-wrap gap-1">
										{form.tagsInput
											.split(",")
											.map((t) => t.trim())
											.filter(Boolean)
											.slice(0, 10)
											.map((t) => (
												<span
													key={t}
													className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
												>
													<Hash className="h-3 w-3 opacity-70" />
													{t}
												</span>
											))}
									</div>
								</div>
							</div>
						</div>

						<DialogFooter className="gap-2 px-8 pb-6 pt-2">
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button
								onClick={onSave}
								disabled={submitting}
								className="bg-indigo-600 text-white hover:bg-indigo-700"
							>
								{submitting ? (
									<span className="inline-flex items-center gap-1">
										<Check className="h-4 w-4 animate-pulse" /> Saving…
									</span>
								) : (
									"Save"
								)}
							</Button>
						</DialogFooter>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
