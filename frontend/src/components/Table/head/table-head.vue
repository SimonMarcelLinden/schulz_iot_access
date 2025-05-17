<template>
	<thead class="align-bottom">
		<tr>
			<th v-for="col in columns" :key="col.key" @click="$emit('sort', col.key)"
				class="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">
				<div class="flex justify-start items-center">
					<span>{{ col.label }}</span>
					<i v-if="sortKey === col.key" class="ml-1"
						:class="sortOrder === 'asc' ? 'fa fa-sort-up' : 'fa fa-sort-down'"></i>
				</div>
			</th>
		</tr>
	</thead>
</template>

<script lang="ts">

export { default } from './table-head'

</script>

<style src="./table-head.scss"></style>
