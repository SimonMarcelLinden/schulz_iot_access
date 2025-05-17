<template>
	<footer class="mt-auto pt-4">
		<div class="w-full px-6 mx-auto">
			<div class="flex flex-wrap items-center -mx-3 lg:justify-between">
				<div class="w-full max-w-full px-3 mt-0 mb-6 shrink-0 lg:mb-0 lg:w-1/2 lg:flex-none">
					<div class="leading-normal text-center text-sm text-slate-500 lg:text-left">
						© 2025, Schulz Hygiene GmbH.
					</div>
				</div>
				<div class="w-full max-w-full px-3 mt-0 shrink-0 lg:w-1/2 lg:flex-none">
					<ul class="flex flex-wrap justify-center pl-0 mb-0 list-none lg:justify-end">
						<li class="nav-item">
							<router-link :to="{ name: 'AboutUs' }"
								class="block px-4 pt-0 pb-1 font-normal transition-colors ease-soft-in-out text-sm text-slate-500"
								target="_blank">About Us
							</router-link>

						</li>
						<li class="nav-item">
							<a href="https://www.schulz-hygiene.de"
								class="block px-4 pt-0 pb-1 font-normal transition-colors ease-soft-in-out text-sm text-slate-500"
								target="_blank" rel="noopener noreferrer">
								Webseite
							</a>
						</li>
						<li class="nav-item">
							<router-link :to="{ name: 'License' }"
								class="block px-4 pt-0 pb-1 font-normal transition-colors ease-soft-in-out text-sm text-slate-500"
								target="_blank">License
							</router-link>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</footer>
</template>

<script lang="ts">

export { default } from './footer'

</script>

<style src="./footer.scss"></style>
