import type { HttpMethod } from "$lib/types/http";

export const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS", "TRACE"] as const;

export const COLORS: Record<HttpMethod, string> = {
    GET: "#22c55e",
    POST: "#3b82f6",
    PUT: "#eab308",
    PATCH: "#a855f7",
    DELETE: "#ef4444",
    HEAD: "#06b6d4",
    OPTIONS: "#f97316",
    TRACE: "#94a3b8",
};
