export const formatDate = (iso?: string | null) =>
	iso ? new Date(iso).toLocaleDateString() : "—";
