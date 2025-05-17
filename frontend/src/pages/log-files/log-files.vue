<template>
	<div class="flex flex-wrap my-6 -mx-3">
		<div class="flex-none w-full px-3">
			<div class="relative flex flex-col bg-white rounded-2xl shadow-soft-xl overflow-hidden">

				<!-- Suchfeld -->
				<div class="p-4">
					<div class="relative border border-gray-300 rounded-full">
						<i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
						<input v-model="query" type="search" placeholder="Suchen" :disabled="!filteredLogs.length"
							class="w-full pl-10 pr-4 py-2 rounded-full focus:outline-none placeholder-gray-400" />
					</div>
				</div>

				<!-- Liste -->
				<ul class="p-4 flex-1 overflow-auto">
					<li v-if="filteredLogs.length" v-for="row in filteredLogs" :key="row.filename"
						class="relative overflow-hidden mb-2 bg-white" style="touch-action: pan-y;"
						@touchstart="onTouchStart($event, row.filename)" @touchmove="onTouchMove($event, row.filename)"
						@touchend="onTouchEnd($event, row.filename)">
						<!-- Buttons dahinter -->
						<div class="absolute inset-y-0 right-0 flex text-white opacity-0 transition-opacity duration-200"
							:ref="setBtnRef(row.filename)">
							<button @click.stop="openRename(row.filename)"
								class="w-16 bg-yellow-400 flex items-center justify-center">
								<i class="fas fa-comment-dots text-white"></i>
							</button>
							<button @click.stop="shareLog(row.filename)"
								class="w-16 bg-blue-700 flex items-center justify-center">
								<i class="fas fa-paper-plane text-white"></i>
							</button>
							<button @click.stop="openDelete(row.filename)"
								class="w-16 bg-red-700 flex items-center justify-center">
								<i class="fas fa-trash-alt text-white"></i>
							</button>
						</div>

						<!-- Vordergrund -->
						<div @click="viewLog(row.filename)"
							class="w-full flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white relative z-10 transition-transform duration-200"
							:ref="setItemRef(row.filename)">
							<div class="flex flex-col">
								<span class="font-semibold">{{ row.filename }}</span>
								<span class="text-sm text-gray-400">{{ row.date }}</span>
							</div>
							<span class="text-sm text-gray-500">{{ row.date }}</span>
						</div>
					</li>

					<li v-else class="text-center text-gray-500">
						Keine Log-Dateien gefunden.
					</li>
				</ul>
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
	</div>
</template>

<script lang="ts">
export { default } from "./log-files";
</script>

<style lang="scss" src="./log-files.scss" scoped></style>
