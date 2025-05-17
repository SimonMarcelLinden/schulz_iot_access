<template>
	<tbody>
		<template v-if="loading">
			<tr v-for="n in skeletonRows" :key="n">
				<td v-for="col in columns" :key="col.key"
					class="p-4 align-middle bg-transparent border-b border-gray-200 whitespace-nowrap shadow-transparent">
					<div class="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
				</td>
			</tr>
		</template>
		<template v-else>
			<tr v-for="(row, rowIndex) in data" :key="row.id || rowIndex">
				<td v-for="(col, colIndex) in columns" :key="col.key || colIndex" @click="handleColumnClicked(row, col)"
					class="p-4 align-middle bg-transparent border-b border-gray-200 whitespace-nowrap shadow-transparent">
					<slot :name="col.slot" :row="row" :column="col" :value="row[col.key]">
						<!-- Fallback: einfache Anzeige des Werts -->
						<div class="flex pr-2">
							<div class="my-auto flex w-26 lg:w-auto">
								<h6 class="mb-0 text-sm leading-normal
								flex-1 overflow-hidden whitespace-nowrap truncate">
									{{ row[col.key] }}
								</h6>
							</div>
						</div>
					</slot>
				</td>
			</tr>
		</template>
	</tbody>
</template>
<script lang="ts">

export { default } from './table-body'

</script>

<style src="./table-body.scss"></style>
