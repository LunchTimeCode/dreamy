use reqwest::{Client, Url};
use serde_derive::{Deserialize, Serialize};

struct Github{
    client: Client
}

const REPO_URL: &str = "https://api.github.com/orgs/";
const GITHUB_VERSION_HEADER: &str = "X-GitHub-Api-Version";
const GITHUB_VERSION_VALUE: &str = "2022-11-28";

impl Github{
    fn authenticated() -> Result<Self, String>{
        let client = Client::new();
        Ok(Self{
            client
        })
    }

    async fn get_repos(&self, org: &str, personal_token: &str)->  Result<Vec<GithubRepo>, String>{
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

}

#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GithubRepo{
    id: String,
    name: String,
}