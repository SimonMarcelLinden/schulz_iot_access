<template>
	<div class="border-black-12.5 mb-0 rounded-t-2xl border-b-0 border-solid bg-white p-6 pb-0">
		<div class="flex flex-col sm:flex-row flex-wrap mt-0 -mx-3">
			<!-- <div class="flex-none w-7/12 max-w-full px-3 mt-0 lg:w-1/2 lg:flex-none"> -->
			<div class="w-full sm:w-7/12 px-3 mb-2 sm:mb-0">
				<h6>{{ title }}</h6>
			</div>
			<!-- <div class="flex-none w-5/12 max-w-full px-3 my-auto text-right lg:w-1/2 lg:flex-none"> -->
			<div class="w-full sm:w-5/12 px-3 text-right">
				<TableControls v-if="headerControl" :meta="meta" :params="params" @updateParams="forward" />
				<slot name="header-actions"></slot>
			</div>
		</div>
	</div>
</template>

<script lang="ts">

export { default } from './table-header'

</script>

<style src="./table-header.scss"></style>
