// src/composables/useSerialIncoming.ts
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { SocketService } from '@/_service/socket';
import { appendLogLineToIndexedDB } from '@/_utils/log/indexed-db-service';

/**
 * Composable, das einen String-Ref `output` bereitstellt,
 * alle eingehenden Serial-“incoming”-Events anhört und
 * den Inhalt in `output` anhängt und automatisch scrollt.
 */
export function useSerialIncoming() {
	const output = ref('');
	const textareaRef = ref<HTMLTextAreaElement | null>(null);

	// sobald `storeName` gesetzt wird, beginnen wir mit dem Speichern
	const storeName = ref<string | null>(null);

	let handler: (data: any) => void;

	onMounted(async () => {
		handler = async (data: { status: string; details: string }) => {
			const line = data.status === 'data' ? (data.details ?? '') : `Error: ${data.details ?? 'Unbekannter Fehler.'}`;

			// 1) In der UI anzeigen
			output.value += line;

			// 2) Scroll-Ende
			await nextTick();
			if (textareaRef.value) {
				textareaRef.value.scrollTop = textareaRef.value.scrollHeight;
			}

			// 3) In IndexedDB speichern, falls ein Namen gesetzt
			if (storeName.value) {
				await appendLogLineToIndexedDB(storeName.value, line);
			}
		};

		await SocketService.onMessage('serial', 'incoming', handler);
	});

	onUnmounted(() => {
		SocketService.removeListener('serial', 'incoming', handler);
	});

	return { output, textareaRef, storeName };
}
