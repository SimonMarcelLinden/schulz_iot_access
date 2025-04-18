/**
 * @file WsEvents.cpp
 * @brief Modul zur Verwaltung und Verarbeitung von WebSocket-Ereignissen.
 *
 * Dieses Modul implementiert Funktionen zum Parsen eingehender WebSocket-Nachrichten
 * im JSON-Format, ermittelt deren Ereignistyp und leitet sie zur weiteren Verarbeitung
 * an spezialisierte Event-Handler (System, Log, Serial) weiter.
 *
 * Zusätzlich werden Hilfsfunktionen bereitgestellt, um JSON-basierte Antworten über
 * WebSocket an die verbundenen Clients zu senden.
 *
 * Unterstützte Ereignistypen sind:
 * - WS_EVT_SYSTEM: Systembezogene Ereignisse.
 * - WS_EVT_LOG: Log-bezogene Ereignisse.
 * - WS_EVT_SERIAL: Serielle Kommunikation betreffende Ereignisse.
 *
 * @author Simon Marcel Linden
 * @since 1.0.0
 */

#include "WsEvents.h"

/**
 * @brief Bestimmt den WebSocket-Ereignistyp aus einem String.
 *
 * @param type String, der den Ereignistyp repräsentiert.
 * @return Der passende WsEvents-Enum-Wert.
 */
WsEvents getEventType(const String &type) {
	if (type == "system") return WS_EVT_SYSTEM;
	if (type == "log") return WS_EVT_LOG;
	if (type == "serial") return WS_EVT_SERIAL;
	return WS_EVT_SYSTEM;  // Fallback auf SYSTEM
}

/**
 * @brief Parst eine WebSocket-Nachricht im JSON-Format in eine ParsedMessage-Struktur.
 *
 * @param jsonData Eingehende JSON-formatierte Nachricht.
 * @return ParsedMessage mit extrahierten Daten.
 */
ParsedMessage parseWebSocketMessage(const char *jsonData) {
	ParsedMessage msg;
	StaticJsonDocument<256> doc;
	DeserializationError error = deserializeJson(doc, jsonData);

	if (!error) {
		String type = doc["type"].as<String>();
		msg.eventType = getEventType(type);
		msg.command = doc["command"].as<String>();
		msg.key = doc["key"].as<String>();
		msg.value = doc["value"].as<String>();
	}
	return msg;
}

/**
 * @brief WebSocket Event-Handler für Verbindung, Datenempfang, Trennung und Fehler.
 *
 * @param server WebSocket-Server-Instanz.
 * @param client WebSocket-Client, der das Ereignis ausgelöst hat.
 * @param type Ereignistyp (Verbindung, Trennung, Datenempfang, Fehler).
 * @param arg Zusätzliche Argumente (nicht genutzt).
 * @param data Empfangene Daten.
 * @param len Länge der empfangenen Daten.
 */
void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
	switch (type) {
		case WS_EVT_CONNECT:
			logger.info("[WebSocket] Client " + String(client->id()) + " verbunden.");
			break;

		case WS_EVT_DISCONNECT:
			logger.info("[WebSocket] Client" + String(client->id()) + " getrennt.");
			break;

		case WS_EVT_ERROR:
			logger.info("[WebSocket] Fehler bei Client " + String(client->id()) + ".");
			break;

		case WS_EVT_PONG:
			logger.info("[WebSocket] Ping/Pong von Client " + String(client->id()) + " .");
			break;

		case WS_EVT_DATA: {
			ParsedMessage msg = parseWebSocketMessage((char *)data);
			switch (msg.eventType) {
				case WS_EVT_SYSTEM:
					handleSystemEvent(client, msg);
					break;
				case WS_EVT_LOG:
					handleLogEvent(client, msg);
					break;
				case WS_EVT_SERIAL:
					handleSerialEvent(client, msg);
					break;
				default:
					logger.warn("[WebSocket] Unbekanntes Event im DATA-Payload!");
			}
			break;
		}
		default:
			logger.warn("[WebSocket] Unbekannter Event!");
			break;
	}
}

/**
 * @brief Behandelt "system"-Ereignisse vom WebSocket.
 *
 * @param client Client, der das Ereignis gesendet hat.
 * @param msg Die empfangene Nachricht als ParsedMessage.
 */
