use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct HeaderKV {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Request {
    pub method: String,
    pub url: String,
    pub headers: Vec<HeaderKV>,
    pub body: Option<String>,
    pub timeout_ms: Option<u64>,
    pub insecure: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Response {
    pub status: u16,
    pub headers: Vec<HeaderKV>,
    pub body: Vec<u8>,
    pub duration_ms: u128,
    pub size_bytes: usize,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct HistoryItem {
    pub at_ms: u128,
    pub request: Request,
    pub response: Response,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Api {
    pub id: String,
    pub name: String,
    pub request: Request,
}
