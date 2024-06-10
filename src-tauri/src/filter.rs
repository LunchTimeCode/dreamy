use crate::loader::{load_flat, DepError};
use crate::read_model::FlatDep;
use fuzzy_matcher::skim::SkimMatcherV2;

pub fn load_with_filter(
    source_folder: &str,
    search_string: &str,
) -> Result<Vec<FlatDep>, DepError> {
    let deps = load_flat(source_folder)?;
    let matcher = SkimMatcherV2::default();
    Ok(on_flat_dep(deps, search_string, matcher))
}

struct OrderedFlatDep {
    score: f64,
    dep: FlatDep,
}

pub fn on_flat_dep(
    vec: Vec<FlatDep>,
    search_string: &str,
    _matcher: SkimMatcherV2,
) -> Vec<FlatDep> {
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
