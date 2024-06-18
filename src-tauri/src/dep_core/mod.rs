use serde_derive::{Deserialize, Serialize};

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize, Eq, Hash)]
#[serde(rename_all = "camelCase")]
pub struct FlatDep {
    pub org: String,
    pub repo: String,
    pub package_type: String,
    pub dep_name: String,
    pub license: String,
    pub current_value: Option<String>,
}

impl FlatDep {
    pub fn searchable_key(&self) -> String {
        self.dep_name.clone()
    }
}

use thiserror::Error;

#[derive(Error, Debug)]
pub enum DepError {
    #[error("Invalid attempt to load from file (reason {reason:?})")]
    File { reason: String },
    #[error("Api call error:: {0}")]
    ApiCall(String),
    #[error("Generic error:: {0}")]
    InvalidGeneric(String),
}

impl DepError {
    pub fn invalid_file(reason: &str) -> DepError {
        DepError::File {
            reason: reason.to_string(),
        }
    }
    pub fn invalid_file_s(reason: String) -> DepError {
        DepError::File {
            reason: reason.to_string(),
        }
    }

    pub fn invalid_api_call(reason: &str) -> DepError {
        DepError::ApiCall(reason.to_string())
    }
}

impl From<serde_json::Error> for DepError {
    fn from(value: serde_json::Error) -> Self {
        Self::File {
            reason: value.to_string(),
        }
    }
}

impl From<std::io::Error> for DepError {
    fn from(value: std::io::Error) -> Self {
        Self::File {
            reason: value.to_string(),
        }
    }
}
impl From<std::string::String> for DepError {
    fn from(value: std::string::String) -> Self {
        Self::InvalidGeneric(value.to_string())
    }
}
