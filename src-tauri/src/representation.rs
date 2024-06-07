use serde_derive::Deserialize;
use serde_derive::Serialize;

#[derive(Default, Debug, Clone, PartialEq)]
pub struct Deps {
    pub repos: Vec<Repo>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Repo {
    pub repo: String,
    pub organisation: String,
    pub package_data: PackageData,
    pub metadata: Metadata,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageData {
    pub cargo: Option<Vec<Cargo>>,
    #[serde(rename = "github-actions")]
    pub github_actions: Option<Vec<Action>>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Cargo {
    pub deps: Vec<CargoDep>,
    pub package_file_version: String,
    pub package_file: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CargoDep {
    pub dep_name: String,
    pub dep_type: String,
    pub current_value: String,
    pub manager_data: ManagerData,
    pub datasource: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ManagerData {
    pub nested_version: bool,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Action {
    pub deps: Vec<ActionDep>,
    pub package_file: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActionDep {
    pub dep_name: String,
    pub commit_message_topic: Option<String>,
    pub datasource: String,
    pub versioning: Option<String>,
    pub dep_type: String,
    pub replace_string: String,
    pub auto_replace_string_template: String,
    pub current_value: String,
    pub skip_reason: Option<String>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Metadata {
    pub renovate: Renovate,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Renovate {
    pub major: i64,
    pub version: String,
    pub platform: String,
}
