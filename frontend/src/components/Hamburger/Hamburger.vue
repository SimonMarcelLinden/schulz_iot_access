<template>
	<div class="flex items-center mt-2 grow sm:mt-0 sm:mr-6 md:mr-0 lg:flex lg:basis-auto">
		<div class="flex items-center md:ml-auto md:pr-4"></div>
		<ul class="flex flex-row justify-end pl-0 mb-0 list-none md-max:w-full">
			<li class="flex items-center pl-4 xl:hidden">
				<div class="block p-0 transition-all ease-nav-brand text-sm text-slate-500" @click="toggleClick">
					<div class="w-4.5 overflow-hidden">
						<i class="ease-soft mb-0.75 relative block h-0.5 rounded-sm bg-slate-500 transition-all"></i>
						<i class="ease-soft mb-0.75 relative block h-0.5 rounded-sm bg-slate-500 transition-all"></i>
						<i class="ease-soft relative block h-0.5 rounded-sm bg-slate-500 transition-all"></i>
					</div>
				</div>
			</li>

		</ul>
	</div>
</template>

<script lang="ts">

export { default } from './hamburger'

</script>

<style src="./hamburger.scss"></style>
