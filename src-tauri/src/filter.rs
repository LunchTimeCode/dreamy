use serde_derive::{Deserialize, Serialize};
use crate::read_model::FlatDep;

pub fn filter(name: &str, filter: &str){

}


#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Filter{
    pub org: String,
    pub repo: String,
    pub package_type: String,
    pub current_value: String,
}


impl Filter{
    pub fn onFlatDep(vec: Vec<FlatDep>){
        vec.iter().filter(|f| {

        });
    }

    pub fn compareToFlatDep()-> bool{

    }
}