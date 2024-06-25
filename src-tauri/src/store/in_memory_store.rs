use crate::dep_core::FlatDep;
use std::collections::HashSet;
use std::sync::Mutex;

#[derive(Default, Debug)]
pub struct ModelStore {
    model: Mutex<HashSet<FlatDep>>,
}

impl ModelStore {
    pub fn add(&self, deps: Vec<FlatDep>) {
        let mut model = self.model.lock().unwrap();

        for dep in deps {
            model.insert(dep);
        }
    }

    pub fn add_single(&self, dep: FlatDep) {
        let mut model = self.model.lock().unwrap();
        model.insert(dep);
    }

    pub fn all(&self) -> Vec<FlatDep> {
        let model = self.model.lock().unwrap();

        model.iter().cloned().collect()
    }
}
