// terminal.routes.ts
import type { RouteRecordRaw } from "vue-router";

interface TerminalDef {
	suffix: string; // z.B. "e", "f", "f-5.80", "h", ...
	name: string; // Name der Route und Komponente
	title: string; // Meta.title
	baudRate?: number; // optional, wenn ihr das braucht
}

export const terminalDefs: TerminalDef[] = [
	{ suffix: "e", name: "TerminalTypeE", title: "Type E" },
	{ suffix: "f", name: "TerminalTypeF", title: "Type F" },
	{ suffix: "f-580", name: "TerminalTypeF580", title: "Type F – ab v. 5.80" },
	{ suffix: "h", name: "TerminalTypeH", title: "Type H" },
	{ suffix: "h-180", name: "TerminalTypeH180", title: "Type H – ab v. 1.80" },
	{ suffix: "k", name: "TerminalTypeK", title: "Type K" },
	{ suffix: "k-di", name: "TerminalTypeKdi", title: "Type K-di" },
	{ suffix: "m", name: "TerminalTypeM", title: "Type M" },
];
