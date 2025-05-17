// src/store/system/index.store.ts
import { defineStore } from 'pinia';
import { reactive, toRefs, watch } from 'vue';
import { constantRoutes, developmentRoutes } from '@/router';
import { systemConfig } from '@/_utils/config/system';
import { setSystemConfig } from '@/_utils/cache/system-storage';
import { SystemConfig } from '@/_utils/config/system';
import type { RouteRecordRaw } from 'vue-router';

/**
 * Erweiterung des SystemConfig um dynamische Routenlisten
 */
type State = SystemConfig & {
	routes: RouteRecordRaw[];
};

/**
 * Methoden des System-Stores
 */
type Actions = {
	getCacheData: () => SystemConfig;
	setRoutes: () => void;
};

/**
 * Pinia-Store für Layout-Einstellungen.
 * Nutzt ein `reactive` Objekt und `toRefs`, um Typensicherheit und Reaktivität zu gewährleisten.
 */
export const useSystemStore = defineStore('system', () => {
	// Reaktiver State basierend auf der aktuellen Layout-Konfiguration
	const state = reactive<State>({
		...systemConfig,
		routes: [],
		loading: false,
	});

	// Watcher: Bei jeglicher Änderung im State (deep) speichere aktualisierte Konfig
	watch(
		() => ({
			loading: state.loading,
			version: state.version,
			logging: state.logging,
			wlan: { savedNetworks: state.wlan.savedNetworks },
			serial: state.serial,
		}),
		(newVal) => {
			setSystemConfig({ ...newVal });
		},
		{ deep: true }
	);

	// Wandelt alle State-Properties in Ref-Objekte um
	const refs = toRefs(state);

	/**
	 * Getter: Gibt ein flaches Objekt aller aktuellen Systems zurück.
	 */
	function getCacheData(): SystemConfig {
		return {
			loading: state.loading,
			version: state.version,
			logging: state.logging,
			wlan: state.wlan,
			serial: state.serial,
		};
	}

	function setRoutes() {
		const all = [...constantRoutes, ...developmentRoutes];

		const flatten = (routes: RouteRecordRaw[]): RouteRecordRaw[] =>
			routes.flatMap((route) => {
				const children = route.children ? flatten(route.children) : [];
				return [route, ...children];
			});

		state.routes = flatten(all);
	}

	// Statt `...toRefs(state)` explizit zurückgeben:
	const { loading, version, logging, wlan } = toRefs(state);

	// Exportiere jede Property als Ref plus den Getter
	return {
		loading,
		version,
		logging,
		wlan,
		serial: toRefs(state).serial,
		routes: toRefs(state).routes,
		showLogo: toRefs(state as any).showLogo, // oder sicherer: vorher casten
		getCacheData,
		setRoutes,
	};
});
