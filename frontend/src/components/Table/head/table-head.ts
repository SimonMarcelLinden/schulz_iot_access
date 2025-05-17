import { defineComponent, PropType } from "vue";
import { TableColumn } from "../_types/column";

export default defineComponent({
	name: "TableHead",
	props: {
		columns: { type: Array as PropType<TableColumn[]>, required: true },
		sortKey: { type: String as PropType<string>, default: "" },
		sortOrder: { type: String as PropType<"asc" | "desc" | "">, default: "" },
	},
});
