use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct KeyValuePair {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

pub type HeaderKV = KeyValuePair;
pub type QueryParam = KeyValuePair;

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(tag = "type")]
pub enum AuthConfig {
    #[serde(rename = "none")]
    None,
    #[serde(rename = "bearer")]
    Bearer { token: String },
    #[serde(rename = "basic")]
    Basic { username: String, password: String },
    #[serde(rename = "api-key")]
    ApiKey {
        key: String,
        value: String,
        #[serde(rename = "addTo")]
        add_to: AddToLocation,
    },
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum AddToLocation {
    Header,
    Query,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(tag = "type")]
pub enum RequestBody {
    #[serde(rename = "none")]
    None,
    #[serde(rename = "json")]
    Json { content: String },
    #[serde(rename = "text")]
    Text { content: String },
    #[serde(rename = "form-data")]
    FormData { data: Vec<KeyValuePair> },
    #[serde(rename = "x-www-form-urlencoded")]
    XWwwFormUrlencoded { data: Vec<KeyValuePair> },
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Request {
    pub method: String,
    pub url: String,
    pub params: Vec<QueryParam>,
    pub headers: Vec<HeaderKV>,
    pub auth: AuthConfig,
    pub body: RequestBody,
    pub timeout_ms: Option<u64>,
    pub insecure: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Response {
    pub status: u16,
    pub headers: Vec<HeaderKV>,
    pub body: Vec<u8>,
    pub at_ms: u128,
    pub duration_ms: u128,
    pub size_bytes: usize,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct HistoryItem {
    pub id: String,
    pub at_ms: u128,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub workspace_id: Option<String>,
    pub request: Request,
    pub response: Response,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Folder {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub workspace_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Api {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub folder_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub workspace_id: Option<String>,
    pub request: Request,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvVariable {
    pub key: String,
    pub value: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub initial_value: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Environment {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub workspace_id: Option<String>,
    pub variables: Vec<EnvVariable>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workspace {
    pub id: String,
    pub name: String,
}
