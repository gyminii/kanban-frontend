"use client";

export default function Pill({
	children,
	tone = "indigo",
}: {
	children: React.ReactNode;
	tone?: "indigo" | "green" | "red" | "neutral";
}) {
	const map = {
		indigo:
			"bg-primary/10 text-primary border-primary/20",
		green:
			"bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
		red: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
		neutral:
			"bg-secondary text-secondary-foreground border-border",
	} as const;
	return (
		<span
			className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${map[tone]}`}
		>
			{children}
		</span>
	);
}
