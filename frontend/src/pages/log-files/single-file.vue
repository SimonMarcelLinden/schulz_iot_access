<!-- <template>
	<div class="h-full p-4 space-y-4">
		<div class="flex items-center justify-between mb-4">
			<div class="space-x-2">
				<button @click="rename"
					class="px-3 py-1 rounded shadow-sm text-sm border border-gray-400 text-gray-700 hover:bg-gray-100">
					<i class="fas fa-edit"></i> Umbenennen
				</button>
				<button @click="remove"
					class="px-3 py-1 rounded shadow-sm text-sm bg-red-500 text-white hover:bg-red-600">
					<i class="fas fa-trash"></i> Löschen
				</button>
				<button @click="send"
					class="px-3 py-1 rounded shadow-sm text-sm bg-blue-600 text-white hover:bg-blue-700">
					<i class="fas fa-paper-plane"></i> Versenden
				</button>
			</div>
		</div>

		<pre class="h-full bg-gray-50 py-4 rounded overflow-auto whitespace-pre-wrap">{{ content }}</pre>
	</div>
</template>


<script lang="ts">
export { default } from './single-file'

</script>

<style src="./single-file.scss" scoped></style> -->

<template>
	<div class="flex flex-col flex-1 min-h-0 w-full px-6 py-6 mx-auto overflow-hidden">
		<div class="flex flex-wrap flex-1 -mx-3 xl:flex-col">
			<div class="flex  flex-col p-2 space-y-6">
				<div class="space-y-1 text-xs mb-2">
					<div class="flex items-center justify-center mb-2">
						<div
							class="flex justify-center items-center w-12 h-12 rounded-xl bg-slate-800/10 p-3 text-slate-700">
							<i class="text-xl fas fa-file-alt text-slate-700"></i>
						</div>
					</div>
					<h2 class="text-2xl font-semibold text-center">Log-Datei</h2>
					<p class="text-center text-slate-500 mb-1">
						In the following area, you'll see the full contents of the log file "{{ filename }}."
						You can rename it, permanently delete it, or send it via email.
						To scroll, simply swipe up or down.</p>
				</div>
				<div
					class="bg-white rounded-2xl p-4 shadow flex flex-col items-center justify-between space-y-2 text-xs">
					<div class="flex w-full items-center justify-between">
						<div class="w-1/3 flex w-full items-center justify-center font-medium text-sm"
							@click.stop="openRename(filename)">
							<i class="fas fa-comment-dots"></i>
							<span class="sr-only flex-1 truncate mx-4">Umbenennen</span>
						</div>
						<div class="w-1/3 flex w-full items-center justify-center font-medium text-sm"
							@click.stop="shareLog(filename)">
							<i class="fas fa-paper-plane"></i>
							<span class="sr-only flex-1 truncate mx-4">Versenden</span>
						</div>
						<div class="w-1/3 flex w-full items-center justify-center font-medium text-sm"
							@click.stop="openDelete(filename)">
							<i class="fas fa-trash-alt"></i>
							<span class="sr-only flex-1 truncate mx-4">Löschen</span>
						</div>
					</div>
				</div>
				<div
					class="flex-1 bg-white rounded-2xl p-4 shadow flex flex-col items-center justify-between space-y-2 text-xs">
					<div class="h-full flex flex-1 w-full items-center justify-between">
						<div class="log-content h-full w-full flex flex-1 flex-row flex-nowrap gap-6">
							<div class="w-full h-full bg-gray-50 border border-solid border-gray-300 rounded-lg">
								<div class="log-scroll overflow-y-auto h-full">
									<textarea name="log-content" readonly
										class="w-full h-full bg-transparent border-none outline-none no-scrollbar">
										{{ content }}
									</textarea>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Modal Umbenennen -->
	<Modal v-model="renameModalVisible" @confirm="doRename" @close="renameModalVisible = false">
		<template #header>🖊️ Umbenennen</template>
		<template #default>
			<input v-model="newFilename" type="text" class="w-full border rounded px-2 py-1"
				placeholder="Neuer Dateiname" />
		</template>
	</Modal>

	<!-- Modal Löschen -->
	<Modal v-model="deleteModalVisible" @confirm="doDelete" @close="deleteModalVisible = false">
		<template #header>⚠️ Löschen bestätigen</template>
		<template #default>
			Soll die Log-Datei <strong>{{ pendingFilename }}</strong> wirklich gelöscht werden?
		</template>
	</Modal>
</template>

<script lang="ts">
export { default } from './single-file'
</script>

<style src="./single-file.scss" scoped></style>
