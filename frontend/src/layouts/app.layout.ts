import { defineComponent, defineAsyncComponent, computed, reactive, ref, type Ref, type DefineComponent } from 'vue';
// Stores
import { useAppStore } from '@/store/app';

// composables
import { useDevice } from '@/_utils/composables/use-device';

// Types

// Components
import NavigationBar from '@/components/navigation-bar/navigation-bar.vue';
import Sidebar from '@/components/sidebar/sidebar.vue';
import Footer from '@/components/footer/footer.vue';

type AppLayoutType = DefineComponent<{}, {}, {}>;

const AppLayout: AppLayoutType = defineComponent({
	name: 'AppLayout',
	components: {
		NavigationBar,
		Sidebar,
		Footer,
	},
	setup() {
		const { isMobile } = useDevice();

		const appStore = useAppStore();

		const hideNavbar = computed(() => !appStore.navbar.opened);
		const openNavbar = computed(() => appStore.navbar.opened);
		const animation = computed(() => appStore.navbar.animation);
		const mobile = isMobile;

		const layoutClasses = { hideNavbar, openNavbar, animation, mobile };

		function handleClickOutside() {
			appStore.closeNavbar(true);
		}

		return {
			layoutClasses,
			hideNavbar,
			openNavbar,
			animation,
			mobile,
			handleClickOutside,
		};
	},
});

export default AppLayout;