void handleSystemEvent(AsyncWebSocketClient *client, const ParsedMessage &msg) {
	// Prüfe den Command-Typ und führe die entsprechenden Aktionen aus
	if (msg.command == "wifi") {
		if (msg.key == "get") {
			// Liefert die SSID und das Passwort
			String ssid, password;
			wifiManager.getSTAConfig(ssid, password);

			StaticJsonDocument<256> doc;
			JsonArray details = doc.createNestedArray("details");
			details.add(ssid);      // SSID als erstes Element
			details.add(password);  // Passwort als zweites Element

			// Antwort senden mit Array
			sendResponse(client, "system", "wifi", "success", details, "");
		} else if (msg.key == "set") {
			// Setzt SSID und Passwort
			DynamicJsonDocument doc(1024);
			deserializeJson(doc, msg.value);
			String ssid = doc["ssid"];
			String password = doc["password"];
			wifiManager.setSTAConfig(ssid, password);
			sendResponse(client, "system", "wifi", "success", "SSID und Passwort gesetzt", "");
		} else if (msg.key == "status") {
			// Überprüfen, ob das STA verbunden ist oder nicht
			String connectionStatus;
			if (WiFi.status() == WL_CONNECTED) {
				connectionStatus = "true";
			} else {
				connectionStatus = "false";
			}

			// Antwort senden
			sendResponse(client, "system", "response", "success", connectionStatus, "");

		} else if (msg.key == "connect") {
			// Verbindet das Wifi mit den gespeicherten Zugangsdaten
			if (wifiManager.connectSTA()) {
				sendResponse(client, "system", "wifi", "success", "Verbindung erfolgreich", "");
			} else {
				sendResponse(client, "system", "wifi", "error", "Verbindung fehlgeschlagen", "");
			}
		} else if (msg.key == "disconnect") {
			// Trennt die Verbindung zum Wifi
			wifiManager.disconnectSTA();
			sendResponse(client, "system", "wifi", "success", "Verbindung getrennt", "");
		} else if (msg.key == "enable") {
			// Aktiviert Wifi
			WiFi.mode(WIFI_AP_STA);
			sendResponse(client, "system", "wifi", "success", "Wifi aktiviert", "");
		} else if (msg.key == "disable") {
			// Deaktiviert Wifi
			WiFi.mode(WIFI_OFF);
			sendResponse(client, "system", "wifi", "success", "Wifi deaktiviert", "");
		} else if (msg.key == "list") {
			// Liefert ein Array mit allen gespeicherten Netzwerken
			std::vector<WiFiNetwork> savedNetworks = wifiManager.getSavedNetworks();

			StaticJsonDocument<1024> doc;
			JsonArray networkList = doc.to<JsonArray>();

			for (const auto &network : savedNetworks) {
				JsonObject networkObj = networkList.createNestedObject();
				networkObj["ssid"] = network.ssid;
				networkObj["password"] = network.password;
			}

			String jsonString;
			serializeJson(doc, jsonString);

			sendResponse(client, "system", "wifi", "success", networkList, "");
		} else if (msg.key == "scan") {
			xTaskCreate(scanNetworksTask, "ScanNetworks", 8192, client, 1, NULL);
		} else if (msg.key == "add") {
			// Fügt ein Netzwerk zu den bekannten Netzwerken hinzu
			DynamicJsonDocument doc(1024);
			deserializeJson(doc, msg.value);
			String ssid = doc["ssid"];
			String password = doc["password"];
			wifiManager.addNetwork(ssid, password);
			sendResponse(client, "system", "wifi", "success", "Netzwerk hinzugefügt", "");
		} else if (msg.key == "remove") {
			// Entfernt ein Netzwerk aus den bekannten Netzwerken
			String ssid = msg.value;
			if (wifiManager.removeNetwork(ssid)) {
				sendResponse(client, "system", "wifi", "success", "Netzwerk entfernt", "");
			} else {
				sendResponse(client, "system", "wifi", "error", "Netzwerk nicht gefunden", "");
			}
		}
	} else if (msg.command == "version" && msg.key == "get") {
		// Gibt die aktuelle Firmware-Version zurück
		sendResponse(client, "system", "version", "success", FIRMWARE_VERSION, "");
	} else {
		sendResponse(client, "system", "response", "error", "Unbekannter Command oder Key", "");
	}
}

