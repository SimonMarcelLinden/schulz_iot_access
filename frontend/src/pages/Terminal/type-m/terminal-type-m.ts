import { defineComponent } from 'vue'

import { useSerialConnection } from '@/pages/terminal/composables/use-serial-connection'

// Components
import Terminal from '@/components/terminal/terminal.vue'
import MobileKeyboard from '@/components/keyboard/mobile-keyboard.vue'

export default defineComponent({
	name: 'TerminalTypeM',
	components: { Terminal, MobileKeyboard },
	setup() {
		const { connected } = useSerialConnection(115200)

		return { connected }
	},
})
