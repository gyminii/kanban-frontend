"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateCardDialog from "./dialogs/create-card-dialog";

type Props = {
	columnId: string;
	nextOrder: number; // usually column.cards.length
};

export default function NewCardButton({ columnId, nextOrder }: Props) {
	const [open, setOpen] = React.useState(false);

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				className="w-full justify-center text-indigo-600 hover:text-indigo-700"
				onClick={() => setOpen(true)}
			>
				<Plus className="mr-1 h-4 w-4" />
				Add Card
			</Button>

			<CreateCardDialog
				open={open}
				onOpenChange={setOpen}
				columnId={columnId}
				nextOrder={nextOrder}
			/>
		</>
	);
}
