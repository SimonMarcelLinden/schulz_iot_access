import { defineComponent, computed, PropType } from "vue";
import type { TableMeta } from "../_types/meta";
import type { TableParams } from "../_types/params";

export default defineComponent({
	name: "TableControls",
	props: {
		meta: { type: Object as PropType<TableMeta>, required: true },
		params: { type: Object as PropType<TableParams>, required: true },
	},
	emits: {
		// jetzt EIN EINZIGES Event, mit komplettem TableParams‑Objekt
		updateParams: (p: TableParams) => typeof p.page === "number" && typeof p.size === "number",
	},
	setup(props, { emit }) {
		const totalPages = computed(() => {
			if (typeof props.meta.totalPages === "number") {
				return props.meta.totalPages;
			}
			const total = Number(props.meta.totalElements ?? 0);
			return Math.ceil(total / props.params.size!);
		});

		function onChangeSize(e: Event) {
			const size = parseInt((e.target as HTMLSelectElement).value, 10);
			emit("updateParams", { ...props.params, size });
		}
		function onPrev() {
			if (props.params.page! > 1) {
				emit("updateParams", { ...props.params, page: props.params.page! - 1 });
			}
		}
		function onNext() {
			if (props.params.page! < totalPages.value) {
				emit("updateParams", { ...props.params, page: props.params.page! + 1 });
			}
		}

		return { totalPages, onChangeSize, onPrev, onNext };
	},
});
