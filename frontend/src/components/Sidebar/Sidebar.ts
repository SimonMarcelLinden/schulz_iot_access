/**
 * @module Sidebar
 * @component
 * @file Sidebar.vue (Composition API mit vue-class-component-Stil)
 * @brief Navigations-Seitenleiste mit dynamischen Routen, DevMode-Klicksystem und Gruppierung.
 *
 * Diese Komponente zeigt die Sidebar-Navigation an, basierend auf den Routen im systemStore.
 * Sie unterstützt einen versteckten "DevMode", der durch mehrfaches Klicken aktiviert werden kann.
 *
 * Verwendete Features:
 * - Dynamisches Filtern und Gruppieren von Routen
 * - Anzeige nur "sichtbarer" Routen (abhängig von `meta.hidden` / `meta.dev`)
 * - CSS-Helfer für visuelle Markierung der aktiven Route
 * - DevMode durch 6 Klicks in < 1.5 Sekunden aktivierbar
 * - Integration von App-Store und System-Store
 * - Nutzung von `useToast()` für visuelle Rückmeldungen
 *
 * @author Simon Marcel Linden
 * @since 1.0.0
 */

import { defineComponent, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// Stores
import { useAppStore } from '@/store/app';
import { useSystemStore } from '@/store/system/index';

// Composables
import { useToast } from '@/_utils/composables/use-toast';

// Components
import Logo from '@/components/logo/logo.vue';

/**
 * Typ für gruppierte Routen in der Sidebar.
 */
interface RouteGroup {
	group: string;
	items: RouteRecordRaw[];
}

export default defineComponent({
	name: 'Sidebar',
	components: {
		Logo,
	},
	setup() {
		/** @section App-State */

		/// Zugriff auf globalen App-Store (z. B. für Navbar-State)
		const appStore = useAppStore();
		const appTitle = import.meta.env.VITE_APP_TITLE;

		/// `true`, wenn Sidebar eingeklappt ist (Navbar geschlossen)
		const isCollapse = computed(() => !appStore.navbar.opened);

		/** @section System-State */
		const systemStore = useSystemStore();

		/** @section Routing und DevMode */
		const route = useRoute();
		const { showToast } = useToast();

		/// Klick-Zähler zur Aktivierung des DevMode
		const clickCount = ref(0);

		/// Flag: DevMode aktiviert
		const devMode = ref(false);

		let resetTimer: ReturnType<typeof setTimeout> | null = null;
		const REQUIRED_CLICKS = 6;
		const TIMEOUT_MS = 1500;

		/**
		 * @brief Event-Handler zum Aktivieren des DevMode per Mehrfachklick.
		 * @param e Maus-Event
		 */
		function onDevClick(e: MouseEvent) {
			if ((e.target as HTMLElement).closest('a')) return;
			if (devMode.value) return;

			clickCount.value++;

			if (resetTimer) {
				clearTimeout(resetTimer);
			}

			resetTimer = setTimeout(() => {
				clickCount.value = 0;
				resetTimer = null;
			}, TIMEOUT_MS);

			const remaining = REQUIRED_CLICKS - clickCount.value;
			if (clickCount.value >= REQUIRED_CLICKS) {
				devMode.value = true;
				if (resetTimer) {
					clearTimeout(resetTimer);
					resetTimer = null;
				}
				showToast({
					key: 'dev-mode',
					message: `Dev-Mode aktiviert!`,
					type: 'success',
					position: 'bottom-center',
					duration: TIMEOUT_MS,
				});
			} else {
				showToast({
					key: 'dev-mode',
					message: `Noch ${remaining} Klick(s) bis Dev-Mode!`,
					type: 'info',
					position: 'bottom-center',
					duration: TIMEOUT_MS,
				});
			}
		}

		/** @section Routing und Darstellung */

		/**
		 * @brief Gefilterte Routen, abhängig vom DevMode.
		 * @returns Nur sichtbare Routen, außer im DevMode
		 */
		const filteredRoutes = computed<RouteRecordRaw[]>(() => {
			if (devMode.value) {
				return systemStore.routes;
			}
			return systemStore.routes.filter((r) => !r.meta?.hidden && !r.meta?.dev);
		});

		/**
		 * @brief Gruppiert die gefilterten Routen nach `meta.group`.
		 * @returns Array mit Gruppenstruktur
		 */
		const sortedRoutes = computed<RouteGroup[]>(() => {
			const map = new Map<string, RouteRecordRaw[]>();
			for (const r of filteredRoutes.value) {
				const grp = typeof r.meta?.group === 'string' ? r.meta.group : '';
				if (!map.has(grp)) map.set(grp, []);
				map.get(grp)!.push(r);
			}
			const result: RouteGroup[] = [];
			if (map.has('')) {
				result.push({ group: '', items: map.get('')! });
			}
			for (const [group, items] of map.entries()) {
				if (group) {
					result.push({ group, items });
				}
			}
			return result;
		});

		/** @section CSS-Klassen für Navigation */

		/**
		 * @brief Liefert CSS-Klassen für einen Link.
		 * @param r Route-Eintrag
		 * @returns Klassen-String
		 */
		function linkClasses(r: RouteRecordRaw) {
			const base = 'bg-white ease-soft-in-out flex items-center mx-4 my-0 px-4 py-2 text-sm transition-all whitespace-nowrap';
			const active = 'active xl:shadow-soft-xl rounded-lg font-semibold text-slate-700';
			return route.path === r.path ? `${base} ${active}` : base;
		}

		/**
		 * @brief Liefert Klassen für das Wrapper-Icon.
		 * @param r Route-Eintrag
		 * @returns Klassen-String
		 */
		function iconWrapperClasses(r: RouteRecordRaw) {
			const base = 'shadow-soft-2xl mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white';
			const active = 'stroke-none shadow-soft-sm bg-gradient-to-tl from-blue-700 to-blue-500 p-2.5 text-white';
			return route.path === r.path ? `${base} ${active}` : base;
		}

		// Exporte nach außen
		return {
			appTitle,
			isCollapse,
			sortedRoutes,
			linkClasses,
			iconWrapperClasses,
			devMode,
			onDevClick,
		};
	},
});
