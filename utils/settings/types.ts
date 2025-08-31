export type ThemeSetting = "light" | "dark";

export type UserSettings = {
	theme: "light" | "dark";
	lastBoardId: string | null;
	isSidebarOpen: boolean;
};
