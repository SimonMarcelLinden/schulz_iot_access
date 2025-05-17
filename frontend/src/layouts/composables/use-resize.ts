import { onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import { useAppStore } from '@/store/app';
import { useRouteListener } from '@/_utils/composables/use-route-listener';
import { DeviceEnum } from '@/_utils/constants/app-key';

/** Angelehnt an Bootstraps Responsive-Design: maximale Breite für mobile Geräte = 992px */
const MAX_MOBILE_WIDTH = 992;

/**
 * @name Composable für Fenstergrößenänderungen
 * @description Passt das Layout je nach Browserbreite dynamisch an
 */
export function useResize() {
	const appStore = useAppStore();
	const { listenerRouteChange } = useRouteListener();

	// Prüft, ob es sich aktuell um ein mobiles Gerät handelt
	const isMobile = () => {
		const rect = document.body.getBoundingClientRect();
		return rect.width - 1 < MAX_MOBILE_WIDTH;
	};

	// Behandelt das Fenstergrößenänderungs-Ereignis
	const resizeHandler = () => {
		if (!document.hidden) {
			const _isMobile = isMobile();
			appStore.toggleDevice(_isMobile ? DeviceEnum.Mobile : DeviceEnum.Desktop);
			if (_isMobile) {
				appStore.closeNavbar(true);
			} else {
				appStore.navbar.opened = true;
			}
		}
	};

	// Reaktion auf Routenwechsel: Wenn mobil und Navbar offen, Navbar schließen
	listenerRouteChange(() => {
		if (appStore.device === DeviceEnum.Mobile && appStore.navbar.opened) {
			appStore.closeNavbar(false);
		}
	});

	// Vor dem Mount: Event-Listener für Fenstergröße registrieren
	onBeforeMount(() => {
		window.addEventListener('resize', resizeHandler);
	});

	// Beim Mount: Gerätetyp prüfen und ggf. Navbar anpassen
	onMounted(() => {
		if (isMobile()) {
			appStore.toggleDevice(DeviceEnum.Mobile);
			appStore.closeNavbar(true);
		}
	});

	// Vor dem Unmount: Event-Listener entfernen
	onBeforeUnmount(() => {
		window.removeEventListener('resize', resizeHandler);
	});
}
