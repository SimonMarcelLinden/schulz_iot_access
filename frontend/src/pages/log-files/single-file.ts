import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getLogByFilename } from '@/_utils/log/indexed-db-service';
import { useLogActions } from './composable/use-log-actions';

import Modal from '@/components/modal/modal.vue';

export default defineComponent({
	name: 'SingleFile',
	components: { Modal },
	setup() {
		const route = useRoute();
		const router = useRouter();
		const filename = route.params.filename as string;
		const content = ref('');

		// aus Composable
		const { pendingFilename, newFilename, prepareRename, doRename, prepareDelete, doDelete, shareLog } = useLogActions();

		// eigene State-Variablen für die beiden Modals
		const renameModalVisible = ref(false);
		const deleteModalVisible = ref(false);

		onMounted(async () => {
			const rec = await getLogByFilename(filename);
			content.value = rec?.log ?? 'Kein Log gefunden.';
		});

		// Hilfsfunktionen, die zusätzlich das Modal öffnen
		function openRename(fn: string) {
			prepareRename(fn);
			renameModalVisible.value = true;
		}
		function openDelete(fn: string) {
			prepareDelete(fn);
			deleteModalVisible.value = true;
		}

		async function onDoRename() {
			await doRename();
			renameModalVisible.value = false;
		}
		async function onDoDelete() {
			await doDelete();
			router.push('/LogFiles');
		}

		return {
			filename,
			content,

			// für Modals
			openRename,
			openDelete,
			renameModalVisible,
			deleteModalVisible,

			// aus Composable
			pendingFilename,
			newFilename,
			doRename: onDoRename,
			doDelete: onDoDelete,
			shareLog,
		};
	},
});
