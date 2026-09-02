import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type ContactPayload = {
	name: string;
	email: string;
	message: string;
};

function isContactPayload(v: unknown): v is ContactPayload {
	if (typeof v !== "object" || v === null) return false;
	const o = v as Record<string, unknown>;
	return (
		typeof o.name === "string" &&
		o.name.trim() !== "" &&
		typeof o.email === "string" &&
		/^\S+@\S+\.\S+$/.test(o.email) &&
		typeof o.message === "string" &&
		o.message.trim() !== ""
	);
}

const TURNSTILE_ACTION = "contact";

async function isHumanRequest(
	token: unknown,
	clientIp: string | null
): Promise<boolean> {
	const expectedHostnames = new Set(
		(process.env.TURNSTILE_HOSTNAMES ?? "")
			.split(",")
			.map((hostname) => hostname.trim())
			.filter(Boolean)
	);
	if (
		typeof token !== "string" ||
		token.length === 0 ||
		token.length > 2048 ||
		expectedHostnames.size === 0
	) {
		return false;
	}

	let result: { success?: boolean; action?: string; hostname?: string };
	try {
		const res = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				signal: AbortSignal.timeout(10_000),
				body: new URLSearchParams({
					secret: process.env.TURNSTILE_SECRET ?? "",
					response: token,
					...(clientIp ? { remoteip: clientIp } : {}),
				}),
			}
		);
		if (!res.ok) return false;
		result = await res.json();
	} catch {
		return false;
	}

	return (
		result.success === true &&
		result.action === TURNSTILE_ACTION &&
		expectedHostnames.has(result.hostname ?? "")
	);
}

export async function POST(req: NextRequest) {
	const json = (await req.json()) as unknown;
	if (!isContactPayload(json)) {
		return NextResponse.json(
			{ ok: false, error: "Invalid payload." },
			{ status: 400 }
		);
	}

	const human = await isHumanRequest(
		(json as Record<string, unknown>).turnstileToken,
		req.headers.get("cf-connecting-ip")
	);
	if (!human) {
		return NextResponse.json(
			{ ok: false, error: "Verification failed. Please try again." },
			{ status: 403 }
		);
	}

	const { name, email, message } = json;

	const resend = new Resend(process.env.RESEND_API_KEY);

	const { error } = await resend.emails.send({
		from: process.env.MAIL_FROM ?? "Kanban Contact <noreply@your-domain.com>",
		to: process.env.MAIL_TO ?? "tyler7888@gmail.com",
		subject: `Kanban Contact — ${name}`,
		text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
		replyTo: email,
	});

	if (error) {
		console.error("[CONTACT] Resend error:", error);
		return NextResponse.json(
			{ ok: false, error: "Email failed to send." },
			{ status: 500 }
		);
	}

	return NextResponse.json({ ok: true });
}
