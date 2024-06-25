use crate::dep_core::FlatDep;

pub fn filter_deps(search_string: &str, deps: Vec<FlatDep>) -> Vec<FlatDep> {
    on_flat_dep(deps, search_string)
}

#[derive(Debug)]
struct OrderedFlatDep {
    matches: bool,
    dep: FlatDep,
}

pub fn on_flat_dep(vec: Vec<FlatDep>, search_string: &str) -> Vec<FlatDep> {
    let scored: Vec<OrderedFlatDep> = vec
        .iter()
        .map(|dep| {
            let res = dep.searchable_key().contains(search_string);

            OrderedFlatDep {
                matches: res,
                dep: dep.clone(),
            }
        })
        .collect();
    let highest = scored.iter().filter(|flat_dep| flat_dep.matches);
    highest.map(|f| f.dep.clone()).collect()
}
