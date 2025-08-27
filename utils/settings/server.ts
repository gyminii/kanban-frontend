"use server";

import { cookies } from "next/headers";
import type { UserSettings } from "./types";

const COOKIE_NAME = "app_settings";
const DEFAULT_SETTINGS: UserSettings = {
	theme: "light",
	lastBoardId: null,
	leftSidebarOpen: true,
	rightSidebarOpen: false,
};

function parseSettings(value: string | undefined): UserSettings {
	if (!value) return DEFAULT_SETTINGS;
	try {
		const obj = JSON.parse(value);
		return {
			theme: obj.theme === "dark" ? "dark" : "light",
			lastBoardId: obj.lastBoardId ?? DEFAULT_SETTINGS.lastBoardId,
			leftSidebarOpen:
				typeof obj.leftSidebarOpen === "boolean"
					? obj.leftSidebarOpen
					: DEFAULT_SETTINGS.leftSidebarOpen,
			rightSidebarOpen:
				typeof obj.rightSidebarOpen === "boolean"
					? obj.rightSidebarOpen
					: DEFAULT_SETTINGS.rightSidebarOpen,
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
