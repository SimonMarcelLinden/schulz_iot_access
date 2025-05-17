// src/_utils/cache/system.storage.cache.ts
import type { SystemConfig } from '@/_utils/config/system';
import { CacheKey } from '@/_utils/constants/cache-key';

/**
 * Persistierbares Shape:
 * • alle Top-Level-Feldern von SystemConfig sind optional
 * • aber in `wlan` nur Partial (wir speichern ja nur savedNetworks)
 */
export type PersistSystemConfig = Omit<Partial<SystemConfig>, 'wlan'> & { wlan?: Partial<SystemConfig['wlan']> };

/**
 * Holt die gespeicherte System-Konfiguration aus dem `localStorage`.
 * @returns {SystemConfig | null} Die gespeicherte Konfiguration oder `null`, falls nicht vorhanden.
 */
export function getSystemConfig(): PersistSystemConfig | null {
	const json = localStorage.getItem(CacheKey.SYSTEM_CONFIG);
	try {
		return json ? (JSON.parse(json) as PersistSystemConfig) : null;
	} catch (error) {
		console.error('Fehler beim Parsen von SystemConfig:', error);
		return null;
	}
}

/**
 * Speichert die System-Konfiguration im `localStorage`.
 * @param {SystemConfig} config - Die zu speichernde System-Konfiguration.
 */
export function setSystemConfig(config: PersistSystemConfig): void {
	localStorage.setItem(CacheKey.SYSTEM_CONFIG, JSON.stringify(config));
}

/**
 * Entfernt die gespeicherte System-Konfiguration aus dem `localStorage`.
 */
export function removeSystemConfig(): void {
	localStorage.removeItem(CacheKey.SYSTEM_CONFIG);
}
