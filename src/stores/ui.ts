import { create } from "zustand";

interface UiState {
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isMenuOpen: false,
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
}));
