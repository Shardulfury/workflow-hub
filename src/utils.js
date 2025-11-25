import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function createPageUrl(pageName) {
    if (pageName === "Home") return "/";
    if (pageName.startsWith("Dashboard")) {
        return "/dashboard" + pageName.substring(9);
    }
    return "/";
}
