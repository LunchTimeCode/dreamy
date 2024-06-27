use std::time::{Duration, UNIX_EPOCH};

use chrono::prelude::DateTime;
use chrono::Utc;

use serde_derive::{Deserialize, Serialize};
use uuid::Uuid;

pub mod extraction;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize, Eq, Hash)]
#[serde(rename_all = "camelCase")]
pub struct FlatDep {
    pub uuid: Uuid,
    pub extraction_time: Duration,
    pub extraction_time_human: String,
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

    pub fn new(
        extraction_time: Duration,
        org: String,
        repo: String,
        package_type: String,
        dep_name: String,
        license: String,
        current_value: Option<String>,
    ) -> Self {
        let d = UNIX_EPOCH + extraction_time;
        let from = DateTime::<Utc>::from(d);
        let datetime = from;
        let timestamp_str = datetime.format("%d/%m/%Y").to_string();
        Self {
            uuid: random_id(),
            extraction_time,
            extraction_time_human: timestamp_str,
            org,
            repo,
            package_type,
            dep_name,
            license,
            current_value,
        }
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

pub fn random_id() -> Uuid {
    Uuid::new_v4()
}
