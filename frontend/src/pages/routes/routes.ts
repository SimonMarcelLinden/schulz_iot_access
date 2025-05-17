import { defineComponent, computed } from 'vue'

import { router } from '@/router'
// Stelle sicher, dass der Pfad zu deiner Router-Instanz korrekt ist

// Components

export default defineComponent({
	name: 'RoutesdPage',
	components: {},
	setup() {
		const routes = computed(() =>
			router
				.getRoutes()
				.map((route) => ({
					name: route.name as string,
					path: route.path,
				}))
				.sort((a, b) => a.path.localeCompare(b.path)),
		)

		return {
			routes,
		}
	},
})
