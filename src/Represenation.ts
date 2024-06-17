export interface FlatDep {
	org: string;
	repo: string;
	packageType: string;
	depName: string;
	currentValue: string;
}

export function flatDepKey(fd: FlatDep) {
	return (
		fd.org +
		fd.currentValue +
		fd.depName +
		fd.repo +
		fd.packageType +
		Math.random()
	);
}
