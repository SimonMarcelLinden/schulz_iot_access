// src/composables/useSerialConnection.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { SocketService } from '@/_service/socket';
import { useSystemStore } from '@/store/system/index';

export function useSerialConnection(baudRate: number, onConnected?: () => void) {
	const connected = ref(false);
	const systemStore = useSystemStore();

	let statusHandler: (data: any) => void;

	async function confirmConnection() {
		// alten Listener entfernen, wenn vorhanden
		if (statusHandler) {
			SocketService.removeListener('serial', 'status', statusHandler);
		}

		statusHandler = (data: { status: string; details: { available: boolean; baudRate: number } }) => {
			const ok = data.status === 'success' && data.details.available && data.details.baudRate === baudRate;

			connected.value = ok;
			systemStore.serial.connected = ok;

			if (ok && typeof onConnected === 'function') {
				onConnected();
			}

			// nur einmal hören
			SocketService.removeListener('serial', 'status', statusHandler);
		};

		// Listener registrieren
		await SocketService.onMessage('serial', 'status', statusHandler);

		// Baudrate setzen
		await SocketService.sendMessage({
			type: 'serial',
			command: 'setBaud',
			key: '',
			value: String(baudRate),
		});
	}

	onMounted(() => {
		confirmConnection();
	});
	onUnmounted(() => {
		if (statusHandler) {
			SocketService.removeListener('serial', 'status', statusHandler);
		}
	});

	return { connected };
}
