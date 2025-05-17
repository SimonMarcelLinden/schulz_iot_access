<template>
	<div>
		<div class="flex flex-col justify-center w-[560px]">
			<h1 class="text-3xl mb-4">Verfügbare Routen</h1>
			<div class="head flex flex-row  font-semibold mb-2">
				<div class="min-w-48">Routename</div>
				<div class="grow">Link</div>
			</div>
			<div class="body">
				<div class="flex flex-row justify-start" v-for="route in routes" :key="route.path">
					<div class="min-w-48 p-1">
						{{ route.name }}
					</div>
					<div class="grow-1 p-1">
						<a class="underline" :href=route.path :title="route.name">
							{{ route.path }}
						</a>
					</div>
				</div>
			</div>
		</div>

	</div>
</template>

<script lang="ts">

export { default } from './routes'

</script>
