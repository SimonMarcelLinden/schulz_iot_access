// src/router/index.ts

import { createRouter, RouterView, type RouteRecordRaw, NavigationGuard } from 'vue-router';
import { routerConfig } from '@/router/config';

import { setRouteChange } from '@/_utils/composables/use-route-listener';

// Components

// Layouts
import BasisLayout from '@/layouts/basis.layout.vue';
import BasisView from '@/views/basis/basis.view.vue';

// Pages
import Dashboard from '@/pages/dashboard/dashboard.vue';

import LogFiles from '@/pages/log-files/log-files.vue';
import SingleFile from '@/pages/log-files/single-file.vue';

import Settings from '@/pages/settings/settings.vue';

import AboutUs from '@/pages/about-us/about-us.vue';
import License from '@/pages/license/license.vue';

import { terminalDefs } from '@/router/terminal';

// 1) Terminal-Kind-Routen erzeugen
const terminalChildRoutes: RouteRecordRaw[] = terminalDefs.map((def) => ({
	path: `/type-${def.suffix}`, // relativ zu /terminal
	name: def.name,
	component: () =>
		import(
			/* webpackChunkName: "terminal-type-${def.suffix}" */
			`@/pages/Terminal/type-${def.suffix}/terminal-type-${def.suffix}.vue`
		),
	meta: {
		title: def.title,
		icon: 'fas fa-terminal',
		group: 'Devices',
	},
}));

// 2) Ein einziges Terminal-Group-Objekt
const terminalGroup: RouteRecordRaw = {
	path: 'terminal', // relativ zur Root-Children-Routes
	component: RouterView, // leeres <RouterView /> für die Kind-Komponenten
	meta: {
		title: 'Terminal',
		icon: 'fas fa-terminal',
		group: 'Devices',
		hidden: true,
	},
	children: terminalChildRoutes,
};

/**
 * Route configurations for the Vue application.
 *
 * This array defines all the basic routes for the application, including their paths, names,
 * components, and any associated metadata. Meta tags for pages and breadcrumb information
 * are defined within the meta property of each route.
 */

export const errorRoutes: RouteRecordRaw[] = [
	{
		path: '/403',
		component: BasisView,
		meta: {
			title: '403 - Forbidden',
			hidden: true,
		},
	},
	{
		path: '/:catchAll(.*)',
		name: 'NotFound',
		component: BasisView,
		meta: {
			title: '404 - Page not found',
			hidden: true,
		},
	},
];

export const constantRoutes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'Dashboard',
		component: Dashboard,
		meta: {
			title: 'IoT Dashboard',
			icon: 'fas fa-home',
			group: '',
		},
	},
	terminalGroup,
	{
		path: 'log',
		name: 'LogFiles',
		component: LogFiles,
		meta: {
			title: 'Log Files',
			icon: 'fas fa-file-alt',
			group: 'Settings',
		},
	},
	{
		path: 'settings',
		name: 'Settings',
		component: Settings,
		meta: {
			title: 'Settings',
			icon: 'fas fa-cog',
			group: 'Settings',
		},
	},
	{
		path: 'about-us',
		name: 'AboutUs',
		component: AboutUs,
		meta: {
			title: 'About Us',
			icon: 'fa-solid fa-users',
			group: 'Footer',
			hidden: true,
		},
	},
	{
		path: 'license',
		name: 'License',
		component: License,
		meta: {
			title: 'License',
			icon: 'fa-solid fa-file',
			group: 'Footer',
			hidden: true,
		},
	},
];

export const dynamicRoutes: RouteRecordRaw[] = [
	{
		path: 'log/:filename', // relativ
		name: 'SingleFile',
		component: SingleFile,
		meta: {
			title: 'Single Log File',
			breadcrumb: { parent: 'LogFiles' },
			hidden: true,
		},
	},
];

export const developmentRoutes: RouteRecordRaw[] = [
	{
		path: 'routes',
		name: 'RoutesPage',
		component: () => import('@/pages/routes/routes.vue'),
		meta: {
			title: 'Application Routes',
			hidden: true,
			dev: true,
		},
	},
];

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: BasisLayout,
		redirect: { name: 'Dashboard' },
		children: [...constantRoutes, ...dynamicRoutes, ...(process.env.NODE_ENV === 'development' ? developmentRoutes : [])],
	},
	...errorRoutes,
];

/**
 * Creates and configures the Vue Router instance.
 *
 * This configuration sets up the router with a history mode and the defined routes.
 * It also adds global navigation guards (middlewares) for handling authentication and meta information.
 *
 * @returns {Router} The configured Vue Router instance.
 */
export const router = createRouter({
	history: routerConfig.history,
	routes,
	linkActiveClass: 'active-link',
	linkExactActiveClass: 'exact-active-link',
});

/**
 * Global navigation guards (middlewares).
 *
 * These are applied before each route navigation to handle tasks such as authentication
 * checks and setting meta tags for the page.
 */
// const globalMiddlewares: NavigationGuard[] = [i18nGuard, AuthenticationGuard, MetaInfoGuard];
const globalMiddlewares: NavigationGuard[] = [];
router.beforeEach((to, from, next) => {
	if (globalMiddlewares.length === 0) {
		next();
		return;
	}

	for (const middleware of globalMiddlewares) {
		middleware(to, from, next);
	}
});

router.afterEach((to) => {
	setRouteChange(to);
});

export function resetRouter() {
	try {
		router.getRoutes().forEach((route) => {
			const { name } = route;

			if (name && router.hasRoute(name)) {
				router.removeRoute(name);
			}
		});
	} catch {
		location.reload();
	}
}
