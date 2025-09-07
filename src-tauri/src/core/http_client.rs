use crate::core::models::{HeaderKV, Request, Response};
use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use std::time::Duration;

pub async fn send(input: &Request) -> Result<Response, String> {
    // headers
    let mut headers = HeaderMap::new();
    for HeaderKV { key, value } in &input.headers {
        let name = HeaderName::from_bytes(key.as_bytes()).map_err(|e| e.to_string())?;
        let val = HeaderValue::from_str(value).map_err(|e| e.to_string())?;
        headers.insert(name, val);
    }

    // client
    let builder = reqwest::Client::builder()
        .timeout(Duration::from_millis(input.timeout_ms.unwrap_or(30_000)))
        .default_headers(headers);
    let builder = if input.insecure {
        builder.danger_accept_invalid_certs(true)
    } else {
        builder
    };
    let client = builder.build().map_err(|e| e.to_string())?;

    // request
    let method = reqwest::Method::from_bytes(input.method.as_bytes()).map_err(|e| e.to_string())?;
    let start = std::time::Instant::now();
    let mut req = client.request(method, &input.url);
    if let Some(b) = &input.body {
        req = req.body(b.clone());
    }
    let resp = req.send().await.map_err(|e| e.to_string())?;

    // response
    let status = resp.status().as_u16();
    let hdrs = resp
        .headers()
        .iter()
        .map(|(k, v)| HeaderKV {
            key: k.to_string(),
            value: v.to_str().unwrap_or("").to_string(),
        })
        .collect::<Vec<_>>();
    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    let duration = start.elapsed().as_millis();

    Ok(Response {
        status,
        headers: hdrs,
        body: bytes.to_vec(),
        duration_ms: duration,
        size_bytes: bytes.len(),
    })
}
