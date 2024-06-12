use octocrab::{Octocrab, OctocrabBuilder};
use octocrab::models::orgs::Organization;

struct Github{
    crab: Octocrab 
}

impl Github{
    fn authenticated(personal_token: &str) -> Result<Self, String>{
        
        let crab = OctocrabBuilder::new();
        let secret_token :  secrecy::SecretString = personal_token.to_string().into();
        let crab = crab.personal_token(secret_token).build().map_err(|f|f.to_string())?;
        
        Ok(Self{crab})
    }
    
    async fn org_handle(&self,org: &str)-> Result<Organization, String >{
        self.crab.orgs(org).get().await.map_err(|f| f.to_string())
    }
}