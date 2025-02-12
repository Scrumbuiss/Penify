import { create } from "zustand";

type Login = {
  isOpen: boolean;
  onChange: () => void;
};

export const useLoginStore = create<Login>()((set) => ({
  isOpen: false,
  onChange: () => set((state) => ({ isOpen: !state.isOpen })),
}));
