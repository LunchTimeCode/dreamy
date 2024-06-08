interface OrgWrapper {
  organisation: string;
  repos: readonly Repo[];
}

interface Repo {
  repo: string;
  organisation: string;
  packageData?: Map<string, DepGroup[]> | undefined;
}

interface DepGroup {
  packageName: string | undefined;
  deps: Dep[];
}

interface Dep {
  repo: string | undefined;
  packageName: string | undefined;
  depName: string;
  currentValue: string;
}
