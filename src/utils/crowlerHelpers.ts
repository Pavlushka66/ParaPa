import { ICookie } from "models/cookie";

export function formatCookies(cookies: ICookie[] | undefined): string {
    return cookies !== undefined
        ? cookies.map(c => `${c.name}=${c.value}`).join(";")
        : "";
}