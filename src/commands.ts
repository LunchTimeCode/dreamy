import { invoke } from "@tauri-apps/api/core";
import type { FlatDep } from "./Represenation.ts";

export async function loadFromStore(
	searchString: string,
): Promise<FlatDep[] | undefined> {
	console.log("trying to load with", searchString);
	const result = await invoke("load_from_store", {
		filter: searchString,
	});
	if (typeof result === "string") {
		const flat = asFlat(result);
		if (flat) {
			console.log("flats", flat);
			return flat;
		}
		console.log("no valid result: ", result);
		return undefined;
	}
}

function asFlat(raw: string): FlatDep[] | undefined {
	if (raw.length === 0) {
		return undefined;
	}
	try {
		return JSON.parse(raw);
	} catch (e) {
		return undefined;
	}
}

export async function loadIntoStore(sourcePath: string) {
	const result = await invoke("load_into_store", { name: sourcePath });
	console.log("result: ", result);
}

export async function loadFromGithub(org: string, token: string) {
	const result = await invoke("load_from_github", { org: org, token: token });
	console.log("result: ", result);
}

export async function loadIntoLocal() {
	const result = await invoke("load_into_local");
	console.log("result: ", result);
}

export async function loadFromLocal() {
	const result = await invoke("load_from_local");
	console.log("result: ", result);
}

export async function deleteLocal() {
	const result = await invoke("delete_local");
	console.log("result: ", result);
}

export async function deleteMemory() {
	const result = await invoke("delete_memory");
	console.log("result: ", result);
}
