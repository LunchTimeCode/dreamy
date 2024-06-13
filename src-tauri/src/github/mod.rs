use crate::github::remote::GitHubDep;

pub mod remote;


async fn get_deps_from_github(org: &str, token: &str,github: &remote::Github) ->  Result<Vec<GitHubDep>, String>{
   let result =  github.get_repos(org, token).await?;
   let mut deps: Vec<GitHubDep> = vec![];
    
    for repo in result {
        let graph = github.get_graph(org, &repo.name, token).await;
        if  {  }
    }
    
    Ok(deps)
}
