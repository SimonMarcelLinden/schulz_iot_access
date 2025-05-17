import { defineComponent, PropType } from 'vue'
import type { TableMeta } from '../_types/meta'
import type { TableParams } from '../_types/params'

import TableControls from '../controls/table-controls.vue'

export default defineComponent({
	name: 'TableHeader',
	components: { TableControls },
	props: {
		title: String,
		meta: { type: Object as PropType<TableMeta>, required: true },
		params: { type: Object as PropType<TableParams>, required: true },
		headerControl: { type: Boolean, required: false, default: true },
	},
	emits: {
		updateParams: (p: TableParams) => typeof p.page === 'number' && typeof p.size === 'number',
	},
	setup(_, { emit }) {
		return { forward: (p: TableParams) => emit('updateParams', p) }
	},
})
