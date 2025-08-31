// components/kanban/board/board-menu.tsx
"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import EditBoardDialog from "../dialogs/edit-board-dialog";
import DeleteBoardDialog from "../dialogs/delete-board-dialog";
import { BoardT } from "./types"; // ← use your existing type

export default function BoardMenu({ board }: { board: BoardT }) {
	const [openEdit, setOpenEdit] = React.useState(false);
	const [openDelete, setOpenDelete] = React.useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="icon" className="h-9 w-9">
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuLabel>Board</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={() => setOpenEdit(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Edit board
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-red-600 focus:text-red-600"
						onSelect={() => setOpenDelete(true)}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete board…
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<EditBoardDialog
				open={openEdit}
				onOpenChange={setOpenEdit}
				board={board}
			/>
			<DeleteBoardDialog
				open={openDelete}
				onOpenChange={setOpenDelete}
				boardId={board.id}
				boardTitle={board.title}
			/>
		</>
	);
}
