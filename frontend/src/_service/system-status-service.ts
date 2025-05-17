/**
 * @file system-status-service.ts
 * @brief Service zum Abrufen systemrelevanter Statuswerte via WebSocket.
 *
 * Detaillierte Beschreibung:
 * Dieses Modul stellt Funktionen bereit, um den WLAN-Status, den Log-Status und die App-Version
 * von einem Backend über WebSocket abzufragen und im Settings-Store zu speichern.
 * Ein Timeout schützt vor zu langem Warten bei fehlenden Antworten.
 *
 * @author Simon Marcel Linden
 * @version 1.0.0
 * @since 1.0.0
 */

const timeoutTime = 5000; // Timeout in Millisekunden

import { SocketService } from '@/_service/socket';
import { useSystemStore } from '@/store/system/index';

interface InitDetails {
	logging: { fileLogging: boolean };
	routes: string[];
	serial: { available: boolean; baudRate: number };
	version: { firmware: string; web: string };
	wlan: {
		connection: { status: boolean; connected: boolean; ssid: string; ip: string; gateway: string; subnet: string };
		savedNetworks: Array<{ ssid: string; security: string; channel?: string; rssi?: number }>;
	};
}

interface InitMessage {
	event: 'system';
	action: 'init';
	status: 'success' | 'error';
	details: InitDetails;
}

/**
 * @brief Erzeugt ein Timeout-Promise, das nach `ms` Millisekunden mit einem Fehler abbricht.
 *
 * @param[in] ms Zeit in Millisekunden bis zum Timeout.
 * @param[in] message Fehlermeldung, die beim Timeout geworfen wird.
 * @return {Promise<never>} Promise, das nach Ablauf der Zeit mit Error(message) rejected.
 */
function createTimeout(ms: number, message: string): Promise<never> {
	return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
}

async function fetchInitial(systemStore: ReturnType<typeof useSystemStore>): Promise<void> {
	systemStore.loading = true;

	// {"event":"system","action":"init","status":"success","details":{"logging":{"fileLogging":true},"routes":["/logfile","/logs/device","/logs","/ws"],"serial":{"available":true,"baudRate":9600},"version":{"firmware":"1.0.0","web":"1.0.0"},"wlan":{"mode":3,"currentSSID":"BND Ueberwachungseinheit 45","savedNetworks":[{"ssid":"BND Ueberwachungseinheit 45"}]}}}

	try {
		const listener = new Promise<void>(async (resolve) => {
			const handler = (msg: InitMessage) => {
				if (msg.status === 'success') {
					const { logging, routes, serial, version, wlan } = msg.details;

					// 1) Logging
					systemStore.logging.state = logging.fileLogging;

					// 3) Serial
					systemStore.serial.available = serial.available;
					systemStore.serial.baudRate = serial.baudRate;

					// 4) Version
					systemStore.version.firmware = version.firmware;
					systemStore.version.web = version.web;

					// 5) WLAN
					systemStore.wlan.connection.status = wlan.connection.status;
					systemStore.wlan.connection.connected = wlan.connection.connected;
					systemStore.wlan.connection.ssid = wlan.connection.ssid;
					systemStore.wlan.connection.ip = wlan.connection.ip;
					systemStore.wlan.connection.gateway = wlan.connection.gateway;
					systemStore.wlan.connection.subnet = wlan.connection.subnet;
				}
				SocketService.removeListener('system', 'init', handler);
				resolve();
			};
			await SocketService.onMessage('system', 'init', handler);
		});

		await SocketService.sendMessage({
			type: 'system',
			command: 'init',
		});

		await Promise.race([listener, createTimeout(timeoutTime, 'Timeout beim Abrufen des Inintial-Status')]);
	} catch (err) {
		console.warn('Initial-Status konnte nicht abgerufen werden:', err);
	} finally {
		systemStore.loading = false;
	}
}

/**
 * @brief Initialisiert alle systemrelevanten Statuswerte im Settings-Store.
 *
 * Wenn die PWA offline ist, wird die Initialisierung abgebrochen.
 * Andernfalls werden parallel WLAN-Status, Log-Status und App-Version abgefragt.
 *
 * @return {Promise<void>} Promise, das aufgelöst wird, sobald alle Abfragen beendet sind.
 */
export async function systemStatusService(): Promise<void> {
	if (!navigator.onLine) {
		console.warn('PWA ist offline – Systemstatus kann nicht geladen werden.');
		return;
	}

	const systemStore = useSystemStore();
	await Promise.allSettled([fetchInitial(systemStore)]);
}
