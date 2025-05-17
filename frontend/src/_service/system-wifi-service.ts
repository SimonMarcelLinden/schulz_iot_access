/**
 * @file system-wifi-wervice.ts
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

import { SocketService } from '@/_service/socket';
import { useSystemStore } from '@/store/system/index';

const TIMEOUT_MS = 60000; // Timeout in Millisekunden

/**
 * Repräsentiert ein WLAN-Netzwerk mit Signalstärke
 */
export interface WifiNetwork {
	ssid: string;
	security: string;
	rssi: number;
	channel: string;
}

/**
 * @brief Erzeugt ein Timeout-Promise, das nach `ms` Millisekunden mit einem Fehler abbricht.
 *
 * @param[in] ms Zeit in Millisekunden bis zum Timeout.
 * @param[in] message Fehlermeldung, die beim Timeout geworfen wird.
 * @return {Promise<never>} Promise, das nach Ablauf der Zeit mit Error(message) rejected.
 */
function timeoutReject<T>(ms: number, message: string): Promise<T> {
	return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
}

/**
 * @brief Liest die gespeicherten WLAN-Netzwerke vom Backend aus.
 */
async function fetchSavedNetworks(): Promise<WifiNetwork[]> {
	const store = useSystemStore();
	store.loading = true;

	try {
		const networks: WifiNetwork[] = await Promise.race([
			new Promise<WifiNetwork[]>((resolve, reject) => {
				const handler = (msg: { status: string; details: Array<{ ssid: string; security: string; channel: string; rssi: number }> }) => {
					if (msg.status === 'list') {
						const result: WifiNetwork[] = msg.details.map((n) => ({
							ssid: n.ssid,
							security: n.security || '',
							rssi: n.rssi ?? 0,
							channel: n.channel ?? '',
						}));
						SocketService.removeListener('system', 'wifi', handler);
						resolve(result);
					}
				};
				SocketService.onMessage('system', 'wifi', handler).catch(reject);
				SocketService.sendMessage({ type: 'system', command: 'wifi', key: 'list', value: '' }).catch(reject);
			}),
			timeoutReject<WifiNetwork[]>(TIMEOUT_MS, 'Timeout beim Abrufen gespeicherter Netzwerke'),
		]);

		// im Store aktualisieren
		store.wlan.savedNetworks = networks.map((n) => ({
			ssid: n.ssid,
			security: n.security,
			rssi: n.rssi,
			channel: n.channel,
		}));
		return networks;
	} catch (err) {
		console.warn('fetchSavedNetworks fehlgeschlagen:', err);
		return [];
	} finally {
		store.loading = false;
	}
}

/**
 * @brief Scannt nach verfügbaren WLAN-Netzwerken und liest sie vom Backend aus.
 * @todo: Funktioniert nicht, da die Antwort nicht den erwarteten Typ hat.
 */
async function fetchScanNetworks(): Promise<WifiNetwork[]> {
	const store = useSystemStore();
	store.loading = true;

	try {
		const networks: WifiNetwork[] = await Promise.race([
			new Promise<WifiNetwork[]>((resolve, reject) => {
				const handler = (msg: { status: string; details: Array<{ ssid: string; security: string; channel?: string; rssi?: number }> }) => {
					if (msg.status === 'scan') {
						const result: WifiNetwork[] = msg.details.map((n) => ({
							ssid: n.ssid,
							security: n.security || '',
							rssi: n.rssi ?? 0,
							channel: n.channel ?? '',
						}));
						SocketService.removeListener('system', 'wifi', handler);
						resolve(result);
					}
				};
				SocketService.onMessage('system', 'wifi', handler).catch((e) => {
					SocketService.removeListener('system', 'wifi', handler);
					reject(e);
				});
				SocketService.sendMessage({ type: 'system', command: 'wifi', key: 'scan', value: '' }).catch(reject);
			}),
			timeoutReject<WifiNetwork[]>(TIMEOUT_MS, 'Timeout beim Scannen der Netzwerke'),
		]);

		return networks;
	} catch (err) {
		console.warn('fetchScanNetworks fehlgeschlagen:', err);
		return [];
	} finally {
		store.loading = false;
	}
}

/**
 * @brief Aktiviert oder deaktiviert das Debug-Logging im Backend und im Store.
 *
 * @param enabled true = aktivieren, false = deaktivieren
 */
