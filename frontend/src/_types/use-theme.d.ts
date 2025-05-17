declare module "utils/composables/useTheme" {
	import type { Ref } from "vue";

	/** Standard-Themenname */
	export const DEFAULT_THEME_NAME: "normal";

	/** Definierte Theme-Namen */
	export type ThemeName = typeof DEFAULT_THEME_NAME | "dark" | "dark-blue";

	/** Struktur für die Themenliste */
	export interface ThemeList {
		title: string;
		name: ThemeName;
	}

	/** Liste der verfügbaren Themes */
	export const themeList: ThemeList[];

	/** Aktuell angewendetes Theme */
	export const activeThemeName: Ref<ThemeName>;

	/**
	 * Setzt das aktive Theme
	 * @param {ThemeName} value - Der neue Themenname
	 */
	export function setTheme(value: ThemeName): void;

	/**
	 * Fügt die entsprechende CSS-Klasse für das Theme zur `<html>`-Wurzel hinzu.
	 * @param {ThemeName} value - Der Name des Themes, das hinzugefügt werden soll.
	 */
	export function addHtmlClass(value: ThemeName): void;

	/**
	 * Entfernt alle anderen Theme-Klassen außer der angegebenen von der `<html>`-Wurzel.
	 * @param {ThemeName} value - Das aktuell ausgewählte Theme.
	 */
	export function removeHtmlClass(value: ThemeName): void;

	/**
	 * Initialisiert das Theme.
	 * Stellt sicher, dass das Theme beim Laden der Anwendung korrekt angewendet wird.
	 */
	export function initTheme(): void;

	/**
	 * Stellt das `useTheme` Composable bereit.
	 * @returns {object} Enthält `themeList`, `activeThemeName`, `initTheme` und `setTheme`.
	 */
	export function useTheme(): {
		themeList: ThemeList[];
		activeThemeName: Ref<ThemeName>;
		initTheme: () => void;
		setTheme: (value: ThemeName) => void;
	};
}
