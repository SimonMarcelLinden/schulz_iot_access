import { defineComponent, onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import type { TableColumn } from '@/components/table/_types/column';
import type { TableMeta } from '@/components/table/_types/meta';
import type { TableParams } from '@/components/table/_types/params';

import { getAllLogRecords } from '@/_utils/log/indexed-db-service';

// Components
import Widget from '@/components/widget/widget.vue';
import Table from '@/components/table/table.vue';
import { useSystemStore } from '@/store/system/index';

interface LogRecord {
	filename: string;
	timestamp: string;
	log: string;
}

export default defineComponent({
	name: 'Dashboard',
	components: { Widget, Table },
	setup() {
		const systemStore = useSystemStore();

		const router = useRouter();

		const rawLogs = ref<LogRecord[]>([]);
		const logs = ref<any[]>([]);
		const params = ref<TableParams>({ size: 6, page: 1 });
		const meta = ref<TableMeta>({ totalElements: 0, totalPages: 0, from: 0, to: 0 });

		const columns: TableColumn[] = [
			{ key: 'filename', label: 'Filename', sortable: true },
			{ key: 'date', label: 'Datum', sortable: true },
			{ key: 'view', label: '', sortable: false, slot: 'view' },
			{ key: 'action', label: '', sortable: false, slot: 'action' },
		];

		async function loadLogs() {
			const all = await getAllLogRecords();
			// sortiere absteigend nach timestamp
			all.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
			rawLogs.value = all;

			// baue Tabelle
			const start = (params.value.page - 1) * params.value.size;
			const slice = rawLogs.value.slice(0, 6);
			logs.value = slice.map((r) => ({
				filename: r.filename,
				date: r.timestamp.split('T')[0],
			}));

			meta.value = {
				totalElements: rawLogs.value.length,
				totalPages: Math.ceil(rawLogs.value.length / params.value.size),
				from: start + 1,
				to: start + slice.length,
			};
		}

		// Neu laden bei Seiten- oder Größenwechsel
		function onParamsChange(newParams: TableParams) {
			params.value = newParams;
			loadLogs();
		}

		function viewLog(filename: string) {
			// zu /log/<filename> routen
			router.push({ path: `/log/${filename}` });
		}

		async function deleteLog(filename: string) {
			if (confirm(`Wirklich "${filename}" löschen?`)) {
				// await deleteLogByFilename(filename);
				loadLogs();
			}
		}

		onMounted(() => {
			loadLogs();
		});

		return {
			systemStore,
			columns,
			logs,
			meta,
			params,
			onParamsChange,
			viewLog,
			deleteLog,
		};
	},
});
