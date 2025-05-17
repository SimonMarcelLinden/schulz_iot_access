/** @brief Name der IndexedDB-Datenbank. */
const DB_NAME = "AppLogs";
/** @brief Name des Objekt-Stores für Log-Einträge. */
const STORE_NAME = "logs";
/** @brief Version der Datenbank. */
const DB_VERSION = 2;

/**
 * @brief Öffnet die IndexedDB und erstellt bei Bedarf den Objekt-Store.
 *    Der Store nutzt nun `keyPath: 'filename'` statt Auto-Increment.
 */
function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (ev) => {
			const db = (ev.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				// keyPath = filename, um pro Dateiname nur einen Eintrag zu haben
				db.createObjectStore(STORE_NAME, { keyPath: "filename" });
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export interface LogRecord {
	filename: string; // Primärschlüssel
	timestamp: string; // letzter Änderungszeitpunkt
	log: string; // gesamte bisherige Log-Inhalte
}

/**
 * @brief Liest einen bestehenden Log-Eintrag aus der DB.
 */
async function getLogRecord(db: IDBDatabase, filename: string): Promise<LogRecord | undefined> {
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const store = tx.objectStore(STORE_NAME);
		const req = store.get(filename);
		req.onsuccess = () => resolve(req.result as LogRecord | undefined);
		req.onerror = () => reject(req.error);
	});
}

/**
 * @brief Speichert (oder updated) einen LogRecord in der DB.
 */
async function putLogRecord(db: IDBDatabase, record: LogRecord): Promise<void> {
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		const store = tx.objectStore(STORE_NAME);
		store.put(record);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);
	});
}

/**
 * @brief Hängt eine einzelne Zeile an das Log unter `filename` an.
 *
 * Liest zunächst den bestehenden Eintrag (falls vorhanden), hängt dann
 * `line` (inkl. Newline) an und schreibt das Gesamtergebnis zurück.
 */
export async function appendLogLineToIndexedDB(filename: string, line: string): Promise<void> {
	const db = await openDB();

	// 1) Bestehenden Datensatz holen
	const existing = await getLogRecord(db, filename);

	// 2) Neues log zusammenbauen (Zeile mit Newline trennen)
	const newLog = existing ? existing.log + line : line;

	// 3) Timestamp und Record erzeugen
	const record: LogRecord = {
		filename,
		log: newLog,
		timestamp: new Date().toISOString(),
	};

	// 4) Upsert in den Store
	await putLogRecord(db, record);
}

/**
 * @brief Holt das komplette Log unter `filename` (oder undefined).
 */
export async function getLogByFilename(filename: string): Promise<LogRecord | undefined> {
	const db = await openDB();
	return getLogRecord(db, filename);
}

/**
 * @brief Liest alle Logs (alle Dateinamen) aus.
 */
export async function getAllLogRecords(): Promise<LogRecord[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const store = tx.objectStore(STORE_NAME);
		const req = store.getAll();
		req.onsuccess = () => resolve(req.result as LogRecord[]);
		req.onerror = () => reject(req.error);
	});
}

/**
 * @brief Löscht den Log-Eintrag unter `filename`.
 */
export async function deleteLogByFilename(filename: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		tx.objectStore(STORE_NAME).delete(filename);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);
	});
}

/**
 * @brief Benennt einen Log-Eintrag um (via keyPath 'filename').
 *
 * 1) Holen des bestehenden Records
 * 2) Schreiben unter neuem Key
 * 3) Löschen des alten Eintrags
 */
export async function renameLogByFilename(oldFilename: string, newFilename: string): Promise<void> {
	const db = await openDB();
	// 1) Existierenden Datensatz holen
	const existingReq = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(oldFilename);

	const existing: LogRecord | undefined = await new Promise((res, rej) => {
		existingReq.onsuccess = () => res(existingReq.result);
		existingReq.onerror = () => rej(existingReq.error);
	});

	if (!existing) {
		throw new Error(`Log "${oldFilename}" nicht gefunden.`);
	}

	// 2) Neues Record mit neuem Filename schreiben
	const newRecord: LogRecord = {
		filename: newFilename,
		log: existing.log,
		timestamp: new Date().toISOString(),
	};
	await putLogRecord(db, newRecord);

	// 3) Alten Eintrag löschen
	await deleteLogByFilename(oldFilename);
}

/**
 * @brief Löscht alle Log-Einträge.
 */
export async function clearAllLogs(): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		tx.objectStore(STORE_NAME).clear();
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);
	});
}
