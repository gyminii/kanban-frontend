// components/ui/LoadingSpinner.tsx

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
	className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
	return (
		<div className="flex w-full justify-center py-6">
			<Loader2
				className={cn("h-8 w-8 text-indigo-500 animate-spin", className)}
			/>
		</div>
	);
}
