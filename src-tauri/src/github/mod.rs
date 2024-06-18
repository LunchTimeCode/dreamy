use crate::{dep_core::DepError, github::remote::GitHubDep};

pub mod remote;

pub async fn get_deps_from_github(
    org: &str,
    token: &str,
    github: &remote::Github,
) -> Result<Vec<GitHubDep>, DepError> {
    println!("getting repos for : {:?}", org);
    let result = github.get_repos(org, token).await?;
    let mut deps: Vec<GitHubDep> = vec![];
    println!("repos: {:?}", result);
    for repo in result {
        let graph = github.get_graph(org, &repo.name, token).await;

        match graph {
            Ok(g) => deps.append(&mut g.clone()),
            Err(e) => println!("github error: {}", e),
        }
    }

    Ok(deps)
}
