"use client";

import * as React from "react";
import type { UserSettings } from "@/utils/settings/types";
import { setSettings as serverSetSettings } from "@/utils/settings/server";

type Ctx = {
	settings: UserSettings;
	update: (s: Partial<UserSettings>) => Promise<void>;
};

const SettingsContext = React.createContext<Ctx | null>(null);

export default function SettingsProvider({
	initial,
	children,
}: {
	initial: UserSettings;
	children: React.ReactNode;
}) {
	const [settings, setSettings] = React.useState<UserSettings>(initial);

	const update = React.useCallback(async (partial: Partial<UserSettings>) => {
		setSettings((prev) => ({ ...prev, ...partial }));
		try {
			await serverSetSettings(partial);
		} catch {
			/* ignore */
		}
	}, []);

	// Apply dark/light class
	React.useEffect(() => {
		const root = document.documentElement;
		if (settings.theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [settings.theme]);

	return (
		<SettingsContext.Provider value={{ settings, update }}>
			{children}
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	const ctx = React.useContext(SettingsContext);
	if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
	return ctx;
}
