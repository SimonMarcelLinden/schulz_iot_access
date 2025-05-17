import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getLogByFilename, deleteLogByFilename, renameLogByFilename } from '@/_utils/log/indexed-db-service';
import { useToast } from '@/_utils/composables/use-toast';

export function useLogActions() {
	const router = useRouter();
	const route = useRoute();
	const { showToast } = useToast();
	const pendingFilename = ref('');
	const newFilename = ref('');
	const TIMEOUT_MS = 1500;

	function prepareRename(fn: string) {
		pendingFilename.value = fn;
		newFilename.value = fn;
	}

	async function doRename() {
		const oldName = pendingFilename.value;
		const neu = newFilename.value.trim();
		if (!neu || neu === oldName) return;
		try {
			await renameLogByFilename(oldName, neu);
			showToast({
				message: `Umbenannt in „${neu}“`,
				type: 'success',
				position: 'bottom-center',
				duration: TIMEOUT_MS,
			});
			if (route.name === 'SingleFile') {
				router.replace({ name: 'SingleFile', params: { filename: neu } });
			}
		} catch (err: any) {
			showToast({
				message: `Fehler: ${err.message}`,
				type: 'error',
				position: 'bottom-center',
				duration: TIMEOUT_MS,
			});
		}
	}

	function prepareDelete(fn: string) {
		pendingFilename.value = fn;
	}

	async function doDelete() {
		const fn = pendingFilename.value;
		try {
			await deleteLogByFilename(fn);
			showToast({
				message: `„${fn}“ gelöscht`,
				type: 'success',
				position: 'bottom-center',
				duration: TIMEOUT_MS,
			});
			router.push({ name: 'LogFiles' });
		} catch (err: any) {
			showToast({
				message: `Fehler: ${err.message}`,
				type: 'error',
				position: 'bottom-center',
				duration: TIMEOUT_MS,
			});
		}
	}

	async function shareLog(fn: string) {
		const rec = await getLogByFilename(fn);
		if (!rec) {
			showToast({
				message: `„${fn}“ nicht gefunden.`,
				type: 'error',
				position: 'bottom-center',
				duration: TIMEOUT_MS,
			});
			return;
		}
		const blob = new Blob([rec.log], { type: 'text/plain' });
		const file = new File([blob], `${fn}.txt`, { type: 'text/plain' });
		try {
			if (navigator.canShare?.({ files: [file] })) {
				await navigator.share({ files: [file], title: fn });
				showToast({
					message: `Geteilt: ${fn}.txt`,
					type: 'success',
					position: 'bottom-center',
					duration: TIMEOUT_MS,
				});
			} else {
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `${fn}.txt`;
				a.click();
				URL.revokeObjectURL(url);
				showToast({
					message: `Download gestartet: ${fn}.txt`,
					type: 'info',
					position: 'bottom-center',
					duration: TIMEOUT_MS,
				});
			}
		} catch (err: any) {
			showToast({
				message: `Teilen fehlgeschlagen: ${err.message}`,
				type: 'error',
				position: 'bottom-center',
				duration: TIMEOUT_MS,
			});
		}
	}

	return {
		pendingFilename,
		newFilename,
		prepareRename,
		doRename,
		prepareDelete,
		doDelete,
		shareLog,
	};
}
