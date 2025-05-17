import { defineStore } from "pinia";
import { ref, reactive, watch } from "vue";
import { pinia } from "@/store/index";

import { DeviceEnum, LayoutModeEnum, NAVBAR_CLOSED, NAVBAR_OPENED } from "@/_utils/constants/app-key";

import { getNavbarStatus, setNavbarStatus } from "@/_utils/cache/local-storage";

interface Navbar {
	opened: boolean;
	animation: boolean;
}

function handleNavbarStatus(opened: boolean): void {
	setNavbarStatus(opened ? NAVBAR_OPENED : NAVBAR_CLOSED);
}

export const useAppStore = defineStore("app", () => {
	const navbar = reactive<Navbar>({
		opened: getNavbarStatus() !== NAVBAR_CLOSED,
		animation: false,
	});

	const device = ref<DeviceEnum>(DeviceEnum.Desktop);
	const layout = ref<LayoutModeEnum>(LayoutModeEnum.Top);

	watch(
		() => navbar.opened,
		(opened) => {
			handleNavbarStatus(opened);
		},
	);

	const toggleNavbar = (animation: boolean): void => {
		navbar.opened = !navbar.opened;
		navbar.animation = animation;
	};

	const closeNavbar = (animation: boolean): void => {
		navbar.opened = false;
		navbar.animation = animation;
	};

	const toggleDevice = (value: DeviceEnum): void => {
		device.value = value;
	};

	return { device, navbar, layout, toggleNavbar, closeNavbar, toggleDevice };
});

/**
 */
export function useAppStoreOutside() {
	return useAppStore(pinia);
}