/**
 * @brief Behandelt "log"-Ereignisse vom WebSocket.
 *
 * @param client Client, der das Ereignis gesendet hat.
 * @param msg Die empfangene Nachricht als ParsedMessage.
 */
void handleLogEvent(AsyncWebSocketClient *client, const ParsedMessage &msg) {
	// Command-Auswertung:
	if (msg.command == "debug") {
		// 1) log debug <-> activate / deactivate / status
		if (msg.key == "activate") {
			LLog::setActive(true);
			sendResponse(client, "log", "debug", "success", "Debug logging aktiviert", "");
		} else if (msg.key == "deactivate") {
			LLog::setActive(false);
			sendResponse(client, "log", "debug", "success", "Debug logging deaktiviert", "");
		} else if (msg.key == "status") {
			bool active = LLog::isActive();
			// `active` ist true/false – sende das als String
			sendResponse(client, "log", "debug", "success", active ? "true" : "false", "");
		} else {
			sendResponse(client, "log", "debug", "error", "Unbekannter Key für 'debug'", "");
		}
	} else if (msg.command == "files") {
		// 2) log files <-> list / rename / delete
		if (msg.key == "list") {
			// Liste aller .log-Dateien im Ordner /logs
			listLogFiles(client);
		} else if (msg.key == "rename") {
			// Wert parsen => { "fileName": "...", "newFileName": "..." }
			renameLogFile(client, msg.value);
		} else if (msg.key == "delete") {
			// Wert parsen => entweder "fileName": String oder "fileNames": Array
			deleteLogFiles(client, msg.value);
		} else {
			sendResponse(client, "log", "files", "error", "Unbekannter Key für 'files'", "");
		}
	} else {
		// Unbekanntes Command
		sendResponse(client, "log", "response", "error", "Unbekannter Command bei 'log'", "");
	}
}

/**
 * @brief Behandelt "serial"-Ereignisse vom WebSocket.
 *
 * @param client Client, der das Ereignis gesendet hat.
 * @param msg Die empfangene Nachricht als ParsedMessage.
 */
void handleSerialEvent(AsyncWebSocketClient *client, const ParsedMessage &msg) {
	logger.info("handleSerialEvent: command=" + msg.command + ", key=" + msg.key + ", value=" + msg.value);
	sendResponse(client, "serial", "response", "success", "Serial Event verarbeitet", "");
}

/**
 * @brief Sendet eine Antwort über WebSocket an den Client.
 *
 * @param client Ziel-Client.
 * @param event Ereignistyp als String.
 * @param action Die ausgeführte Aktion.
 * @param status Status der Aktion ("success", "error", ...).
 * @param details Zusätzliche Details zur Aktion.
 * @param error Optionaler Fehlertext.
 */
void sendResponse(AsyncWebSocketClient *client, const String &event, const String &action, const String &status, const String &details,
                  const String &error) {
	StaticJsonDocument<512> jsonResponse;
	jsonResponse["event"] = event;
	jsonResponse["action"] = action;
	jsonResponse["status"] = status;
	jsonResponse["details"] = details;
	jsonResponse["error"] = error;
	String response;
	serializeJson(jsonResponse, response);

	if (details.length() > 0) {
		logger.info(response);
	} else if (error.length() > 0) {
		logger.error(response);
	} else {
		logger.info("Keine Details oder Fehlermeldung.");
	}
	client->text(response);
}

/**
 * @brief Sendet eine Antwort über WebSocket an den Client.
 *
 * @param client Ziel-Client.
 * @param event Ereignistyp als String.
 * @param action Die ausgeführte Aktion.
 * @param status Status der Aktion ("success", "error", ...).
 * @param details Zusätzliche Details zur Aktion.
 * @param error Optionaler Fehlertext.
 */
void sendResponse(AsyncWebSocketClient *client, const String &event, const String &action, const String &status, const JsonArray &details,
                  const String &error) {
	StaticJsonDocument<1024> jsonResponse;
	jsonResponse["event"] = event;
	jsonResponse["action"] = action;
	jsonResponse["status"] = status;
	jsonResponse["details"] = details;
	jsonResponse["error"] = error;
	String response;
	serializeJson(jsonResponse, response);

	if (details.size() == 0) {
		logger.error(response);
	} else {
		logger.info(response);
	}

	client->text(response);
}

