import { defineComponent, computed, onMounted } from 'vue';

// Stores
import { useAppStore } from '@/store/app';

// Composables
import { useDevice } from '@/_utils/composables/use-device';

// Types

// Components
import Breadcrumb from '@/components/breadcrumb/breadcrumb.vue';
import Hamburger from '@/components/hamburger/hamburger.vue';

export default defineComponent({
	name: 'NavigationBar',
	components: { Breadcrumb, Hamburger },
	setup() {
		const appStore = useAppStore();
		const { isMobile } = useDevice();

		/** Seitenleiste umschalten */
		function toggleSidebar() {
			appStore.toggleNavbar(false);
		}

		return { appStore, isMobile, toggleSidebar };
	},
});
