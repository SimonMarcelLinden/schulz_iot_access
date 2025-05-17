import { defineComponent, reactive, ref, computed, onMounted, watch, PropType } from 'vue'
import type { TableColumn } from './_types/column'
import type { TableMeta } from './_types/meta'
import type { TableParams } from './_types/params'

import { useRoute, useRouter } from 'vue-router'

// Components
import TableHeader from './header/table-header.vue'
import TableHead from './head/table-head.vue'
import TableBody from './body/table-body.vue'
import TableFooter from './footer/table-footer.vue'

export default defineComponent({
	name: 'Table',
	components: {
		TableHeader,
		TableHead,
		TableBody,
		TableFooter,
	},
	props: {
		title: String,
		columns: { type: Array as PropType<TableColumn[]>, required: true },
		meta: { type: Object as PropType<TableMeta>, required: true },
		params: { type: Object as PropType<TableParams>, required: true },
		data: { type: Array as PropType<Record<string, any>[]>, required: true },
		loading: { type: Boolean },
		headerControl: { type: Boolean, required: false, default: true },
		footerControl: { type: Boolean, required: false, default: false },
		shadow: { type: Boolean, required: false, default: true },
	},
	emits: {
		onColumnClicked: (_payload: any) => true,
		onTableParamsChanged: (p: TableParams) =>
			typeof p.page === 'number' && typeof p.size === 'number',
	},
	setup(props, { emit }) {
		const route = useRoute()
		const router = useRouter()

		const params = reactive<TableParams>({ ...props.params })

		onMounted(() => {
			console.log('onMounted', route.query)
			const q = route.query
			params.page = parseInt(q.page as string, 10) || params.page
			params.size = parseInt(q.size as string, 10) || params.size
			console.log('params', params)
		})

		watch(
			() => [route.query.page, route.query.size],
			([p, s]) => {
				params.page = parseInt(p as string, 10) || params.page
				params.size = parseInt(s as string, 10) || params.size
			},
		)
		watch(
			() => [params.page, params.size],
			([page, size]) => {
				router.replace({ query: { page: String(page), size: String(size) } })
			},
			{ immediate: true },
		)

		const page = ref(props.params.page ?? 1)
		const size = ref(props.params.size ?? 5)
		const sortKey = ref('')
		const sortOrder = ref<'asc' | 'desc'>('asc')

		const pagedData = computed(() => {
			let arr = [...props.data]

			if (sortKey.value) {
				arr.sort((a, b) => {
					const aV = a[sortKey.value],
						bV = b[sortKey.value]
					if (aV === bV) return 0
					const res = aV > bV ? 1 : -1
					return sortOrder.value === 'asc' ? res : -res
				})
			}

			const start = (params.page! - 1) * params.size!
			return arr.slice(start, start + params.size!)
		})

		const tableMeta = computed<TableMeta>(() => {
			const totalElements = props.meta.totalElements ?? props.data.length
			const totalPages = Math.ceil(totalElements / params.size!)
			const from = (params.page! - 1) * params.size! + 1
			const to = Math.min(params.page! * params.size!, totalElements)
			return { totalElements, totalPages, from, to }
		})

		function toggleSort(key: string) {
			if (sortKey.value === key) {
				sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
			} else {
				sortKey.value = key
				sortOrder.value = 'asc'
			}
		}

		function onParamsChanged(newParams: TableParams) {
			Object.assign(params, newParams)
		}

		function handleTableParamsChanged_old(newParams: TableParams) {
			// interne Werte updaten
			page.value = newParams.page ?? page.value
			size.value = newParams.size ?? size.value

			// URL aktualisieren
			router.push({
				query: {
					page: `${newParams.page}`,
					size: `${newParams.size}`,
				},
			})

			// optional: Event nach außen weiterreichen
			emit('onTableParamsChanged', newParams)
		}

		return {
			params,
			title: props.title,
			columns: props.columns,
			loading: props.loading,
			page,
			size,
			sortKey,
			sortOrder,
			pagedData,
			meta: tableMeta,
			toggleSort,
			onParamsChanged,
		}
	},
})
