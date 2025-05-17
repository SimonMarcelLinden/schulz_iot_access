// src/registerSW.ts
import { useRegisterSW } from "virtual:pwa-register/vue";
import { watch } from "vue";

export function usePWA() {
	const { offlineReady, needRefresh } = useRegisterSW({
		immediate: true,
		onRegisterError(error: any) {
			console.error("SW-Fehler:", error);
		},
	});

	// Beobachte den Ref
	watch(offlineReady, (ready) => {
		if (ready) {
			console.log("📡 App ist jetzt offline-fähig!");
		}
	});

	return { needRefresh };
}
