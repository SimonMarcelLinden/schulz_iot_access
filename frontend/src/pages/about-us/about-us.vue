<!-- src/views/AboutUs.vue -->
<template>
	<div class="about-us p-6 max-w-3xl mx-auto">
		<h1 class="text-3xl font-bold mb-4">Über uns</h1>
		<p class="mb-4">
			Willkommen bei HS-Access, deiner internen Desktop- und Weblösung für die Firma Schulz GmbH.
			Unser Team arbeitet kontinuierlich daran, dir die beste Nutzererfahrung zu bieten.
		</p>
		<section class="versions mb-6">
			<h2 class="text-2xl font-semibold mb-2">Version & Changelog</h2>
			<ul class="list-disc list-inside">
				<li>
					<strong>v1.0.0</strong> (28. Mai 2025): Erstveröffentlichung
				</li>
			</ul>
		</section>
		<section class="team">
			<h2 class="text-2xl font-semibold mb-2">Unser Team</h2>
			<p>
				IT-Administrator: <a href="https://github.com/SimonMarcelLinden" target="_blank" rel="noopener">Simon
					Marcel Linden</a><br>
				Full-Stack-Entwickler: <a href="https://github.com/SimonMarcelLinden" target="_blank"
					rel="noopener">Simon Marcel Linden</a><br>
			</p>
		</section>
		<section class="support mb-6">
			<h2 class="text-2xl font-semibold mb-2">Feedback & Bug-Meldungen</h2>
			<p>
				Wenn du Bugs findest oder Feedback hast, erstelle bitte ein Issue auf
				<a href="https://github.com/Schulz-GmbH/schulz_ht_access/issues" target="_blank" rel="noopener">GitHub
					Issues</a>
				oder schicke uns eine E-Mail an
				<a href="mailto:entwicklung@schulz-hygiene.de">entwicklung@schulz-hygiene.de</a>.
			</p>
		</section>
	</div>
</template>

<script lang="ts">
export { default } from './about-us'

</script>

<style src="./about-us.scss" scoped></style>
