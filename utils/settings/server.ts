"use server";

import { cookies } from "next/headers";
import type { UserSettings } from "./types";

const COOKIE_NAME = "app_settings";

const DEFAULT_SETTINGS: UserSettings = {
	theme: "light",
	lastBoardId: null,
	isSidebarOpen: true,
};

function parseSettings(value: string | undefined): UserSettings {
	if (!value) return DEFAULT_SETTINGS;
	try {
		const obj = JSON.parse(value);
		return {
			theme: obj.theme === "dark" ? "dark" : "light",
			lastBoardId: obj.lastBoardId ?? DEFAULT_SETTINGS.lastBoardId,
			isSidebarOpen:
				typeof obj.isSidebarOpen === "boolean"
					? obj.isSidebarOpen
					: DEFAULT_SETTINGS.isSidebarOpen,
		};
	} catch {
		return DEFAULT_SETTINGS;
	}
}

export async function getSettings(): Promise<UserSettings> {
	const store = await cookies();
	return parseSettings(store.get(COOKIE_NAME)?.value);
}

export async function setSettings(
	partial: Partial<UserSettings>
): Promise<UserSettings> {
	const store = await cookies();
	const current = parseSettings(store.get(COOKIE_NAME)?.value);
	const next: UserSettings = { ...current, ...partial };

	store.set(COOKIE_NAME, JSON.stringify(next), {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 60 * 60 * 24 * 180, // 180 days
	});

	return next;
}
