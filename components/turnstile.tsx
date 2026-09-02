"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const SITE_KEY = "0x4AAAAAAEkz76-fqW8tgJlM";

declare global {
	interface Window {
		turnstile?: {
			render: (
				container: HTMLElement,
				options: {
					sitekey: string;
					action: string;
					appearance: "always" | "execute" | "interaction-only";
					size: "normal" | "flexible" | "compact";
					callback: (token: string) => void;
					"expired-callback": () => void;
					"error-callback": () => void;
				}
			) => string;
			reset: (widgetId: string) => void;
			remove: (widgetId: string) => void;
		};
	}
}

// Renders explicitly so the widget also appears after client-side navigation,
// when the script has already loaded. Bump `resetKey` after each submission
// because tokens are single-use.
export function Turnstile({
	action,
	resetKey,
	onToken,
}: {
	action: string;
	resetKey: number;
	onToken: (token: string | null) => void;
}) {
	const container = useRef<HTMLDivElement>(null);
	const widgetId = useRef<string | null>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (!ready || !container.current || widgetId.current) return;
		widgetId.current = window.turnstile!.render(container.current, {
			sitekey: SITE_KEY,
			action,
			appearance: "interaction-only",
			size: "flexible",
			callback: onToken,
			"expired-callback": () => onToken(null),
			"error-callback": () => onToken(null),
		});
		return () => {
			if (widgetId.current) window.turnstile?.remove(widgetId.current);
			widgetId.current = null;
		};
	}, [ready, action, onToken]);

	useEffect(() => {
		if (resetKey && widgetId.current) {
			window.turnstile?.reset(widgetId.current);
			onToken(null);
		}
	}, [resetKey, onToken]);

	return (
		<>
			<Script
				src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
				strategy="afterInteractive"
				onReady={() => setReady(true)}
			/>
			<div ref={container} />
		</>
	);
}
