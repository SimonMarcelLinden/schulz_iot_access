import { onBeforeUnmount } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'
import mitt, { type Handler } from 'mitt'

/** Typ für die Callback-Funktion bei Routenwechsel */
type RouteChangeCallback = (route: RouteLocationNormalized) => void

/** Event-Bus für Routing */
const emitter = mitt()

/** Eindeutiger Schlüssel für Routenänderungen */
const ROUTE_CHANGE_KEY = Symbol('ROUTE_CHANGE')

/** Zwischenspeicherung der aktuellsten Route */
let latestRoute: RouteLocationNormalized

/**
 * Manuelles Setzen der aktuellen Route und Benachrichtigen der Listener
 */
export function setRouteChange(to: RouteLocationNormalized) {
	emitter.emit(ROUTE_CHANGE_KEY, to)
	latestRoute = to
}

/**
 * @name useRouteListener
 * @description Beobachtet Route-Änderungen über ein pub/sub-Modell (statt watch())
 */
export function useRouteListener() {
	const callbacks: RouteChangeCallback[] = []

	/**
	 * Registriert einen Callback für Routenänderungen
	 * @param callback Die Funktion, die bei einer Änderung aufgerufen wird
	 * @param immediate Wenn true, wird die Callback-Funktion sofort mit der letzten Route ausgeführt
	 */
	const listenerRouteChange = (callback: RouteChangeCallback, immediate = false) => {
		callbacks.push(callback)
		emitter.on(ROUTE_CHANGE_KEY, callback as Handler)

		if (immediate && latestRoute) {
			callback(latestRoute)
		}
	}

	/**
	 * Entfernt einen zuvor registrierten Callback
	 */
	const removeRouteListener = (callback: RouteChangeCallback) => {
		emitter.off(ROUTE_CHANGE_KEY, callback as Handler)
	}

	/**
	 * Automatisches Aufräumen beim Verlassen der Komponente
	 */
	onBeforeUnmount(() => {
		callbacks.forEach(removeRouteListener)
	})

	return {
		listenerRouteChange,
		removeRouteListener,
	}
}

// ToDo: in router guard implmentieren