/**
 * @brief FreeRTOS-Task zum Scannen verfügbarer WLAN-Netzwerke und zur Übermittlung der Ergebnisse via WebSocket.
 *
 * Diese Task führt einen Scan nach verfügbaren WLAN-Netzwerken durch, erstellt daraus ein JSON-formatiertes
 * Array mit allen gefundenen Netzwerken inklusive SSID, Signalstärke (RSSI), Verschlüsselungstyp und Kanal.
 *
 * Nach Abschluss des Scans werden die Ergebnisse als JSON-basierte WebSocket-Antwort an den anfragenden Client gesendet.
 * Wird kein Netzwerk gefunden, erhält der Client ein leeres Array als Antwort.
 *
 * Die Task löscht sich nach erfolgreichem Versand der Ergebnisse automatisch selbst.
 *
 * @param parameter Pointer auf den AsyncWebSocketClient, der den Scan angefordert hat.
 */
void scanNetworksTask(void *parameter) {
	std::vector<ScannedNetwork> scannedNetworks = wifiManager.scanNetworks();
	StaticJsonDocument<1024> doc;

	// Erzeuge ein Array "networks" im JSON-Dokument
	JsonArray networkList = doc.createNestedArray("networks");

	// Prüfe, ob überhaupt Netzwerke gefunden wurden
	if (scannedNetworks.empty()) {
		JsonArray emptyArray;
		sendResponse((AsyncWebSocketClient *)parameter, "system", "wifi", "success", emptyArray, "");
	} else {
		// Für jedes gefundene Netzwerk ein JSON-Objekt erstellen
		for (const auto &net : scannedNetworks) {
			JsonObject networkObj = networkList.createNestedObject();
			networkObj["ssid"] = net.ssid;
			networkObj["rssi"] = net.rssi;
			networkObj["encryptionType"] = net.encryptionType;
			networkObj["channel"] = net.channel;
		}
		// Sende das komplette Array an den Client
		sendResponse((AsyncWebSocketClient *)parameter, "system", "wifi", "success", networkList, "");
	}
	// Lösche den Task, wenn das Scannen abgeschlossen ist
	vTaskDelete(NULL);
}

void listLogFiles(AsyncWebSocketClient *client) {
	StaticJsonDocument<1024> doc;
	JsonArray filesArray = doc.createNestedArray("files");

	File dir = SD.open("/logs");
	if (!dir) {
		sendResponse(client, "log", "files", "error", "Verzeichnis /logs nicht gefunden oder nicht lesbar", "");
		return;
	}

	// Durch alle Einträge iterieren
	File entry;
	while ((entry = dir.openNextFile())) {
		if (!entry.isDirectory()) {
			String fileName = entry.name();
			// Wenn gewünscht, nur .log-Dateien erfassen:
			if (fileName.endsWith(".log")) {
				JsonObject fileObj = filesArray.createNestedObject();
				fileObj["name"] = fileName;
				fileObj["size"] = (unsigned long)entry.size();
			}
		}
		entry.close();
	}
	dir.close();

	// Sende das JSON
	sendResponse(client, "log", "files", "success", filesArray, "");
}

void renameLogFile(AsyncWebSocketClient *client, const String &jsonValue) {
	// JSON parsen
	DynamicJsonDocument doc(256);
	DeserializationError err = deserializeJson(doc, jsonValue);
	if (err) {
		sendResponse(client, "log", "files", "error", "JSON-Parsing fehlgeschlagen", err.c_str());
		return;
	}

	String oldName = doc["fileName"] | "";
	String newName = doc["newFileName"] | "";

	// Safety-Checks
	if (oldName.length() == 0 || newName.length() == 0) {
		sendResponse(client, "log", "files", "error", "Alte oder neue Datei wurde nicht angegeben", "");
		return;
	}

	// Beispiel: /logs/ + name
	String oldPath = "/logs/" + oldName;
	String newPath = "/logs/" + newName;

	// Vorhanden?
	if (!SD.exists(oldPath)) {
		sendResponse(client, "log", "files", "error", "Alte Datei existiert nicht: " + oldName, "");
		return;
	}

	// Umbenennen
	bool success = SD.rename(oldPath, newPath);
	if (!success) {
		sendResponse(client, "log", "files", "error", "Konnte Datei nicht umbenennen", "");
		return;
	}

	sendResponse(client, "log", "files", "success", "Datei umbenannt von " + oldName + " zu " + newName, "");
}

