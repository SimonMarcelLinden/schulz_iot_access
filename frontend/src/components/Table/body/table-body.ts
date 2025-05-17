import { defineComponent, PropType } from "vue";
import { TableColumn } from "../_types/column";

export default defineComponent({
	name: "TableBody",
	props: {
		data: { type: Array as PropType<Record<string, any>[]>, required: true },
		columns: { type: Array as PropType<TableColumn[]>, required: true },
		loading: { type: Boolean, default: false },
		skeletonRows: {
			type: Number,
			default: 5,
		},
	},
	emits: ["onColumnClicked"],
	setup(props, { emit }) {
		function handleColumnClicked(data: Record<string, any>, column: TableColumn) {
			emit("onColumnClicked", { data, column });
		}

		return { handleColumnClicked };
	},
});
