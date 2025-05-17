// src/pages/Settings/settings.ts
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useSystemStore } from '@/store/system/index';
import { loadSavedNetworks, scanNetworks, connectToNetwork } from '@/_service/system-wifi-service';
import Modal from '@/components/modal/modal.vue';

interface WifiNetwork {
	ssid: string;
	security: string;
	rssi: number;
	channel: string;
}

export default defineComponent({
	name: 'Settings',
	components: { Modal },
	setup() {
		const systemStore = useSystemStore();

		const loadingScannedNetworks = ref(false);

		// Aktuell verbundenes SSID
		const currentSSID = computed(() => systemStore.wlan.connection.ssid);

		// Alle gespeicherten Netzwerke aus dem Store, ohne das aktuell Verbundene
		const savedNetworks = computed(() => systemStore.wlan.savedNetworks.filter((n) => n.ssid !== currentSSID.value));

		// Ref für die gescannten Netzwerke
		const scannedNetworks = ref<WifiNetwork[]>([]);

		// Andere Netzwerke = gescannte minus gespeicherte minus aktuelles
		const otherNetworks = computed(() =>
			scannedNetworks.value.filter((n) => n.ssid !== currentSSID.value && !systemStore.wlan.savedNetworks.some((s) => s.ssid === n.ssid))
		);

		let scanInterval: number | undefined;

		async function getSaved() {
			await loadSavedNetworks();
		}

		async function getScanned() {
			loadingScannedNetworks.value = true;
			const arr = await scanNetworks();
			scannedNetworks.value = arr.map((n) => ({
				ssid: n.ssid,
				security: n.security,
				rssi: n.rssi ?? 0,
				channel: n.channel ?? '',
			}));
			loadingScannedNetworks.value = false;
		}

		function startAutoScan() {
			getScanned();
			scanInterval = window.setInterval(getScanned, 30_000);
		}

		function stopAutoScan() {
			if (scanInterval) clearInterval(scanInterval);
			scanInterval = undefined;
			scannedNetworks.value = [];
		}

		// Direkt verbinden für gespeicherte Netze
		async function onClickSaved(ssid: string) {
			try {
				await connectToNetwork(ssid);
			} catch {
				// Fehlerbehandlung hier
			}
		}

		// Modal‐Flow für neue Netze
		const passwordModalVisible = ref(false);
		const selectedSSID = ref('');
		const password = ref('');

		function openPasswordModal(ssid: string) {
			selectedSSID.value = ssid;
			password.value = '';
			passwordModalVisible.value = true;
		}

		async function confirmPassword() {
			try {
				await connectToNetwork(selectedSSID.value, password.value);
			} catch {
				// Fehlerbehandlung hier
			} finally {
				passwordModalVisible.value = false;
			}
		}

		// Toggle WLAN / Logging
		async function onToggleCheckbox(field: 'logging' | 'wlan', ev: Event) {
			const checked = (ev.target as HTMLInputElement).checked;
			if (field === 'wlan') {
				systemStore.wlan.connection.status = checked;
				if (checked) {
					await getSaved();
					startAutoScan();
				} else {
					stopAutoScan();
				}
			} else {
				systemStore.logging.state = checked;
			}
		}

		onMounted(() => {
			if (systemStore.wlan.connection.status) {
				getSaved();
				startAutoScan();
			}
		});

		onUnmounted(stopAutoScan);

		watch(
			() => systemStore.wlan.connection.status,
			async (isOn) => {
				if (isOn) {
					await getSaved();
					startAutoScan();
				} else {
					stopAutoScan();
				}
			}
		);

		return {
			systemStore,
			loadingScannedNetworks,
			currentSSID,
			savedNetworks,
			otherNetworks,
			onToggleCheckbox,
			onClickSaved,
			openPasswordModal,
			passwordModalVisible,
			selectedSSID,
			password,
			confirmPassword,
		};
	},
});
