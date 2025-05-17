// src/_utils/config/system.config.ts
import { getSystemConfig } from '@/_utils/cache/system-storage';
import type { PersistSystemConfig } from '@/_utils/cache/system-storage';

/**
 * Definition der System-Konfigurationsoptionen
 */
export interface SystemConfig {
	loading: boolean;
	version: { firmware: string; web: string };
	logging: { state: boolean };
	wlan: {
		connection: { status: boolean; connected: boolean; ssid: string; ip: string; gateway: string; subnet: string };
		savedNetworks: Array<{ ssid: string; security: string; channel?: string; rssi?: number }>;
	};
	serial: { available: boolean; baudRate: number; connected: boolean };
}

/**
 * Standardkonfiguration für das System
 */
const DEFAULT_SETTINGS_CONFIG: Readonly<SystemConfig> = {
	loading: false,
	version: { firmware: '0.0.0', web: '0.0.0' },
	logging: { state: false },
	wlan: { connection: { status: false, connected: false, ssid: '', ip: '', gateway: '', subnet: '' }, savedNetworks: [] },
	serial: { available: false, baudRate: 9600, connected: false },
};

// const storageData: Partial<SystemConfig> = getSystemConfig() ?? {};
// const { serial: _ignoreSerial, ...persisted } = storageData;

const storageData = (getSystemConfig() ?? {}) as Partial<SystemConfig>;
const { serial: _ignoreSerial, wlan: persistedWlan, ...persisted } = storageData;

/**
 * Aktuelle System-Konfiguration (Zusammenführung aus Standard- und gespeicherten Einstellungen)
 */
export const systemConfig: SystemConfig = {
	...DEFAULT_SETTINGS_CONFIG,
	...persisted,
	wlan: {
		...DEFAULT_SETTINGS_CONFIG.wlan,
		...(persistedWlan ?? {}),
	},
};
