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
			"bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
		green:
			"bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
		red: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
		neutral:
			"bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
	} as const;
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${map[tone]}`}
		>
			{children}
		</span>
	);
}
