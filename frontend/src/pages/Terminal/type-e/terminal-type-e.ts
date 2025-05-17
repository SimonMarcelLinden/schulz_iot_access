import { defineComponent, ref, watch } from 'vue'

import { useSerialConnection } from '@/pages/terminal/composables/use-serial-connection'
import { useSerialIncoming } from '@/pages/terminal/composables/use-serial-incoming'

// Components
import Terminal from '@/components/terminal/terminal.vue'
import MobileKeyboard from '@/components/keyboard/mobile-keyboard.vue'
import Modal from '@/components/modal/modal.vue'

export default defineComponent({
	name: 'TerminalTypeE',
	components: { Terminal, MobileKeyboard, Modal },
	setup() {
		// 1) Verbindung aufbauen
		const { connected } = useSerialConnection(1200)
		// 2) Serial-Incoming hook, um die storeName zu bekommen
		const { storeName } = useSerialIncoming()

		// 3) Modal‐State
		const showModal = ref(false)
		const filename = ref('')

		// Wenn verbunden wird, öffne das Modal automatisch
		watch(connected, (ok) => {
			if (ok) {
				showModal.value = true
			}
		})

		// Callback wenn der Benutzer den Dateinamen bestätigt
		function onFilenameConfirm() {
			if (filename.value.trim()) {
				// Übergibt den Namen an die Composable, ab jetzt wird gespeichert
				storeName.value = filename.value.trim()
			}
			showModal.value = false
		}

		return {
			connected,
			showModal,
			filename,
			onFilenameConfirm,
		}
	},
})
