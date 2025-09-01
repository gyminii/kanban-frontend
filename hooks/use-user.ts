"use client";

import { use, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

export function useUser() {
	const userPromise = useMemo(
		() => supabase.auth.getUser().then(({ data }) => data.user),
		[]
	);
	const user = use(userPromise);
	return { user, loading: false };
}
