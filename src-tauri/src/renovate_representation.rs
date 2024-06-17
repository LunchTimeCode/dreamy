use serde_derive::Deserialize;
use serde_derive::Serialize;
use std::collections::HashMap;

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Deps {
    pub organisation: String,
    pub repos: Vec<Repo>,
}
#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Repo {
    pub repo: String,
    pub organisation: String,
    pub package_data: Option<HashMap<String, Vec<DepGroup>>>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DepGroup {
    pub deps: Vec<Dep>,
    pub package_file: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Dep {
    pub dep_name: String,
    pub current_value: Option<String>,
}
