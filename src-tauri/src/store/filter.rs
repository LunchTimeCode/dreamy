use crate::dep_core::FlatDep;

pub fn filter_deps(search_string: &str, deps: Vec<FlatDep>) -> Vec<FlatDep> {
    on_flat_dep(deps, search_string)
}

struct OrderedFlatDep {
    score: f64,
    dep: FlatDep,
}

pub fn on_flat_dep(vec: Vec<FlatDep>, search_string: &str) -> Vec<FlatDep> {
    let scored: Vec<OrderedFlatDep> = vec
        .iter()
        .map(|dep| {
            let res = dep.searchable_key().contains(search_string);
            let score = match res {
                false => 0.,
                true => 1.0,
            };

            OrderedFlatDep {
                score,
                dep: dep.clone(),
            }
        })
        .collect();

    let highest = scored.iter().filter(|flat_dep| flat_dep.score == 1.);

    highest.map(|f| f.dep.clone()).collect()
}
