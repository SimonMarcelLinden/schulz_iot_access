// src/layouts/composables/use-resize.ts

import { onBeforeMount, onMounted, onBeforeUnmount } from "vue";
import { useAppStore } from "@/store/app.store";
import { useRouteListener } from "@/_utils/composables/useRouteListener";
import { DeviceEnum } from "@/_utils/constants/app-key";

/**
 * Maximale Breite für mobile Geräte
 */
const MAX_MOBILE_WIDTH = 992;

/**
 * Passt das Layout je nach Browserbreite dynamisch an
 */
export function useResize(): void {
	const appStore = useAppStore();
	const { listenerRouteChange } = useRouteListener();

	// Reactive flag
	const isMobileRef = ref(false);

	const isMobile = (): boolean => {
		const rect = document.body.getBoundingClientRect();
		return rect.width - 1 < MAX_MOBILE_WIDTH;
	};

	const resizeHandler = (): void => {
		const mobile = isMobile();
		isMobileRef.value = mobile;
		if (!document.hidden) {
			appStore.toggleDevice(mobile ? DeviceEnum.Mobile : DeviceEnum.Desktop);
			if (mobile) appStore.closeNavbar(true);
		}
	};

	listenerRouteChange(() => {
		if (appStore.device === DeviceEnum.Mobile && appStore.navbar.opened) {
			appStore.closeNavbar(false);
		}
	});

	onBeforeMount(() => {
		window.addEventListener("resize", resizeHandler);
	});

	onMounted(() => {
		resizeHandler();
		if (isMobile()) {
			appStore.toggleDevice(DeviceEnum.Mobile);
			appStore.closeNavbar(true);
		}
	});

	onBeforeUnmount(() => {
		window.removeEventListener("resize", resizeHandler);
	});
}
