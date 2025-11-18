"use client";

import { Button } from "@/components/ui/button";
import CreateColumnDialog from "@/components/dialogs/create-column-dialog";
import CreateDemoColumnDialog from "@/components/dialogs/create-demo-column-dialog";
import { useState } from "react";
import { useDemoStore } from "@/utils/demo/store";

export function NewColumnButton({
	boardId,
}: {
	boardId: string;
}) {
	const isDemo = useDemoStore((state) => state.isDemo);
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button
				onClick={() => setOpen(true)}
				className="bg-indigo-600 text-white hover:bg-indigo-700"
			>
				New Column
			</Button>
			{isDemo ? (
				<CreateDemoColumnDialog
					open={open}
					onOpenChange={setOpen}
				/>
			) : (
				<CreateColumnDialog
					boardId={boardId}
					open={open}
					onOpenChange={setOpen}
				/>
			)}
		</>
	);
}
