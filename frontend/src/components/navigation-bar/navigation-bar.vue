<template>
	<nav class="relative flex flex-wrap items-center justify-between px-0 py-2 mx-6 transition-all shadow-none duration-250 ease-soft-in rounded-2xl lg:flex-nowrap lg:justify-start"
		navbar-main="" navbar-scroll="true">
		<div class="flex items-center justify-between w-full px-4 py-1 mx-auto flex-wrap-inherit">
			<Breadcrumb />
			<Hamburger v-if="isMobile" :is-active="appStore.navbar.opened" class="hamburger"
				@toggle-click="toggleSidebar" />
		</div>
	</nav>
</template>

<script lang="ts">
import Hamburger from '../hamburger/hamburger';


export { default } from './navigation-bar'

</script>

<style src="./navigation-bar.scss"></style>
