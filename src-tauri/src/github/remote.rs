
use reqwest::Url;
use serde_derive::{Deserialize, Serialize};

pub struct Github{
    client: reqwest::blocking::Client
}

const REPO_URL: &str = "https://api.github.com/orgs/";
const GITHUB_VERSION_HEADER: &str = "X-GitHub-Api-Version";
const GITHUB_VERSION_VALUE: &str = "2022-11-28";

const REPOS_URL: &str = "https://api.github.com/repos";

impl Github{
   pub fn new() -> Self{
       println!("creating a client");
        let client = reqwest::blocking::Client::new();
        Self {
            client
        }
    }

    pub fn get_repos(&self, org: &str, personal_token: &str) ->  Result<Vec<GithubRepo>, String>{
        let base: Url = REPO_URL.parse().unwrap();
        let url = base.join(org);
        let url = url.unwrap().join("/repos").unwrap();
        println!("{:?}", url.to_string());
        let res = self.client.get(url)
            .bearer_auth(personal_token)
            .header(GITHUB_VERSION_HEADER, GITHUB_VERSION_VALUE)
            .send()
            .map_err(|f| f.to_string());
        println!("{:?}", res);
            let json = res?.json().map_err(|f|f.to_string())?;
        json
    }


    pub fn get_graph(&self, org: &str, repo: &str, personal_token: &str) ->  Result<Vec<GitHubDep>, String>{
        let base: Url = REPOS_URL.parse().unwrap();
        let url = base.join(org).unwrap();
        let url = url.join(repo).unwrap();
        let url = url.join("/dependency-graph/compare/main").unwrap();
        let res = self.client.get(url)
            .bearer_auth(personal_token)
            .header(GITHUB_VERSION_HEADER, GITHUB_VERSION_VALUE)
            .send()
            .map_err(|f| f.to_string())?
            .json().map_err(|f|f.to_string())?;
        println!("{:?}", res);
        res
    }

}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GithubRepo{
   pub id: String, 
   pub name: String,
}


#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubDep{
    pub repo: Option<String>,
    pub change_type: String,
    pub manifest: String,
    pub ecosystem: String,
    pub name: String,
    pub version: String,
    pub package_url: String,
    pub license: String,
    pub source_repository_url: String,
    pub vulnerabilities: Vec<Vuln>
}


#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Vuln{
    pub severity: String,
    pub advisory_ghsa_id: String,
    pub advisory_summary: String,
    pub advisory_url: String
}