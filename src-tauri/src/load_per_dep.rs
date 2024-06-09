use serde_derive::{Deserialize, Serialize};
use crate::loader;
use crate::loader::DepError;
use crate::read_model::FlatDep;

fn per_dep(source_folder: &str)-> Result<Vec<FlatDep>, DepError>{
    let flat = loader::load_flat(source_folder)?;
    
    
    
    todo!()
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PerDep {
    pub dep_name: String,
    pub meta: DepMeta
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DepMeta {
    pub org: String,
    pub repo: String,
    pub package_type: String,
    pub current_value: Option<String>,
}