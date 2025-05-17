<template>
	<transition enter-active-class="transition-transform duration-500 ease-out" enter-from-class="-translate-y-full"
		enter-to-class="translate-y-0" leave-active-class="transition-transform duration-500 ease-in"
		leave-from-class="translate-y-0" leave-to-class="-translate-y-full">
		<div v-show="bannerVisible" ref="banner"
			class="fixed top-0 left-0 right-0 bg-red-700 text-white text-center py-2 shadow-md transform">
			📡 Du bist offline – einige Funktionen sind möglicherweise nicht verfügbar.
		</div>
	</transition>
</template>

<script lang="ts">
export { default } from "./network-status-banner"
</script>


<style src="./network-status-banner.scss"></style>
