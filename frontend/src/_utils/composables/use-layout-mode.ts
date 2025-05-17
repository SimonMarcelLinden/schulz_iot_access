import { computed } from 'vue';
import { useAppStore } from '@/store/app';
import { LayoutModeEnum } from '@/_utils/constants/app-key';

/**
 * Layout-Modus (links / oben / kombiniert)
 */
export function useLayoutMode() {
	const appStore = useAppStore();

	const isTop = computed(() => appStore.layout === LayoutModeEnum.Top);

	function setLayoutMode(mode: LayoutModeEnum) {
		appStore.layout = mode;
	}

	return {
		isTop,
		setLayoutMode,
	};
}
