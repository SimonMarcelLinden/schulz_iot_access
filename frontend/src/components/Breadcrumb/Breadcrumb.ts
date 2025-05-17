/**
 * @module Breadcrumb
 * @component
 * @file Breadcrumb.vue
 * @brief Dynamische Brotkrumen-Navigation basierend auf der aktuellen Route.
 *
 * Die Komponente erzeugt eine Breadcrumb-Leiste aus der aktiven Route und deren Elternrouten.
 * Sie unterstützt benutzerdefinierte Titel (`meta.title`) und erlaubt über `meta.breadcrumb.parent`
 * eine rekursive Navigation über die Routen-Hierarchie.
 *
 * Zusätzlich wird bei bestimmten Routen (z. B. "SingleFile") der Breadcrumb-Text dynamisch
 * aus Routenparametern (z. B. `filename`) generiert.
 *
 * Die Breadcrumbs werden sowohl beim Mounten als auch nach jedem Routenwechsel aktualisiert.
 *
 * @example
 * ```vue
 * <Breadcrumb />
 * ```
 *
 * @author Simon Marcel Linden
 * @since 1.0.0
 */

import { defineComponent, ref, onMounted } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { useRoute, useRouter } from 'vue-router';

/**
 * Ein einzelner Breadcrumb-Eintrag.
 * @property text Anzeigename
 * @property to Pfad (z. B. `/projekt/abc`)
 */
type Crumb = { text: string; to: string };

export default defineComponent({
	name: 'Breadcrumb',
	setup() {
		/// Aktuelle Route (reagiert auf Änderungen)
		const route = useRoute();

		/// Router-Instanz für Navigation und Routensuche
		const router = useRouter();

		/// Liste aller Breadcrumb-Einträge
		const breadcrumbs = ref<Crumb[]>([]);

		/**
		 * @brief Sucht eine Route anhand ihres Namens.
		 * @param name Routenname
		 * @returns RouteRecordRaw oder undefined
		 */
		function findRoute(name: string): RouteRecordRaw | undefined {
			return router.getRoutes().find((r) => r.name === name) as RouteRecordRaw | undefined;
		}

		/**
		 * @brief Baut die Breadcrumb-Liste basierend auf den Eltern-Routen.
		 *
		 * Nutzt die `meta.breadcrumb.parent`-Eigenschaft, um rekursiv die Routenstruktur
		 * aufzubauen. Dabei wird `meta.title` als Text verwendet und bei dynamischen Pfaden
		 * (`:param`) automatisch substituiert.
		 */
		function buildCrumbs() {
			const chain: Crumb[] = [];
			let currentName = route.name as string | undefined;

			while (currentName) {
				const rr = findRoute(currentName);
				if (!rr || !rr.meta?.title) break;

				// 1a) Beschriftung: bei SingleFile den Dateinamen nehmen
				let text = (rr.meta as any).title as string;
				if (currentName === 'SingleFile' && route.params.filename) {
					text = String(route.params.filename);
				}

				// 1b) Link mit Params substituieren
				let to = rr.path;
				Object.entries(route.params).forEach(([key, val]) => {
					to = to.replace(`:${key}`, String(val));
				});

				chain.push({ text, to });

				// Nächste Elternebene
				currentName = (rr.meta as any).breadcrumb?.parent;
			}
			// 2) Umkehren, damit der allererste Eintrag oben steht
			breadcrumbs.value = chain.reverse();
		}

		/**
		 * @brief Navigiert zu einem bestimmten Pfad beim Klick auf ein Breadcrumb-Element.
		 * @param path Zielpfad
		 */
		function handleLink(path: string) {
			router.push(path);
		}

		// Lifecycle & Hooks

		/// Erster Aufbau beim Mounten der Komponente
		onMounted(buildCrumbs);

		/// Listener bei jedem Routenwechsel
		router.afterEach(buildCrumbs);

		return { breadcrumbs, handleLink };
	},
});
