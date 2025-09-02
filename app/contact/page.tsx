"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	HelpCircle,
	Mail,
	Github,
	Linkedin,
	LayoutGrid,
	Zap,
	Shield,
	Cloud,
	MoveHorizontal,
	CheckCircle2,
	ArrowLeft,
} from "lucide-react";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";

import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const supabase = createClient();
const userPromise = supabase.auth.getUser();
export default function ContactPage() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const {
		data: { user },
	} = use(userPromise);
	const email = user?.email;
	const name = user?.user_metadata?.full_name || user?.user_metadata?.name;
	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (loading) return;

		const form = e.currentTarget;
		const fd = new FormData(form);
		const getStr = (k: string): string =>
			typeof fd.get(k) === "string" ? (fd.get(k) as string) : "";

		const payload = {
			name: getStr("name"),
			email: getStr("email"),
			message: getStr("message"),
		};

		setLoading(true);

		try {
			toast.promise(
				(async () => {
					const res = await fetch("/api/contact", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(payload),
					});

					type ContactOk = { ok: true };
					type ContactErr = { ok: false; error?: string };
					type ContactResponse = ContactOk | ContactErr;

					const data: ContactResponse = await res.json();

					if (!res.ok || !data.ok) {
						// Throw to trigger the `error` toast below
						const msg =
							(!data.ok && data.error) ||
							res.statusText ||
							"Failed to send message.";
						throw new Error(msg);
					}

					// Side-effect on success (allowed inside the promise)
					form.reset();

					// Data returned here is passed to the `success` renderer
					return { name: payload.name };
				})(),
				{
					loading: "Sending...",
					success: ({ name }) =>
						`${
							name ? `${name}, y` : "Y"
						}our message was sent! I’ll get back to you soon.`,
					error: (err) =>
						err instanceof Error
							? err.message
							: "Something went wrong. Please try again.",
				}
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="relative min-h-screen overflow-hidden">
			<div className="absolute top-4 left-4 z-10">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.back()}
					className="flex items-center gap-2 text-muted-foreground hover:text-indigo-500"
				>
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>
			</div>
			<div className="relative flex min-h-screen items-center justify-center p-6">
				<div className="w-full max-w-6xl">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-stretch">
						{/* LEFT: App info / marketing panel */}
						<Card className="border-indigo-500/20 shadow-lg flex flex-col">
							<CardHeader className="space-y-2 pb-4">
								<div className="flex items-center gap-2">
									<div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500 text-white">
										<LayoutGrid className="h-5 w-5" />
									</div>
									<div>
										<CardTitle className="leading-tight">
											Kanban — Dynamic board
										</CardTitle>
										<p className="text-xs text-muted-foreground">
											Organize work. Ship faster. Stay in flow.
										</p>
									</div>
								</div>
							</CardHeader>

							<CardContent className="space-y-6 flex-1">
								<p className="text-sm text-muted-foreground">
									Kanban is a lightweight, real-time board built with Next.js,
									Apollo, and a Python/Strawberry back end. It&apos;s tuned for
									speed, clarity, and a clean indigo aesthetic across dark &amp;
									light themes.
								</p>

								{/* Feature bullets */}
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
										<div className="min-w-0">
											<p className="text-sm font-medium">
												Fast, fluid interactions
											</p>
											<p className="text-xs text-muted-foreground">
												Optimistic UI, drag-and-drop, and snappy cache updates.
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Cloud className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
										<div className="min-w-0">
											<p className="text-sm font-medium">Cloud-ready</p>
											<p className="text-xs text-muted-foreground">
												Supabase auth, R2/CDN assets, and API-first GraphQL.
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
										<div className="min-w-0">
											<p className="text-sm font-medium">Private by design</p>
											<p className="text-xs text-muted-foreground">
												Auth-guarded boards and server-side enforcement.
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<MoveHorizontal className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
										<div className="min-w-0">
											<p className="text-sm font-medium">Kanban that adapts</p>
											<p className="text-xs text-muted-foreground">
												Columns, tags, and board-level metadata you control.
											</p>
										</div>
									</div>
								</div>

								<Separator />

								{/* Stats grid */}
								<div className="grid grid-cols-3 gap-3 text-center">
									<div className="rounded-lg border bg-card p-3">
										<p className="text-xl font-semibold">3</p>
										<p className="text-[10px] text-muted-foreground">
											Avg Columns / Board
										</p>
									</div>
									<div className="rounded-lg border bg-card p-3">
										<p className="text-xl font-semibold">0ms*</p>
										<p className="text-[10px] text-muted-foreground">
											Perceived UI Lag (opt.)
										</p>
									</div>
									<div className="rounded-lg border bg-card p-3">
										<p className="text-xl font-semibold">∞</p>
										<p className="text-[10px] text-muted-foreground">
											Scalable Cards
										</p>
									</div>
								</div>

								{/* FAQ */}
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Badge
											variant="outline"
											className="border-indigo-500/40 text-indigo-500"
										>
											<HelpCircle className="mr-1 h-3.5 w-3.5" /> FAQ
										</Badge>
										<span className="text-xs text-muted-foreground">
											Quick answers
										</span>
									</div>
									<Accordion type="single" collapsible className="w-full">
										<AccordionItem value="1">
											<AccordionTrigger className="text-sm">
												Can I import tasks from another tool?
											</AccordionTrigger>
											<AccordionContent className="text-sm text-muted-foreground">
												CSV import is in progress. For now, you can create
												boards/columns and paste tasks—contact me for early
												access.
											</AccordionContent>
										</AccordionItem>
										<AccordionItem value="2">
											<AccordionTrigger className="text-sm">
												Is there a roadmap?
											</AccordionTrigger>
											<AccordionContent className="text-sm text-muted-foreground">
												Yes! Themes, keyboard shortcuts, and analytics are next.
												Your feedback steers priorities.
											</AccordionContent>
										</AccordionItem>
									</Accordion>
								</div>

								{/* CTA strip */}
								<div className="flex items-center justify-between rounded-lg border bg-card/60 p-3">
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-4 w-4 flex-shrink-0 text-indigo-500" />
										<p className="text-xs text-muted-foreground">
											Have a feature request?
										</p>
									</div>
									<Link href="#contact-form">
										<Button
											size="sm"
											className="bg-indigo-600 hover:bg-indigo-600/90"
										>
											Share it
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>

						{/* RIGHT: Contact form */}
						<Card
							id="contact-form"
							className="border-indigo-500/20 shadow-lg flex flex-col"
						>
							<CardHeader className="pb-4">
								<CardTitle className="text-indigo-500">Contact Me</CardTitle>
							</CardHeader>

							<CardContent className="flex-1 flex flex-col">
								{/* Form section - takes available space */}
								<form
									onSubmit={handleSubmit}
									className="flex-1 flex flex-col space-y-4"
								>
									<Input
										className="w-full"
										name="name"
										placeholder="Your Name"
										required
										defaultValue={name}
									/>
									<Input
										className="w-full"
										type="email"
										name="email"
										placeholder="Your Email"
										required
										defaultValue={email}
									/>
									<Textarea
										className="w-full flex-1 resize-none"
										name="message"
										placeholder="Your Message"
										required
									/>
									<Button
										type="submit"
										disabled={loading}
										className="w-full bg-indigo-600 hover:bg-indigo-600/90"
									>
										{loading ? "Sending..." : "Send Message"}
									</Button>
								</form>

								<Separator className="my-6" />

								{/* Contact info section - pinned to bottom */}
								<div className="space-y-3">
									<p className="text-sm text-muted-foreground">
										Or reach me directly:
									</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 flex-shrink-0 text-indigo-500" />
											<a
												href="mailto:tyler7888@gmail.com"
												className="text-sm hover:underline"
											>
												tyler7888@gmail.com
											</a>
										</div>
										<div className="flex items-center gap-2">
											<Github className="h-4 w-4 flex-shrink-0 text-indigo-500" />
											<a
												href="https://github.com/gyminii"
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm hover:underline"
											>
												github.com/gyminii
											</a>
										</div>
										<div className="flex items-center gap-2">
											<Linkedin className="h-4 w-4 flex-shrink-0 text-indigo-500" />
											<a
												href="https://www.linkedin.com/in/gyminii"
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm hover:underline"
											>
												linkedin.com/in/gyminii
											</a>
										</div>
									</div>

									<div className="rounded-lg border bg-card/60 p-3">
										<p className="text-xs text-muted-foreground">
											I usually reply within 24 hours. If it&apos;s urgent,
											include{" "}
											<span className="font-medium text-indigo-500">
												[Urgent]
											</span>{" "}
											in the subject.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
