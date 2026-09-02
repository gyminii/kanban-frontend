"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const SITE_KEY = "0x4AAAAAAEkz76-fqW8tgJlM";

declare global {
	interface Window {
		turnstile?: {
			render: (
				container: HTMLElement,
				options: { sitekey: string; action: string }
			) => string;
			reset: (widgetId: string) => void;
			remove: (widgetId: string) => void;
		};
	}
}

// Renders explicitly so the widget also appears after client-side navigation,
// when the script has already loaded. Turnstile injects a hidden
// `cf-turnstile-response` input into the container, so the enclosing form's
// FormData carries the token. Bump `resetKey` after each submission because
// tokens are single-use.
export function Turnstile({
	action,
	resetKey,
}: {
	action: string;
	resetKey: number;
}) {
	const container = useRef<HTMLDivElement>(null);
	const widgetId = useRef<string | null>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (!ready || !container.current || widgetId.current) return;
		widgetId.current = window.turnstile!.render(container.current, {
			sitekey: SITE_KEY,
			action,
		});
		return () => {
			if (widgetId.current) window.turnstile?.remove(widgetId.current);
			widgetId.current = null;
		};
	}, [ready, action]);

	useEffect(() => {
		if (resetKey && widgetId.current) window.turnstile?.reset(widgetId.current);
	}, [resetKey]);

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
