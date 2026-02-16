export function formatDateToLocal(dateStr: string): string {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}