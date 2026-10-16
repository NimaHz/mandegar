import { useEffect } from "react";
import { create } from "zustand";

interface NavigationState {
  pending: number;
  track: () => () => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  pending: 0,
  track: () => {
    let active = true;
    set(({ pending }) => ({ pending: pending + 1 }));
    return () => {
      if (!active) return;
      active = false;
      set(({ pending }) => ({ pending: pending - 1 }));
    };
  },
}));

export const useNavigationPending = () => useNavigationStore((state) => state.pending > 0);

export const useTrackNavigation = (pending: boolean) => {
  const track = useNavigationStore((state) => state.track);
  useEffect(() => (pending ? track() : undefined), [pending, track]);
};
