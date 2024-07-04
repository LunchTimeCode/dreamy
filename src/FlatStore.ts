import type {} from "@redux-devtools/extension"; // required for devtools typing
import { create } from "zustand";
import type { FlatDep } from "./Represenation";

interface Deps {
	flats: FlatDep[];
	clear: () => void;
	setDeps: (newElement: FlatDep[]) => void;
}

export const useFlatDeps = create<Deps>()((set) => ({
	flats: [],
	setDeps: (newElements) => set(() => ({ flats: newElements })),
	clear: () => set(() => ({ flats: [] })),
}));

interface LicenseDeps {
	flats: FlatDep[];
	clear: () => void;
	setDeps: (newElement: FlatDep[]) => void;
}

export const useLicenseFlatDeps = create<LicenseDeps>()((set) => ({
	flats: [],
	setDeps: (newElements) => set(() => ({ flats: newElements })),
	clear: () => set(() => ({ flats: [] })),
}));
