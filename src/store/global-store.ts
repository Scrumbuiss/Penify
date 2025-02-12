import { create } from "zustand";

type NavigationSidebar = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onChangeCollapsed: () => void;
};

export const useNavigationSidebarStore = create<NavigationSidebar>()((set) => ({
  collapsed: false,
  setCollapsed: (collapsed: boolean) => set({ collapsed }),
  onChangeCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
}));

type NavbarUserOptions = {
  showUserOptions: boolean;
  setShowUserOptions: (showUserOptions: boolean) => void;
};

export const useNavbarUserOptionsStore = create<NavbarUserOptions>((set) => ({
  showUserOptions: false,
  setShowUserOptions: (showUserOptions: boolean) => set({ showUserOptions }),
}));
