use serde_derive::{Deserialize, Serialize};

use crate::representation::Deps;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize, Eq, Hash)]
#[serde(rename_all = "camelCase")]
pub struct FlatDep {
    pub org: String,
    pub repo: String,
    pub package_type: String,
    pub dep_name: String,
    pub current_value: Option<String>,
}

impl FlatDep {
    pub fn searchable_key(&self) -> String {
        self.dep_name.clone()
    }
}

pub fn flatten(root_deps: Deps) -> Vec<FlatDep> {
    let org = root_deps.organisation;

    let mut deps: Vec<FlatDep> = vec![];

    for repo in root_deps.repos.iter() {
        let repo_name = repo.repo.clone();

        for package in repo.package_data.iter() {
            for (package_type, groups) in package {
                let current_package_type = package_type.clone();

                for group in groups.iter() {
                    for dep in group.deps.clone() {
                        let flat = FlatDep {
                            org: org.clone(),
                            repo: repo_name.clone(),
                            package_type: current_package_type.clone(),
                            dep_name: dep.dep_name,
                            current_value: dep.current_value,
                        };
                        deps.push(flat)
                    }
                }
            }
        }
    }

    deps
}

#[cfg(test)]
mod test {
    use crate::read_model::flatten;
    use crate::representation::{Dep, DepGroup, Deps, Repo};
    use std::collections::HashMap;

    #[test]
    fn expeted_flattened() {
        let dep = Dep {
            dep_name: "serde".to_string(),
            current_value: Some("1.0".to_string()),
        };

        let dep2 = Dep {
            dep_name: "serde2".to_string(),
            current_value: Some("2.0".to_string()),
        };

        let dep_group = DepGroup {
            deps: vec![dep],
            package_file: "".to_string(),
        };

        let dep_group2 = DepGroup {
            deps: vec![dep2],
            package_file: "".to_string(),
        };

        let mut packages: HashMap<String, Vec<DepGroup>> = HashMap::new();
        packages.insert("cargo".to_string(), vec![dep_group, dep_group2]);

        let dep3 = Dep {
            dep_name: "serde3".to_string(),
            current_value: Some("4.0".to_string()),
        };

        let dep4 = Dep {
            dep_name: "serde4".to_string(),
            current_value: Some("5.0".to_string()),
        };

        let dep_group3 = DepGroup {
            deps: vec![dep3],
            package_file: "y".to_string(),
        };

        let dep_group4 = DepGroup {
            deps: vec![dep4],
            package_file: "x".to_string(),
        };

        let mut packages2: HashMap<String, Vec<DepGroup>> = HashMap::new();
        packages2.insert("actions".to_string(), vec![dep_group3, dep_group4]);

        let root = Deps {
            organisation: "testOrg".to_string(),
            repos: vec![
                Repo {
                    repo: "testRepoName".to_string(),
                    organisation: "testOrg".to_string(),
                    package_data: Some(packages.clone()),
                },
                Repo {
                    repo: "testRepoName2".to_string(),
                    organisation: "testOrg".to_string(),
                    package_data: Some(packages2.clone()),
                },
            ],
        };

        let flat = flatten(root);

        let len = flat.len();
        assert_eq!(len, 4)
    }
}
