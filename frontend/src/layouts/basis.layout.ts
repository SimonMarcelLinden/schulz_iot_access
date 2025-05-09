import { defineComponent, defineAsyncComponent, ref, type Ref, type DefineComponent } from "vue";

// Stores

// composables
import { useResize } from "@/layouts/composables/useResize";

// Types

// Components

// Templates
type BasisLayoutType = DefineComponent<{}, { isOnline: Ref<boolean> }, {}>;

const BasisLayout: BasisLayoutType = defineComponent({
	name: "BasisLayout",
	components: {
		NetworkStatusBanner: defineAsyncComponent(() => import("@/components/NetworkStatusBanner/NetworkStatusBanner.component.vue")),
		AppLayout: defineAsyncComponent(() => import("@/layouts/app.layout.vue")),
	},
	setup() {
		const isOnline = ref(navigator.onLine);
		useResize();
		return { isOnline };
	},
});

export default BasisLayout;
