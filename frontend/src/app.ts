import { defineComponent } from 'vue';

import { systemStatusService } from '@/_service/system-status-service';
// Types

// Components

// Templates

export default defineComponent({
	name: 'AppMain',
	components: {},
	setup() {
		systemStatusService();
		return {};
	},
});
