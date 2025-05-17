import { reactive } from "vue";

export type ToastType =
	| "success"
	| "info"
	| "warning"
	| "danger"
	| "error"
	| "fuchsia"
	| "slate"
	| "lime"
	| "red"
	| "orange"
	| "cyan"
	| "gray"
	| "dark";

export type ToastPosition =
	| "top-left"
	| "top-center"
	| "top-right"
	| "bottom-left"
	| "bottom-center"
	| "bottom-right"
	| "center"
	| "center-left"
	| "center-right";

export interface ToastOptions {
	/** neuer Feld für eindeutige Identifikation */
	key?: string;
	message: string;
	type?: ToastType;
	duration?: number; // ms
	position?: ToastPosition;
}

/** jetzt enthält jedes Toast auch den key (oder undefined) */
export interface Toast extends Required<Omit<ToastOptions, "key">> {
	id: number;
	key?: string;
}

const defaultOptions: Required<Omit<ToastOptions, "message" | "key">> = {
	type: "info",
	duration: 3000,
	position: "top-right",
};

const toasts = reactive<Toast[]>([]);
const timers = new Map<number, ReturnType<typeof setTimeout>>();
const keyMap = new Map<string, number>();
let seed = 0;

export function useToast() {
	function showToast(opts: ToastOptions) {
		// 1) Wenn opts.key existiert und schon ein Toast unter diesem Key da ist → updaten
		if (opts.key && keyMap.has(opts.key)) {
			const id = keyMap.get(opts.key)!;
			const idx = toasts.findIndex((t) => t.id === id);
			if (idx !== -1) {
				const t = toasts[idx];
				// Eigenschaften überschreiben
				t.message = opts.message;
				t.type = opts.type ?? defaultOptions.type;
				t.duration = opts.duration ?? defaultOptions.duration;
				t.position = opts.position ?? defaultOptions.position;

				// alten Timer killen, neuen starten
				clearTimeout(timers.get(id));
				const handle = setTimeout(() => removeToast(id), t.duration);
				timers.set(id, handle);
				return;
			}
		}

		// 2) Sonst normalen neuen Toast anlegen
		const toast: Toast = {
			id: ++seed,
			key: opts.key,
			message: opts.message,
			type: opts.type ?? defaultOptions.type,
			duration: opts.duration ?? defaultOptions.duration,
			position: opts.position ?? defaultOptions.position,
		};

		toasts.push(toast);
		if (opts.key) keyMap.set(opts.key, toast.id);

		// Auto-Remove
		const handle = setTimeout(() => removeToast(toast.id), toast.duration);
		timers.set(toast.id, handle);
	}

	function removeToast(id: number) {
		// Key-Mapping aufräumen
		for (const [k, v] of keyMap.entries()) {
			if (v === id) {
				keyMap.delete(k);
				break;
			}
		}
		// Timer killen
		clearTimeout(timers.get(id));
		timers.delete(id);

		const idx = toasts.findIndex((t) => t.id === id);
		if (idx !== -1) toasts.splice(idx, 1);
	}

	return { toasts, showToast, removeToast };
}
