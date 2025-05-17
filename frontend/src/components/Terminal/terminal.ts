import { defineComponent, computed, ref, watch, nextTick, provide, onMounted, onUnmounted } from 'vue';

import { useSystemStore } from '@/store/system/index';
import { useSerialIncoming } from '@/pages/terminal/composables/use-serial-incoming';

// Components

export default defineComponent({
	name: 'Terminal',
	components: {},
	setup(props) {
		const systemStore = useSystemStore();

		const { output, textareaRef } = useSerialIncoming();
		return { systemStore, output, textareaRef };
	},
});
