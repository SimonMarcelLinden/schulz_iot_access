<template>
	<div class="px-6 py-2 text-right text-sm text-gray-400">
		<slot>Letzte Aktualisierung: {{ new Date().toLocaleString() }}</slot>
		<TableControls v-if="footerControl" :meta="meta" :params="params" @updateParams="forward" />
	</div>
</template>

<script lang="ts">

export { default } from './table-footer'

</script>

<style src="./table-footer.scss"></style>
