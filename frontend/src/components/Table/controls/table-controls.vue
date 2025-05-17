<template>
	<div class="flex justify-end px-6 py-0 space-x-2 md:flex-nowrap">
		<select :value="params.size" @change="onChangeSize" class="h-8 mr-2 border rounded px-2 py-1 text-sm">
			<option v-for="n in [5, 10, 25, 50]" :key="n" :value="n">{{ n }}</option>
		</select>
		<div class="flex items-center space-x-1 whitespace-nowrap">
			<button class="p-1 disabled:opacity-50" :disabled="params.page <= 1" @click="onPrev">«</button>
			<span class="px-2">{{ params.page }} / {{ totalPages }}</span>
			<button class="p-1 disabled:opacity-50" :disabled="params.page >= totalPages" @click="onNext">»</button>
		</div>
	</div>
</template>

<script lang="ts">

export { default } from './table-controls'

</script>

<style src="./table-controls.scss"></style>
