export interface FlatDep {
	uuid: string;
	org: string;
	repo: string;
	packageType: string;
	depName: string;
	currentValue: string;
}

export function flatDepKey(fd: FlatDep) {
	return fd.uuid;
}
