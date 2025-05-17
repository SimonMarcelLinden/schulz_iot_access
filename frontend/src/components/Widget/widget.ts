import { defineComponent, computed } from 'vue'

// Stores

// composables

// Types

// Components
import WidgetSkeleton from '@/components/skeleton/skeleton.vue'

// Templates

export default defineComponent({
	name: 'Widget',
	components: {
		WidgetSkeleton,
	},
	emits: ['icon-click'],
	props: {
		title: { type: String, required: true },
		content: { type: String, default: '' },
		subtext: { type: String, default: '' },
		icon: { type: String, default: '' },
		iconBackground: { type: String, default: 'from-blue-700 to-blue-500' },
		iconColor: { type: String, default: 'text-white' },
		isLoading: { type: Boolean, default: false },
		skeletonRows: { type: Number, default: 2 },
		skeletonCols: { type: Number, default: 1 },
		skeletonWithIcon: { type: Boolean, default: true },
		// Header Layout
		leftWidth: { type: String, default: 'w-2/3' },
		rightWidth: { type: String, default: 'basis-1/3' },
		headerDirection: { type: String, default: 'row' }, // "row" oder "col"
		headerGap: { type: String, default: '' },
		headerWrap: { type: Boolean, default: false },

		// Content Layout
		contentDirection: { type: String, default: 'row' }, // "row" oder "col"
		contentGap: { type: String, default: '4' }, // z.B. "4" für gap-4
		contentWrap: { type: Boolean, default: false },
		widgetWidth: { type: String, default: 'sm:w-1/2 xl:w-1/4' },
	},
	setup(props, { emit }) {
		const showIcon = computed(() => !!props.icon)

		function handleIconClick() {
			emit('icon-click')
		}

		return {
			showIcon,
			handleIconClick,
		}
	},
})
