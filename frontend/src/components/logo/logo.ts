import { defineComponent } from 'vue';

// Stores

// composables
import { useLayoutMode } from '@/_utils/composables/use-layout-mode';

// Types

// Components

// URLs
import logoText1 from '@/assets/img/layouts/icon-512x512.png?url';
import logo from '@/assets/img/layouts/icon-512x512.png?url';

export default defineComponent({
	name: 'Logo',
	components: {},
	props: {
		collapse: {
			type: Boolean,
			default: true,
		},
	},
	setup(props) {
		const { isTop } = useLayoutMode();

		return {
			props,
			isTop,
			logo,
			logoText1,
		};
	},
});
