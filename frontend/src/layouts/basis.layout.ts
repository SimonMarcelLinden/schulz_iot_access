import { defineComponent, defineAsyncComponent, ref, type Ref, type DefineComponent } from 'vue';

// Stores

// composables
import { useResize } from '@/layouts/composables/use-resize';

// Types

// Components
import Notifications from '@/components/notifications/notifications.vue';

// Templates
type BasisLayoutType = DefineComponent<{}, { isOnline: Ref<boolean> }, {}>;

const BasisLayout: BasisLayoutType = defineComponent({
	name: 'BasisLayout',
	components: {
		Notifications,
		NetworkStatusBanner: defineAsyncComponent(() => import('@/components/network-status-banner/network-status-banner.vue')),
		AppLayout: defineAsyncComponent(() => import('@/layouts/app.layout.vue')),
	},
	setup() {
		const isOnline = ref(navigator.onLine);
		useResize();
		return { isOnline };
	},
});

export default BasisLayout;
