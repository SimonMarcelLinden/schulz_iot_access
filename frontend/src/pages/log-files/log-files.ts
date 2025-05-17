import { defineComponent, ref, reactive, computed, onMounted, onBeforeUpdate, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllLogRecords } from '@/_utils/log/indexed-db-service';
import { useLogActions } from './composable/use-log-actions';
import Modal from '@/components/modal/modal.vue';

export default defineComponent({
	name: 'LogFiles',
	components: { Modal },
	setup() {
		const router = useRouter();
		const logs = ref<{ filename: string; date: string }[]>([]);
		const query = ref('');

		// aus Composable
		const { pendingFilename, newFilename, prepareRename, doRename, prepareDelete, doDelete, shareLog } = useLogActions();

		// eigene State-Variablen für die beiden Modals
		const renameModalVisible = ref(false);
		const deleteModalVisible = ref(false);

		// Hilfsfunktionen, die zusätzlich das Modal öffnen
		function openRename(fn: string) {
			prepareRename(fn);
			renameModalVisible.value = true;
		}
		function openDelete(fn: string) {
			prepareDelete(fn);
			deleteModalVisible.value = true;
		}

		// Swipe-Refs
		const itemRefs = reactive<Record<string, HTMLElement>>({});
		const btnsRefs = reactive<Record<string, HTMLElement>>({});

		function makeRefSetter(store: Record<string, HTMLElement>) {
			return (key: string) => (el: any) => {
				if (el instanceof HTMLElement) store[key] = el;
			};
		}
		const setItemRef = makeRefSetter(itemRefs);
		const setBtnRef = makeRefSetter(btnsRefs);

		// Swipe-State
		const openId = ref<string | null>(null);
		const startX: Record<string, number> = {};

		async function loadLogs() {
			const all = await getAllLogRecords();
			all.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
			logs.value = all.map((r) => ({
				filename: r.filename,
				date: r.timestamp.split('T')[0],
			}));
		}

		onMounted(loadLogs);
		onBeforeUpdate(() => {
			Object.keys(itemRefs).forEach((k) => delete itemRefs[k]);
			Object.keys(btnsRefs).forEach((k) => delete btnsRefs[k]);
			openId.value = null;
		});

		const filteredLogs = computed(() =>
			logs.value.filter((l) => l.filename.toLowerCase().includes(query.value.toLowerCase()) || l.date.includes(query.value))
		);

		function viewLog(fn: string) {
			router.push(`/log/${fn}`);
		}

		async function onDoRename() {
			await doRename();
			await loadLogs();
			renameModalVisible.value = false;
		}
		async function onDoDelete() {
			await doDelete();
			await loadLogs();
			deleteModalVisible.value = false;
		}

		// --- Swipe Handling ---
		function onTouchStart(e: TouchEvent, id: string) {
			if (openId.value && openId.value !== id) {
				const prevEl = itemRefs[openId.value];
				const prevBtns = btnsRefs[openId.value];
				if (prevEl && prevBtns) {
					prevEl.style.transform = 'translateX(0)';
					prevBtns.style.opacity = '0';
				}
				openId.value = null;
			}
			startX[id] = e.changedTouches[0].clientX;
		}

		function onTouchMove(e: TouchEvent, id: string) {
			const dx = e.changedTouches[0].clientX - (startX[id] || 0);
			const el = itemRefs[id];
			const btn = btnsRefs[id];
			if (!el || !btn) return;
			const translate = Math.max(Math.min(dx, 0), -192);
			el.style.transform = `translateX(${translate}px)`;
			btn.style.opacity = `${Math.min(Math.abs(translate) / btn.clientWidth, 1)}`;
		}

		function onTouchEnd(e: TouchEvent, id: string) {
			const dx = e.changedTouches[0].clientX - (startX[id] || 0);
			const el = itemRefs[id];
			const btn = btnsRefs[id];
			if (!el || !btn) return;
			const open = dx < -40;
			el.style.transform = open ? 'translateX(-192px)' : 'translateX(0)';
			btn.style.opacity = open ? '1' : '0';
			openId.value = open ? id : null;
		}

		function handleDocumentClick(e: MouseEvent) {
			if (!openId.value) return;
			const el = itemRefs[openId.value];
			if (el && !el.contains(e.target as Node)) {
				const btns = btnsRefs[openId.value];
				el.style.transform = 'translateX(0)';
				if (btns) btns.style.opacity = '0';
				openId.value = null;
			}
		}
		onMounted(() => document.addEventListener('click', handleDocumentClick));
		onUnmounted(() => document.removeEventListener('click', handleDocumentClick));

		return {
			query,
			filteredLogs,
			viewLog,

			// für Swipe
			setItemRef,
			setBtnRef,
			onTouchStart,
			onTouchMove,
			onTouchEnd,

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
