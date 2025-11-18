"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateCardDialog from "./dialogs/create-card-dialog";
import CreateDemoCardDialog from "./dialogs/create-demo-card-dialog";
import { useState } from "react";
import { useDemoStore } from "@/utils/demo/store";

type Props = {
	columnId: string;
	nextOrder: number;
};

export default function NewCardButton({ columnId, nextOrder }: Props) {
	const isDemo = useDemoStore((state) => state.isDemo);
	const [open, setOpen] = useState(false);

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

			{isDemo ? (
				<CreateDemoCardDialog
					open={open}
					onOpenChange={setOpen}
					columnId={columnId}
				/>
			) : (
				<CreateCardDialog
					open={open}
					onOpenChange={setOpen}
					columnId={columnId}
					nextOrder={nextOrder}
				/>
			)}
		</>
	);
}
