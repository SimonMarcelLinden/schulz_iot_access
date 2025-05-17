import { defineComponent, ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

// Stores
import { SocketService } from '@/_service/socket';
import { useSystemStore } from '@/store/system/index';

// Composables
import { useDevice } from '@/_utils/composables/use-device';

export default defineComponent({
	name: 'MobileKeyboard',
	emits: ['enter'],
	setup(_, { emit }) {
		const systemStore = useSystemStore();
		const { isMobile } = useDevice();

		const customActive = ref(true);
		const uppercaseActive = ref(false);
		const stdMode = ref<'alpha' | 'numeric' | 'special'>('alpha');
		const command = ref('');
		const keyboardVisible = ref(false);
		const keyboardEl = ref<HTMLElement | null>(null);
		const inputEl = ref<HTMLElement | null>(null);

		const customKeys = [
			['1', '2', '3', '4'],
			['5', '6', '7', '8'],
			['9', '0', 'Backspace'],
			['data', 'start'],
		];
		const alphaRows = [
			['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
			['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
			['Uppercase', 'y', 'x', 'c', 'v', 'b', 'n', 'm'],
		];
		const numericRows = [
			['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
			['-', '/', ':', ';', '(', ')', '€', '&', '@'],
			['#+=', '.', ',', '?', '!', "'", 'Backspace'],
		];
		const specialRows = [
			['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
			['-', '\\', '|', '~', '<', '>', '$', '£', '¥', '·'],
			['123', '.', ',', '?', '!', "'", 'Backspace'],
		];

		const bottomRow = computed(() => {
			return stdMode.value === 'alpha' ? ['123', ' ', 'Backspace', 'Enter'] : ['ABC', ' ', 'Backspace', 'Enter'];
		});

		function renderKeyLabel(key: string) {
			if (key === 'Backspace') return `<i class="fas fa-backspace"></i>`;
			if (key === 'Uppercase') return uppercaseActive.value ? '⇧' : '⇪';
			if (key === 'Enter') return '⏎';
			if (key === ' ') return '␣';
			if (key === 'ABC') return 'ABC';
			return uppercaseActive.value ? key.toUpperCase() : key.toLowerCase();
		}

		const sendCommand = async (val?: string) => {
			if (!systemStore.serial.connected) {
				console.error('Nicht verbunden');
				return;
			}

			let data: string;

			if (!val) {
				const raw = command.value ?? '';
				data = raw.trim();
			} else {
				data = val;
			}

			if (systemStore.serial.baudRate == 1200) {
				if (data == 'start') data = 's';
				if (data == 'data') data = 'p';
			}

			try {
				console.log('Serial senden:', data);
				if (data) {
					await SocketService.sendMessage({
						type: 'serial',
						command: 'send',
						key: '',
						value: data,
					});
					command.value = ''; // Input zurücksetzen
				} else {
					console.warn('Leere Eingabe');
				}
				// nach dem DOM-Update scrollen
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
				console.log(`\nError: ${errorMessage}\n`);
			}
		};

		function onPress(key: string) {
			if (key === 'Backspace') {
				command.value = command.value.slice(0, -1);
			} else if (key === 'Uppercase') {
				uppercaseActive.value = !uppercaseActive.value;
			} else if (['start', 'data'].includes(key.toLowerCase())) {
				sendCommand(key.toLowerCase());
			} else if (key === ' ') {
				command.value += ' ';
			} else if (key === '#+=') {
				stdMode.value = 'special';
			} else if (key === '123') {
				stdMode.value = 'numeric';
			} else {
				command.value += uppercaseActive.value ? key.toUpperCase() : key.toLowerCase();
			}
		}

		function onBottomPress(key: string) {
			if (key === '123') {
				stdMode.value = 'numeric';
				return;
			}
			if (key === 'ABC') {
				stdMode.value = 'alpha';
				return;
			}
			if (key === ' ') {
				command.value += ' ';
			}
			if (key === 'Backspace') {
				command.value = command.value.slice(0, -1);
			}
			if (key === 'Enter') {
				sendCommand();
			}
		}

		function onDocumentClick(e: MouseEvent) {
			const t = e.target as Node;
			if (keyboardVisible.value && !keyboardEl.value?.contains(t) && !inputEl.value?.contains(t)) {
				hideKeyboard();
			}
		}

		function showKeyboard() {
			keyboardVisible.value = true;
			// Listener erst nach diesem Klick-Event-Loop anfügen:
			setTimeout(() => {
				document.addEventListener('click', onDocumentClick);
			}, 0);
		}

		function hideKeyboard() {
			keyboardVisible.value = false;
			document.removeEventListener('click', onDocumentClick);
		}

		function switchKeyboard() {
			customActive.value = !customActive.value;
			stdMode.value = 'alpha';
		}

		onUnmounted(() => {
			document.removeEventListener('click', onDocumentClick);
		});

		return {
			isMobile,
			customActive,
			uppercaseActive,
			stdMode,
			command,
			keyboardVisible,
			keyboardEl,
			inputEl,
			customKeys,
			alphaRows,
			numericRows,
			specialRows,
			bottomRow,
			renderKeyLabel,
			onPress,
			onBottomPress,
			showKeyboard,
			switchKeyboard,
			sendCommand,
		};
	},
});
