"use client";

import type { UserSettings } from "@/utils/settings/types";
import { setSettings as serverSetSettings } from "@/utils/settings/server";
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

type Ctx = {
	settings: UserSettings;
	update: (s: Partial<UserSettings>) => Promise<void>;
};

const SettingsContext = createContext<Ctx | null>(null);

export default function SettingsProvider({
	initial,
	children,
}: {
	initial: UserSettings;
	children: ReactNode;
}) {
	const [settings, setSettings] = useState<UserSettings>(initial);

	const update = useCallback(async (partial: Partial<UserSettings>) => {
		setSettings((prev) => ({ ...prev, ...partial }));
		try {
			await serverSetSettings(partial);
		} catch {}
	}, []);

	useEffect(() => {
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

export function useSettings(): Ctx {
	const ctx = useContext(SettingsContext);
	if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
	return ctx;
}
