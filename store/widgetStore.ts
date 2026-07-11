import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WidgetPosition {
  x: number;
  y: number;
}

interface WidgetState {
  isVisible: boolean;
  isAnalyzerOpen: boolean;
  position: WidgetPosition;
  toggleVisibility: () => void;
  toggleAnalyzer: () => void;
  setPosition: (x: number, y: number) => void;
  resetPosition: () => void;
}

const DEFAULT_POSITION: WidgetPosition = {
  x: 0,
  y: 20,
};

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      isVisible: true,
      isAnalyzerOpen: false,
      position: DEFAULT_POSITION,
      toggleVisibility: () =>
        set((state) => ({ isVisible: !state.isVisible })),
      toggleAnalyzer: () =>
        set((state) => ({ isAnalyzerOpen: !state.isAnalyzerOpen })),
      setPosition: (x: number, y: number) =>
        set({ position: { x, y } }),
      resetPosition: () =>
        set({ position: DEFAULT_POSITION }),
    }),
    {
      name: 'dsa-widget-store',
      partialize: (state) => ({
        isVisible: state.isVisible,
        position: state.position,
      }),
    }
  )
);
