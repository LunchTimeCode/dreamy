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
	await invoke("load_into_store", { name: sourcePath });
}

export async function loadFromGithub(org: string, token: string) {
	await invoke("load_from_github", { org: org, token: token });
}

export async function loadIntoLocal() {
	await invoke("load_into_local");
}

export async function loadFromLocal() {
	await invoke("load_from_local");
}

export async function deleteLocal() {
	await invoke("delete_local");
}

export async function deleteMemory() {
	await invoke("delete_memory");
}

export async function deleteLocalAndMemoryDep(key: string) {
	await invoke("delete_local_and_memory_dep", { depId: key });
}