export async function toggleLogging(enabled: boolean): Promise<void> {
	const systemStore = useSystemStore();
	systemStore.loading = true;

	try {
		// Listener-Promise, wartet auf status: "success"
		const listener = new Promise<void>((resolve, reject) => {
			const handler = (msg: { status: string; details: { activate: string; detail: string } }) => {
				if (msg.status === 'success') {
					SocketService.removeListener('log', 'debug', handler);
					systemStore.logging.state = msg.details.activate === 'true';
					resolve();
				}
			};
			SocketService.onMessage('log', 'debug', handler).catch(reject);
		});

		// Befehl schicken
		await SocketService.sendMessage({
			type: 'log',
			command: 'debug',
			key: enabled ? 'activate' : 'deactivate',
		});

		// Listener oder Timeout
		await Promise.race([listener, timeoutReject(TIMEOUT_MS, `Timeout beim ${enabled ? 'Aktivieren' : 'Deaktivieren'} des Loggings`)]);
	} catch (err) {
		console.warn('toggleLogging fehlgeschlagen:', err);
		// Rollback des lokalen States
		systemStore.logging.state = !enabled;
		throw err;
	} finally {
		systemStore.loading = false;
	}
}

/**
 * @brief Aktiviert oder deaktiviert das Debug-Logging im Backend und im Store.
 *
 * @param enabled true = aktivieren, false = deaktivieren
 */
export async function toggleWlan(enabled: boolean): Promise<void> {
	const systemStore = useSystemStore();
	systemStore.loading = true;

	try {
		// Listener-Promise, wartet auf status: "success"
		const listener = new Promise<void>((resolve, reject) => {
			const handler = (msg: { status: string; details: { activate: string; detail: string } }) => {
				if (msg.status === 'success') {
					SocketService.removeListener('system', 'wifi', handler);
					systemStore.logging.state = msg.details.detail === 'true';
					resolve();
				}
			};
			SocketService.onMessage('system', 'wifi', handler).catch(reject);
		});

		// Befehl schicken
		await SocketService.sendMessage({
			type: 'system',
			command: 'wifi',
			key: enabled ? 'enable' : 'disable',
		});

		// Listener oder Timeout
		await Promise.race([listener, timeoutReject(TIMEOUT_MS, `Timeout beim ${enabled ? 'Aktivieren' : 'Deaktivieren'} des Loggings`)]);
	} catch (err) {
		console.warn('toggleLogging fehlgeschlagen:', err);
		// Rollback des lokalen States
		systemStore.logging.state = !enabled;
		throw err;
	} finally {
		systemStore.loading = false;
	}
}

export async function connectToNetwork(ssid: string, password?: string): Promise<void> {
	const store = useSystemStore();
	store.loading = true;
	try {
		if (ssid && password) {
			await SocketService.sendMessage({
				type: 'system',
				command: 'wifi',
				key: 'set',
				value: JSON.stringify({ ssid, password: password || '' }),
			});
		} else {
			await SocketService.sendMessage({
				type: 'system',
				command: 'wifi',
				key: 'connect',
				value: JSON.stringify({ ssid }),
			});
		}
		// Optional: auf Erfolg warten, hier einfach kurz den Status setzen:
		store.wlan.connection.ssid = ssid;
		store.wlan.connection.connected = true;
	} catch (err) {
		console.error('Verbindung fehlgeschlagen:', err);
		throw err;
	} finally {
		store.loading = false;
	}
}
// Sa@DekypC.xdd5EYrM#jamUh(n@AxG{.
/**
 * @brief Initialisiert alle systemrelevanten Statuswerte im Settings-Store.
 *
 * Wenn die PWA offline ist, wird die Initialisierung abgebrochen.
 * Aktuell werden nur die gespeicherten Netzwerke geladen.
 */
export async function systemNetWorks(): Promise<WifiNetwork[]> {
	if (!navigator.onLine) {
		console.warn('PWA ist offline – Systemstatus kann nicht geladen werden.');
		return [];
	}

	return fetchSavedNetworks();
}

/**
 * Manuelles Nachladen der gespeicherten WLAN-Netzwerke.
 * Liefert das Array der gespeicherten Netzwerke zurück.
 */
export async function loadSavedNetworks(): Promise<WifiNetwork[]> {
	return fetchSavedNetworks();
}

/**
 * Scannt die verfügbaren WLAN-Netzwerke und gibt sie zurück.
 */
export async function scanNetworks(): Promise<WifiNetwork[]> {
	return fetchScanNetworks();
}
