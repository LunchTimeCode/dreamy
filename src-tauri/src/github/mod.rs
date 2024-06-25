use crate::{dep_core::DepError, github::remote::GitHubDep};

pub mod remote;

pub async fn get_deps_from_github(
    org: &str,
    token: &str,
    github: &remote::Github,
) -> Result<Vec<GitHubDep>, DepError> {
    let result = github.get_repos(org, token).await?;
    let mut deps: Vec<GitHubDep> = vec![];
    for repo in result {
        let graph = github.get_graph(org, &repo.name, token).await?;
        deps.append(&mut graph.clone())
    }
    Ok(deps)
}
