use crate::read_model::FlatDep;
use reqwest::header;
use serde_derive::{Deserialize, Serialize};
use std::env;

pub struct Github {
    client: reqwest::Client,
}

impl Github {
    pub fn new() -> Self {
        println!("creating a client");
        let client = reqwest::Client::new();
        Self { client }
    }

    pub async fn get_repos(
        &self,
        org: &str,
        personal_token: &str,
    ) -> Result<Vec<GithubRepo>, String> {
        let token = if personal_token.is_empty() {
            env::var("GITHUB_TOKEN")
        } else {
            Ok(personal_token.to_string())
        };

        let Ok(token) = token else {
            return Err("no github token set".to_string());
        };

        let mut headers = header::HeaderMap::new();
        headers.insert("Accept", "application/vnd.github+json".parse().unwrap());
        headers.insert("X-GitHub-Api-Version", "2022-11-28".parse().unwrap());
        headers.insert("User-Agent", "Dreamy-App".parse().unwrap());

        let bearer = format!("Bearer {}", token);
        headers.insert("Authorization", bearer.parse().unwrap());

        let url = format!("https://api.github.com/orgs/{}/repos", org);

        let res = self
            .client
            .get(url)
            .headers(headers)
            .send()
            .await
            .map_err(|f| f.to_string());
        let json: Vec<GithubRepo> = res?.json().await.map_err(|f| f.to_string())?;

        Ok(json)
    }

    pub async fn get_graph(
        &self,
        org: &str,
        repo: &str,
        personal_token: &str,
    ) -> Result<Vec<GitHubDep>, String> {
        let token = if personal_token.is_empty() {
            env::var("GITHUB_TOKEN")
        } else {
            Ok(personal_token.to_string())
        };

        let Ok(token) = token else {
            return Err("no github token set".to_string());
        };

        let mut headers = header::HeaderMap::new();
        headers.insert("Accept", "application/vnd.github+json".parse().unwrap());
        headers.insert("X-GitHub-Api-Version", "2022-11-28".parse().unwrap());
        headers.insert("User-Agent", "Dreamy-App".parse().unwrap());

        let bearer = format!("Bearer {}", token);
        headers.insert("Authorization", bearer.parse().unwrap());

        let url = format!(
            "https://api.github.com/repos/{}/{}/dependency-graph/sbom",
            org, repo
        );

        println!("getting sbom for {:?}", repo);

        let res = self
            .client
            .get(url)
            .headers(headers)
            .send()
            .await
            .map_err(|f| f.to_string());

        let res = match res {
            Ok(r) => r,
            Err(err) => {
                eprintln!("could not get response {err}");
                return Err(err);
            }
        };

        if res.status() == 404 {
            return Ok(vec![]);
        }

        let as_text = res.text().await.map_err(|e| e.to_string())?;
        let bom = match serde_json::from_str::<RepoBom>(&as_text) {
            Ok(r) => r,
            Err(err) => {
                eprintln!("could not parse {err}");
                return Err(err.to_string());
            }
        };

        let deps = bom.to_github_deps(repo);
        Ok(deps)
    }
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GithubRepo {
    pub id: i64,
    pub name: String,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubDep {
    pub repo: String,
    pub name: String,
    pub version: String,
    pub license: String,
}

impl GitHubDep {
    pub fn to_flat_dep(&self, org: &str) -> FlatDep {
        FlatDep {
            org: org.to_string(),
            repo: self.repo.to_string(),
            package_type: "unknown".to_string(),
            dep_name: self.name.to_string(),
            current_value: Some(self.version.clone()),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct RepoBom {
    #[serde(rename = "sbom")]
    sbom: Sbom,
}

impl RepoBom {
    fn to_github_deps(&self, repo: &str) -> Vec<GitHubDep> {
        let mut deps: Vec<GitHubDep> = vec![];

        for package in self.sbom.packages.clone() {
            let license = match package.license_declared {
                None => package
                    .license_concluded
                    .unwrap_or_else(|| "none".to_string()),
                Some(l) => l,
            };

            let dep = GitHubDep {
                repo: repo.to_string(),
                name: package.name.to_string(),
                version: package.version_info.to_string(),
                license,
            };
            deps.push(dep)
        }

        deps
    }
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Sbom {
    name: String,
    packages: Vec<Package>,
}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Package {
    name: String,
    version_info: String,
    license_concluded: Option<String>,
    license_declared: Option<String>,
}