import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Sparkles,
	MousePointerClick,
	Columns3,
	StickyNote,
	Undo2,
	ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
	title: "Try Kanban Demo",
	description:
		"Try out the kanban board features without signing up - drag and drop cards, create columns, and more!",
};

export default function DemoPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
			<div className="container mx-auto px-4 py-16">
				{/* Header */}
				<div className="text-center mb-12">
					<div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 mb-4">
						<Sparkles className="h-4 w-4" />
						Demo Mode
					</div>
					<h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
						Try Kanban Board
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						Experience the full power of our kanban board without signing up.
						Your changes are saved locally in your browser.
					</p>
				</div>

				{/* Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
					<FeatureCard
						icon={<MousePointerClick className="h-6 w-6" />}
						title="Drag & Drop"
						description="Move cards between columns with smooth drag-and-drop interactions"
					/>
					<FeatureCard
						icon={<Columns3 className="h-6 w-6" />}
						title="Create Columns"
						description="Organize your workflow by creating custom columns"
					/>
					<FeatureCard
						icon={<StickyNote className="h-6 w-6" />}
						title="Manage Cards"
						description="Create, edit, and organize cards to track your tasks"
					/>
					<FeatureCard
						icon={<Undo2 className="h-6 w-6" />}
						title="Undo Actions"
						description="Made a mistake? Undo card movements with one click"
					/>
					<FeatureCard
						icon={<Sparkles className="h-6 w-6" />}
						title="Customization"
						description="Change board colors and customize your workspace"
					/>
					<FeatureCard
						icon={<ArrowRight className="h-6 w-6" />}
						title="Full Features"
						description="Access all features available in the full version"
					/>
				</div>

				{/* CTA Section */}
				<div className="text-center max-w-2xl mx-auto">
					<Card className="border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
						<CardHeader>
							<CardTitle className="text-2xl">Ready to try it out?</CardTitle>
							<CardDescription className="text-base">
								Your demo data is saved in your browser, so you can come back
								and continue where you left off.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
							<Link href="/demo/board">
								<Button
									size="lg"
									className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
								>
									<Sparkles className="mr-2 h-5 w-5" />
									Launch Demo Board
								</Button>
							</Link>
							<Link href="/login">
								<Button
									size="lg"
									variant="outline"
									className="w-full sm:w-auto"
								>
									Sign Up for Full Access
								</Button>
							</Link>
						</CardContent>
					</Card>

					{/* Info note */}
					<p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
						No account required for the demo. Sign up to save your boards in the
						cloud and access them from any device.
					</p>
				</div>
			</div>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<Card className="border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
			<CardHeader>
				<div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
					{icon}
				</div>
				<CardTitle className="text-lg">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
		</Card>
	);
}
