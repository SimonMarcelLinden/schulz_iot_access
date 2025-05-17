import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue'

// Types

// Components

// Templates

export default defineComponent({
	name: 'NetworkStatusBanner',
	components: {},
	setup() {
		const onlineStatus = ref(navigator.onLine)
		const bannerVisible = ref(false)
		const banner = ref<HTMLElement | null>(null)

		const showBanner = async () => {
			bannerVisible.value = true
			await nextTick()
			const root = document.getElementById('basis-layout')
			if (root && banner.value) {
				root.style.paddingTop = `${banner.value.offsetHeight}px`
			}
		}

		const hideBanner = async () => {
			bannerVisible.value = false
			await nextTick()
			const root = document.getElementById('basis-layout')
			if (root) {
				root.style.paddingTop = '0'
			}
		}

		const updateOnlineStatus = () => {
			onlineStatus.value = navigator.onLine
			if (!onlineStatus.value) showBanner()
			else hideBanner()
		}

		onMounted(() => {
			updateOnlineStatus()
			window.addEventListener('online', updateOnlineStatus)
			window.addEventListener('offline', updateOnlineStatus)
		})

		onUnmounted(() => {
			window.removeEventListener('online', updateOnlineStatus)
			window.removeEventListener('offline', updateOnlineStatus)
		})

		return { bannerVisible, banner }
	},
})
