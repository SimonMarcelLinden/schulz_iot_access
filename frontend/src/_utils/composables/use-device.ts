import { computed } from 'vue';
import { useAppStore } from '@/store/app';
import { DeviceEnum } from '@/_utils/constants/app-key';

/**
 * Geräteeigenschaften (mobile oder desktop)
 */
export function useDevice() {
	const appStore = useAppStore();

	const isMobile = computed(() => appStore.device === DeviceEnum.Mobile);
	const isDesktop = computed(() => appStore.device === DeviceEnum.Desktop);

	return {
		isMobile,
		isDesktop,
	};
}
