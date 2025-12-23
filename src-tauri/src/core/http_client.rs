use crate::core::models::{AddToLocation, AuthConfig, HeaderKV, Request, RequestBody, Response};
use base64::{engine::general_purpose, Engine as _};
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use std::time::Duration;
use url::Url;

pub async fn send(input: &Request) -> Result<Response, String> {
    // Parse base URL
    let mut url = Url::parse(&input.url).map_err(|e| format!("Invalid URL: {}", e))?;

    // Add query params
    for param in &input.params {
        if param.enabled && !param.key.is_empty() {
            url.query_pairs_mut().append_pair(&param.key, &param.value);
        }
    }

    // Build headers
    let mut headers = HeaderMap::new();

    // Add custom headers
    for header in &input.headers {
        if header.enabled && !header.key.is_empty() {
            let name = HeaderName::from_bytes(header.key.as_bytes())
                .map_err(|e| format!("Invalid header name: {}", e))?;
            let val = HeaderValue::from_str(&header.value)
                .map_err(|e| format!("Invalid header value: {}", e))?;
            headers.insert(name, val);
        }
    }

    // Process authentication
    process_auth(&input.auth, &mut headers, &mut url)?;

    // Build client
    let builder = reqwest::Client::builder()
        .timeout(Duration::from_millis(input.timeout_ms.unwrap_or(30_000)))
        .default_headers(headers);

    let builder = if input.insecure {
        builder.danger_accept_invalid_certs(true)
    } else {
        builder
    };

    let client = builder.build().map_err(|e| e.to_string())?;

    // Build request
    let method = reqwest::Method::from_bytes(input.method.as_bytes())
        .map_err(|e| format!("Invalid HTTP method: {}", e))?;

    let at_ms = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis();
    let start = std::time::Instant::now();
    let mut req = client.request(method, url);

    // Process body
    req = process_body(req, &input.body)?;

    // Send request
    let resp = req
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    // Parse response
    let status = resp.status().as_u16();
    let hdrs = resp
        .headers()
        .iter()
        .map(|(k, v)| HeaderKV {
            key: k.to_string(),
            value: v.to_str().unwrap_or("").to_string(),
            enabled: true,
        })
        .collect::<Vec<_>>();

    let bytes = resp
        .bytes()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;
    let duration = start.elapsed().as_millis();

    Ok(Response {
        status,
        headers: hdrs,
        body: bytes.to_vec(),
        at_ms,
        duration_ms: duration,
        size_bytes: bytes.len(),
    })
}

fn process_auth(auth: &AuthConfig, headers: &mut HeaderMap, url: &mut Url) -> Result<(), String> {
    match auth {
        AuthConfig::None => {}
        AuthConfig::Bearer { token } => {
            let value = HeaderValue::from_str(&format!("Bearer {}", token))
                .map_err(|e| format!("Invalid bearer token: {}", e))?;
            headers.insert(AUTHORIZATION, value);
        }
        AuthConfig::Basic { username, password } => {
            let credentials = format!("{}:{}", username, password);
            let encoded = general_purpose::STANDARD.encode(credentials.as_bytes());
            let value = HeaderValue::from_str(&format!("Basic {}", encoded))
                .map_err(|e| format!("Invalid basic auth: {}", e))?;
            headers.insert(AUTHORIZATION, value);
        }
        AuthConfig::ApiKey { key, value, add_to } => match add_to {
            AddToLocation::Header => {
                let name = HeaderName::from_bytes(key.as_bytes())
                    .map_err(|e| format!("Invalid API key header name: {}", e))?;
                let val = HeaderValue::from_str(value)
                    .map_err(|e| format!("Invalid API key value: {}", e))?;
                headers.insert(name, val);
            }
            AddToLocation::Query => {
                url.query_pairs_mut().append_pair(key, value);
            }
        },
    }
    Ok(())
}

fn process_body(
    mut req: reqwest::RequestBuilder,
    body: &RequestBody,
) -> Result<reqwest::RequestBuilder, String> {
    match body {
        RequestBody::None => {}
        RequestBody::Json { content } => {
            // Validate JSON
            serde_json::from_str::<serde_json::Value>(content)
                .map_err(|e| format!("Invalid JSON: {}", e))?;

            req = req
                .header(CONTENT_TYPE, "application/json")
                .body(content.clone());
        }
        RequestBody::Text { content } => {
            req = req.header(CONTENT_TYPE, "text/plain").body(content.clone());
        }
        RequestBody::FormData { data } => {
            let mut form = reqwest::multipart::Form::new();
            for item in data {
                if item.enabled && !item.key.is_empty() {
                    form = form.text(item.key.clone(), item.value.clone());
                }
            }
            req = req.multipart(form);
        }
        RequestBody::XWwwFormUrlencoded { data } => {
            let params: Vec<(String, String)> = data
                .iter()
                .filter(|item| item.enabled && !item.key.is_empty())
                .map(|item| (item.key.clone(), item.value.clone()))
                .collect();
            req = req.form(&params);
        }
    }
    Ok(req)
}
