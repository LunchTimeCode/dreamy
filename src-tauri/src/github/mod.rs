use log::info;
use crate::github::remote::GitHubDep;

pub mod remote;


pub fn get_deps_from_github(org: &str, token: &str, github: &remote::Github) ->  Result<Vec<GitHubDep>, String>{
    println!("getting repos for : {:?}", org);
   let result =  github.get_repos(org, token)?;
   let mut deps: Vec<GitHubDep> = vec![];
    println!("got repos: {:?}", result);
    
    for repo in result {
        let graph = github.get_graph(org, &repo.name, token); 
        match graph {
            Ok(g) => {
                let mut extended: Vec<GitHubDep> = vec![];
                g.iter().for_each(|d| {
                    let ex = GitHubDep{
                       repo: Some(repo.name.clone()),
                        ..d.clone()
                    };
                    extended.push(ex)
                });
                
                deps.append(&mut extended)}
            Err(e) => info!("github error: {}", e.to_string())
        }
    }
    
    Ok(deps)
}
