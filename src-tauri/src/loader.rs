use crate::read_model::{flatten, FlatDep};
use crate::representation::{Deps, Repo};
use serde_json::Error;
use std::fs;
use std::fs::File;
use std::io::Read;
use std::path::PathBuf;

pub fn load_flat(source_folder: &str) -> Result<Vec<FlatDep>, DepError> {
    let mut organisation: Option<String> = None;
    let mut repos: Vec<Repo> = vec![];
    for entry in fs::read_dir(source_folder)? {
        let entry = entry?;
        let path = entry.path();

        let Some(ext) = path.extension() else {
            return Err(DepError::default());
        };

        if ext == "json" {
            println!("loading file, {:?}", path);
            let repo = load_from_file(path)?;
            repos.push(repo.clone());
            if organisation.is_none() {
                organisation = Some(repo.organisation)
            }
        }
    }

    let Some(organisation) = organisation else {
        return Err(DepError::default());
    };

    let x = flatten(Deps {
        organisation,
        repos,
    });

    Ok(x)
}

fn load_from_file(file_name: PathBuf) -> Result<Repo, DepError> {
    let mut file = File::open(file_name)?;
    let mut data = String::new();
    file.read_to_string(&mut data)?;
    let res: Repo = serde_json::from_str(&data)?;
    Ok(res)
}

#[derive(Debug, Clone, PartialEq)]
pub struct DepError {
    reason: String,
}

impl Default for DepError {
    fn default() -> Self {
        Self {
            reason: "general".to_string(),
        }
    }
}

impl From<Error> for DepError {
    fn from(value: Error) -> Self {
        Self {
            reason: value.to_string(),
        }
    }
}
impl From<std::io::Error> for DepError {
    fn from(value: std::io::Error) -> Self {
        Self {
            reason: value.to_string(),
        }
    }
}
