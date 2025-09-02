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

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
	const json = (await req.json()) as unknown;
	if (!isContactPayload(json)) {
		return NextResponse.json(
			{ ok: false, error: "Invalid payload." },
			{ status: 400 }
		);
	}

	const { name, email, message } = json;

	const { error } = await resend.emails.send({
		from: process.env.MAIL_FROM ?? "Tyra Contact <noreply@your-domain.com>",
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
