import { Badge } from "../ui/badge";

export default function TagCloudSection({
	tagCloud,
}: {
	tagCloud: [string, number][];
}) {
	if (tagCloud.length === 0) {
		return null;
	}
	return (
		<section className="rounded-2xl border shadow-md bg-gradient-to-b from-indigo-50/40 to-background dark:from-indigo-950/20 dark:to-card">
			<div className="px-4 py-3 border-b">
				<span className="text-sm font-semibold">Tags</span>
			</div>
			<div className="p-4 flex flex-wrap gap-2">
				{tagCloud.map(([tag, count]) => (
					<Badge
						key={tag}
						variant="outline"
						className="rounded-full"
						title={`${count} project${count === 1 ? "" : "s"}`}
					>
						{tag} <span className="ml-1 opacity-60">×{count}</span>
					</Badge>
				))}
			</div>
		</section>
	);
}
