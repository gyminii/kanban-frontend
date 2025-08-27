export type ThemeSetting = "light" | "dark";

export type UserSettings = {
	theme: ThemeSetting;
	lastBoardId: string | null;
	leftSidebarOpen: boolean;
	rightSidebarOpen: boolean;
};
