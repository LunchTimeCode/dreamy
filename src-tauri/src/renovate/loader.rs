use super::process::flatten;
use super::renovate_representation;
use crate::dep_core::DepError;
use crate::dep_core::FlatDep;
use std::fs;
use std::fs::File;
use std::io::Read;
use std::path::PathBuf;

pub fn load_flat_from_file(source_folder: &str) -> Result<Vec<FlatDep>, DepError> {
    let mut organisation: Option<String> = None;
    let mut repos: Vec<renovate_representation::Repo> = vec![];
    for entry in fs::read_dir(source_folder).map_err(|e| DepError::invalid_file_s(e.to_string()))? {
        let entry = entry.map_err(|e| DepError::invalid_file_s(e.to_string()))?;
        let path = entry.path();

        let Some(ext) = path.extension() else {
            return Err(DepError::File {
                reason: "no extension found".to_string(),
            });
        };

        if ext == "json" {
            let repo = load_from_file(path)?;
            repos.push(repo.clone());
            if organisation.is_none() {
                organisation = Some(repo.organisation)
            }
        }
    }

    let Some(organisation) = organisation else {
        return Err(DepError::invalid_file("no organisation resolved"));
    };

    let x = flatten(renovate_representation::Deps {
        organisation,
        repos,
    });

    Ok(x)
}

fn load_from_file(file_name: PathBuf) -> Result<renovate_representation::Repo, DepError> {
    let mut file = File::open(file_name)?;
    let mut data = String::new();
    file.read_to_string(&mut data)?;
    let res: renovate_representation::Repo = serde_json::from_str(&data)?;
    Ok(res)
}
