"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;
	const isDark = resolvedTheme === "dark";
	return (
		<Button
			type="button"
			aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			variant="outline"
			size="icon"
			className="rounded-md border-indigo-200 bg-white shadow-md backdrop-blur-md
             hover:bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950 dark:hover:bg-indigo-900"
		>
			{isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
		</Button>
	);
}
