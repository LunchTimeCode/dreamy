
use reqwest::{Client, Url};
use serde_derive::{Deserialize, Serialize};

pub struct Github{
    client: Client
}

const REPO_URL: &str = "https://api.github.com/orgs/";
const GITHUB_VERSION_HEADER: &str = "X-GitHub-Api-Version";
const GITHUB_VERSION_VALUE: &str = "2022-11-28";

const REPOS_URL: &str = "https://api.github.com/repos";

impl Github{
   pub fn authenticated() -> Result<Self, String>{
        let client = Client::new();
        Ok(Self{
            client
        })
    }

    pub async fn get_repos(&self, org: &str, personal_token: &str) ->  Result<Vec<GithubRepo>, String>{
        let base: Url = REPO_URL.parse().unwrap();
        let url = base.join(org);
        let url = url.unwrap().join("/repos").unwrap();
        self.client.get(url)
            .bearer_auth(personal_token)
            .header(GITHUB_VERSION_HEADER, GITHUB_VERSION_VALUE)
            .send()
            .await.map_err(|f| f.to_string())?
            .json().await.map_err(|f|f.to_string())?
    }


    pub async fn get_graph(&self, org: &str, repo: &str, personal_token: &str) ->  Result<Vec<GitHubDep>, String>{
        let base: Url = REPOS_URL.parse().unwrap();
        let url = base.join(org).unwrap();
        let url = url.join(repo).unwrap();
        let url = url.join("/dependency-graph/compare/main").unwrap();
        self.client.get(url)
            .bearer_auth(personal_token)
            .header(GITHUB_VERSION_HEADER, GITHUB_VERSION_VALUE)
            .send()
            .await.map_err(|f| f.to_string())?
            .json().await.map_err(|f|f.to_string())?
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
    change_type: String,
    manifest: String,
    ecosystem: String,
    name: String,
    version: String,
    package_url: String,
    license: String,
    source_repository_url: String,
    vulnerabilities: Vec<Vuln>
}


#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Vuln{
    severity: String,
    advisory_ghsa_id: String,
    advisory_summary: String,
    advisory_url: String
}