void deleteLogFiles(AsyncWebSocketClient *client, const String &jsonValue) {
	DynamicJsonDocument doc(512);
	DeserializationError err = deserializeJson(doc, jsonValue);
	if (err) {
		sendResponse(client, "log", "files", "error", "JSON-Parsing fehlgeschlagen", err.c_str());
		return;
	}

	// Prüfe zuerst auf "fileName"
	if (doc.containsKey("fileName") && doc["fileName"].is<String>()) {
		String fileName = doc["fileName"].as<String>();
		deleteSingleLogFile(client, fileName);
	}
	// Prüfe auf Array "fileNames"
	else if (doc.containsKey("fileNames") && doc["fileNames"].is<JsonArray>()) {
		JsonArray arr = doc["fileNames"].as<JsonArray>();
		for (JsonVariant v : arr) {
			if (v.is<String>()) {
				deleteSingleLogFile(client, v.as<String>());
			}
		}
		// Am Ende ggf. Erfolgsmeldung
		sendResponse(client, "log", "files", "success", "Mehrere Dateien gelöscht", "");
	} else {
		// Nichts passendes gefunden
		sendResponse(client, "log", "files", "error", "Weder fileName noch fileNames im JSON gefunden.", "");
	}
}

void deleteSingleLogFile(AsyncWebSocketClient *client, const String &fileName) {
	if (fileName.isEmpty()) return;

	String path = "/logs/" + fileName;
	if (!SD.exists(path)) {
		sendResponse(client, "log", "files", "error", "", "Datei: " + path + " nicht vorhanden");
		return;
	}

	bool removed = SD.remove(path);
	if (removed) {
		sendResponse(client, "log", "files", "success", "Datei: " + path + " gelöscht.", "");
	} else {
		sendResponse(client, "log", "files", "error", "", "Datei: " + path + " konnte nicht gelöscht werden");
	}
}

// // Handler für System-Events
// void handleSystemEvent(AsyncWebSocketClient *client, ParsedMessage msg) {
// 	if (msg.command == "wifi") {
// 		if (msg.key == "get") {
// 			sendWebSocketResponse(client, "system", "wifi", "get", "{\"ssid\":\"MyWiFi\",\"password\":\"*****\"}");
// 		} else if (msg.key == "set") {
// 			Serial.printf("Speichere WiFi-Daten: %s\n", msg.value.c_str());
// 			sendWebSocketResponse(client, "system", "wifi", "set", "{\"status\":\"OK\"}");
// 		}
// 	} else if (msg.command == "version" && msg.key == "get") {
// 		sendWebSocketResponse(client, "system", "version", "get", "{\"version\":\"1.0.0\"}");
// 	}
// }

// // Handler für Log-Events
// void handleLogEvent(AsyncWebSocketClient *client, ParsedMessage msg) {
// 	if (msg.command == "debug") {
// 		if (msg.key == "activate") {
// 			Serial.println("Debug-Logging aktiviert.");
// 		} else if (msg.key == "deactivate") {
// 			Serial.println("Debug-Logging deaktiviert.");
// 		}
// 	} else if (msg.command == "files" && msg.key == "list") {
// 		sendWebSocketResponse(client, "log", "files", "list", "[\"log1.txt\",\"log2.txt\"]");
// 	}
// }

// // Handler für Serial-Events
// void handleSerialEvent(AsyncWebSocketClient *client, ParsedMessage msg) {
// 	if (msg.key == "connect") {
// 		int baudRate = msg.value.toInt();
// 		Serial.printf("Verbinde Serial mit Baudrate: %d\n", baudRate);
// 	} else if (msg.key == "disconnect") {
// 		Serial.println("Serial-Verbindung getrennt.");
// 	} else if (msg.key == "send") {
// 		Serial.printf("Sende über Serial: %s\n", msg.value.c_str());
// 	}
// }
