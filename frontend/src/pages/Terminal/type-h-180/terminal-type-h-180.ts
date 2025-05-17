import { defineComponent } from 'vue'

import { useSerialConnection } from '@/pages/terminal/composables/use-serial-connection'

// Components
import Terminal from '@/components/terminal/terminal.vue'
import MobileKeyboard from '@/components/keyboard/mobile-keyboard.vue'

export default defineComponent({
	name: 'TerminalTypeH180',
	components: { Terminal, MobileKeyboard },
	setup() {
		const { connected } = useSerialConnection(112500)

		return { connected }
	},
})
