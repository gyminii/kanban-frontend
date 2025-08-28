"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import CreateColumnDialog from "@/components/dialogs/create-column-dialog";

export function NewColumnButton({ boardId }: { boardId: string }) {
	const [open, setOpen] = React.useState(false);
	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				className="bg-indigo-600 text-white hover:bg-indigo-700"
			>
				New Column
			</Button>
			<CreateColumnDialog
				boardId={boardId}
				open={open}
				onOpenChange={setOpen}
			/>
		</>
	);
}
