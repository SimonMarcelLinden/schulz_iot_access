import { ref, watchEffect } from "vue";
import { getActiveThemeName, setActiveThemeName } from "@/_utils/cache/local-storage";

/** Standard-Themenname */
const DEFAULT_THEME_NAME = "normal" as const;

/** Definiert die verfügbaren Theme-Namen */
export type ThemeName = typeof DEFAULT_THEME_NAME | "dark" | "dark-blue";

/** Struktur für die Themenliste */
interface ThemeList {
	title: string;
	name: ThemeName;
}

/** Liste der verfügbaren Themes */
const themeList: ThemeList[] = [
	{ title: "Standard", name: DEFAULT_THEME_NAME },
	{ title: "Dunkel", name: "dark" },
	{ title: "Dunkelblau", name: "dark-blue" },
];

/** Aktuell angewendetes Theme */
/** FTodo: getActiveThemeName im localStorage abrufen */
const activeThemeName = ref<ThemeName>(getActiveThemeName() || DEFAULT_THEME_NAME);

/**
 * Setzt das aktive Theme
 * @param {ThemeName} value - Der neue Themenname
 */
function setTheme(value: ThemeName): void {
	activeThemeName.value = value;
}

/**
 * Fügt die entsprechende CSS-Klasse für das Theme zur `<html>`-Wurzel hinzu.
 * @param {ThemeName} value - Der Name des Themes, das hinzugefügt werden soll.
 */
function addHtmlClass(value: ThemeName): void {
	document.documentElement.classList.add(value);
}

/**
 * Entfernt alle anderen Theme-Klassen außer der angegebenen von der `<html>`-Wurzel.
 * @param {ThemeName} value - Das aktuell ausgewählte Theme.
 */
function removeHtmlClass(value: ThemeName): void {
	const otherThemeNames = themeList.map((item) => item.name).filter((name) => name !== value);
	document.documentElement.classList.remove(...otherThemeNames);
}

/**
 * Initialisiert das Theme.
 * Stellt sicher, dass das Theme beim Laden der Anwendung korrekt angewendet wird.
 */
function initTheme(): void {
	watchEffect(() => {
		const value = activeThemeName.value;
		removeHtmlClass(value);
		addHtmlClass(value);
		setActiveThemeName(value);
	});
}

/**
 * Stellt das `useTheme` Composable bereit.
 * @returns {object} Enthält `themeList`, `activeThemeName`, `initTheme` und `setTheme`.
 */
export function useTheme() {
	return { themeList, activeThemeName, initTheme, setTheme };
}
