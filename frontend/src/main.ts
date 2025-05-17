/**
 * Main entry point of the Vue application.
 *
 * Responsible for bootstrapping the Vue application, setting up the router and store,
 * applying global styles, logging build info and establishing the WebSocket connection.
 *
 * The WebSocket connection is used to retrieve various pieces of system state,
 * such as logging status, WLAN status, system version and available log files.
 */

import './assets/main.css';

import { createApp } from 'vue';
import { pinia } from '@/store/index';
import { usePWA } from './register-sw';

import App from './app.vue';
import { router } from './router';

// Services
import { SocketService } from './_service/socket';

// Stores
import { useSystemStore } from '@/store/system/index';

// Helpers and services
import { hookConsole } from '@/_utils/hooks/console-hock';

import '@/assets/main.css';

/**
 * Main entry point of the Vue application.
 *
 * This file is responsible for bootstrapping the Vue application.
 * It imports the main App component, as well as the router and store modules,
 * and then creates and mounts the Vue application.
 */

hookConsole();

/**
 * Import and initialize the Vue application.
 *
 * - `createApp` function from Vue is used to create a new Vue application instance.
 * - `App` is the root component of the application.
 * - `router` is the Vue Router instance for handling navigation.
 * - `store` is the Vuex store instance for state management.
 */
const app = createApp(App);

/**
 * Configure the application with plugins and global components.
 *
 * - `use` function is used to install plugins (router and store) into the Vue application.
 */
app.use(pinia);
app.use(router);

app.config.errorHandler = (err, vm, info) => {
	console.error('UNHANDLED VUE ERROR:', err, info);
};

/**
 * Mount the Vue application to a DOM element.
 *
 * - `mount` function is used to mount the Vue application to the DOM.
 * - Here, the application is mounted to the 'body' element.
 */
router.isReady().then(() => {
	app.mount('#app');
	SocketService.connect();
	const systemStore = useSystemStore();
	systemStore.setRoutes();

	usePWA();
});

document.addEventListener('DOMContentLoaded', () => {
	console.log('✅ Ready to take off 🚀');
});
