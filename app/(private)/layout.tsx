import SidebarProvider from "@/components/sidebar/sidebar-provider";
import { ApolloProvider } from "@/utils/apollo/provider";
import { Toaster } from "sonner";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ApolloProvider>
			<SidebarProvider>
				<div className="flex flex-1 min-h-0 flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
					{children}
					<Toaster
						expand
						toastOptions={{
							unstyled: true,
							classNames: {
								// Base box with better contrast
								toast:
									"pointer-events-auto font-sans rounded-2xl border border-slate-200 dark:border-slate-800 " +
									"bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-foreground shadow-lg px-4 py-3 " +
									"flex items-center gap-3",
								// Icon + text
								icon:
									"inline-flex h-5 w-5 items-center justify-center rounded-full border " +
									"border-indigo-500 text-indigo-600 dark:text-indigo-400",
								title: "text-xs font-medium leading-none",
								description: "text-xs text-muted-foreground leading-snug",
								// Buttons
								actionButton:
									"ml-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline",
								closeButton:
									"ml-1 rounded-md p-1 text-muted-foreground hover:text-foreground",
								// Variants (border + text only; keep bg neutral)
								success: "border-indigo-500",
								warning: "border-amber-500 text-amber-700 dark:text-amber-300",
								error: "border-rose-500 text-rose-700 dark:text-rose-300",
								info: "border-sky-500 text-sky-700 dark:text-sky-300",
							},
						}}
					/>
				</div>
			</SidebarProvider>
		</ApolloProvider>
	);
}
