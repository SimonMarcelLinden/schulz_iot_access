import { defineComponent, computed, reactive } from 'vue';
import { useToast, Toast } from '@/_utils/composables/use-toast';

export default defineComponent({
	name: 'Notifications',
	setup() {
		// Toast-Store
		const { toasts, removeToast } = useToast();

		// Timer-Handles für Pause/Resume
		const timers = reactive(new Map<number, ReturnType<typeof setTimeout>>());

		function pause(toast: Toast) {
			const handle = timers.get(toast.id);
			if (handle) clearTimeout(handle);
		}

		function resume(toast: Toast) {
			const handle = setTimeout(() => removeToast(toast.id), toast.duration);
			timers.set(toast.id, handle);
		}

		// Einzigartige Positionen ermitteln
		const uniquePositions = computed<string[]>(() => Array.from(new Set(toasts.map((t) => t.position))));

		// Toaster nach Position gruppieren
		const toastsByPosition = computed<Record<string, Toast[]>>(() =>
			uniquePositions.value.reduce(
				(acc, pos) => {
					acc[pos] = toasts.filter((t) => t.position === pos);
					return acc;
				},
				{} as Record<string, Toast[]>
			)
		);

		// Map Position → Transition-Name
		function getTransitionName(pos: string) {
			switch (pos) {
				case 'top-center':
					return 'slide-down';
				case 'top-left':
					return 'slide-right';
				case 'top-right':
					return 'slide-left';
				case 'bottom-center':
					return 'slide-up';
				case 'bottom-left':
					return 'slide-up-right';
				case 'bottom-right':
					return 'slide-up-left';
				case 'center':
					return 'fade';
				default:
					return 'fade';
			}
		}

		return {
			toasts,
			removeToast,
			pause,
			resume,
			uniquePositions,
			toastsByPosition,
			getTransitionName,
		};
	},
});
