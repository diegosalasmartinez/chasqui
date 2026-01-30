use chasqui_lib::core::models::{
    AddToLocation, AuthConfig, HeaderKV, KeyValuePair, Request, RequestBody,
};
use chasqui_lib::core::http_client;
use wiremock::matchers::{body_string, header, method, path, query_param};
use wiremock::{Mock, MockServer, ResponseTemplate};

fn base_request(url: &str) -> Request {
    Request {
        method: "GET".to_string(),
        url: url.to_string(),
        params: vec![],
        headers: vec![],
        auth: AuthConfig::None,
        body: RequestBody::None,
        timeout_ms: Some(5000),
        insecure: false,
    }
}

#[tokio::test]
async fn test_simple_get_request() {
    let mock_server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/api/users"))
        .respond_with(ResponseTemplate::new(200).set_body_string(r#"{"ok": true}"#))
        .mount(&mock_server)
        .await;

    let req = base_request(&format!("{}/api/users", mock_server.uri()));
    let response = http_client::send(&req).await.unwrap();

    assert_eq!(response.status, 200);
    assert_eq!(String::from_utf8_lossy(&response.body), r#"{"ok": true}"#);
}

#[tokio::test]
async fn test_query_params() {
    let mock_server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/search"))
        .and(query_param("q", "rust"))
        .and(query_param("limit", "10"))
        .respond_with(ResponseTemplate::new(200))
        .mount(&mock_server)
        .await;

    let mut req = base_request(&format!("{}/search", mock_server.uri()));
    req.params = vec![
        KeyValuePair {
            key: "q".to_string(),
            value: "rust".to_string(),
            enabled: true,
        },
        KeyValuePair {
            key: "limit".to_string(),
            value: "10".to_string(),
            enabled: true,
        },
        KeyValuePair {
            key: "ignored".to_string(),
            value: "value".to_string(),
            enabled: false, // Should be ignored
        },
    ];

    let response = http_client::send(&req).await.unwrap();
    assert_eq!(response.status, 200);
}

#[tokio::test]
async fn test_custom_headers() {
    let mock_server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/api"))
        .and(header("X-Custom-Header", "custom-value"))
        .and(header("X-Api-Version", "2"))
        .respond_with(ResponseTemplate::new(200))
        .mount(&mock_server)
        .await;

    let mut req = base_request(&format!("{}/api", mock_server.uri()));
    req.headers = vec![
        HeaderKV {
            key: "X-Custom-Header".to_string(),
            value: "custom-value".to_string(),
            enabled: true,
        },
        HeaderKV {
            key: "X-Api-Version".to_string(),
            value: "2".to_string(),
            enabled: true,
        },
        HeaderKV {
            key: "X-Disabled".to_string(),
            value: "should-not-be-sent".to_string(),
            enabled: false,
        },
    ];

    let response = http_client::send(&req).await.unwrap();
    assert_eq!(response.status, 200);
}

#[tokio::test]
async fn test_bearer_auth() {
    let mock_server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/protected"))
        .and(header("Authorization", "Bearer my-secret-token"))
        .respond_with(ResponseTemplate::new(200))
        .mount(&mock_server)
        .await;

    let mut req = base_request(&format!("{}/protected", mock_server.uri()));
    req.auth = AuthConfig::Bearer {
        token: "my-secret-token".to_string(),
    };

    let response = http_client::send(&req).await.unwrap();
    assert_eq!(response.status, 200);
}

#[tokio::test]
async fn test_basic_auth() {
    let mock_server = MockServer::start().await;

    // "user:pass" base64 encoded is "dXNlcjpwYXNz"
    Mock::given(method("GET"))
        .and(path("/protected"))
        .and(header("Authorization", "Basic dXNlcjpwYXNz"))
        .respond_with(ResponseTemplate::new(200))
        .mount(&mock_server)
        .await;

    let mut req = base_request(&format!("{}/protected", mock_server.uri()));
    req.auth = AuthConfig::Basic {
        username: "user".to_string(),
        password: "pass".to_string(),
    };

    let response = http_client::send(&req).await.unwrap();
    assert_eq!(response.status, 200);
}

#[tokio::test]
async fn test_api_key_in_header() {
    let mock_server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/api"))
        .and(header("X-API-Key", "secret-key-123"))
        .respond_with(ResponseTemplate::new(200))
        .mount(&mock_server)
        .await;

    let mut req = base_request(&format!("{}/api", mock_server.uri()));
    req.auth = AuthConfig::ApiKey {
        key: "X-API-Key".to_string(),
        value: "secret-key-123".to_string(),
        add_to: AddToLocation::Header,
    };

    let response = http_client::send(&req).await.unwrap();
    assert_eq!(response.status, 200);
}

#[tokio::test]
async fn test_api_key_in_query() {
    let mock_server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/api"))
        .and(query_param("api_key", "secret-key-123"))
        .respond_with(ResponseTemplate::new(200))
        .mount(&mock_server)
        .await;

    let mut req = base_request(&format!("{}/api", mock_server.uri()));
    req.auth = AuthConfig::ApiKey {
        key: "api_key".to_string(),
        value: "secret-key-123".to_string(),
        add_to: AddToLocation::Query,
    };

    let response = http_client::send(&req).await.unwrap();
    assert_eq!(response.status, 200);
}

#[tokio::test]
async fn test_post_json_body() {
    let mock_server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/api/users"))
        .and(header("content-type", "application/json"))
        .and(body_string(r#"{"name":"John","age":30}"#))
        .respond_with(ResponseTemplate::new(201))
        .mount(&mock_server)
        .await;

    let mut req = base_request(&format!("{}/api/users", mock_server.uri()));
    req.method = "POST".to_string();
    req.body = RequestBody::Json {
        content: r#"{"name":"John","age":30}"#.to_string(),
    };

    let response = http_client::send(&req).await.unwrap();
    assert_eq!(response.status, 201);
}

#[tokio::test]
async fn test_post_text_body() {
    let mock_server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/api/text"))
        .and(header("content-type", "text/plain"))
        .and(body_string("Hello, World!"))
        .respond_with(ResponseTemplate::new(200))
        .mount(&mock_server)
        .await;

    let mut req = base_request(&format!("{}/api/text", mock_server.uri()));
    req.method = "POST".to_string();
    req.body = RequestBody::Text {
        content: "Hello, World!".to_string(),
    };

    let response = http_client::send(&req).await.unwrap();
    assert_eq!(response.status, 200);
}

#[tokio::test]
async fn test_post_form_urlencoded() {
    let mock_server = MockServer::start().await;

    Mock::given(method("POST"))
        .and(path("/api/form"))
        .and(header("content-type", "application/x-www-form-urlencoded"))
        .and(body_string("username=john&password=secret"))
        .respond_with(ResponseTemplate::new(200))
        .mount(&mock_server)
        .await;

    let mut req = base_request(&format!("{}/api/form", mock_server.uri()));
    req.method = "POST".to_string();
    req.body = RequestBody::XWwwFormUrlencoded {
        data: vec![
            KeyValuePair {
                key: "username".to_string(),
                value: "john".to_string(),
                enabled: true,
            },
            KeyValuePair {
                key: "password".to_string(),
                value: "secret".to_string(),
                enabled: true,
            },
        ],
    };

    let response = http_client::send(&req).await.unwrap();
    assert_eq!(response.status, 200);
}

#[tokio::test]
async fn test_different_http_methods() {
    let mock_server = MockServer::start().await;

    for http_method in ["PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] {
        Mock::given(method(http_method))
            .and(path("/resource"))
            .respond_with(ResponseTemplate::new(200))
            .mount(&mock_server)
            .await;

        let mut req = base_request(&format!("{}/resource", mock_server.uri()));
        req.method = http_method.to_string();

        let response = http_client::send(&req).await.unwrap();
        assert_eq!(response.status, 200, "Failed for method: {}", http_method);
    }
}

#[tokio::test]
async fn test_response_headers_captured() {
    let mock_server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/api"))
        .respond_with(
            ResponseTemplate::new(200)
                .insert_header("X-Response-Id", "12345")
                .insert_header("X-Rate-Limit", "100"),
        )
        .mount(&mock_server)
        .await;

    let req = base_request(&format!("{}/api", mock_server.uri()));
    let response = http_client::send(&req).await.unwrap();

    let response_id = response
        .headers
        .iter()
        .find(|h| h.key == "x-response-id")
        .map(|h| h.value.as_str());
    let rate_limit = response
        .headers
        .iter()
        .find(|h| h.key == "x-rate-limit")
        .map(|h| h.value.as_str());

    assert_eq!(response_id, Some("12345"));
    assert_eq!(rate_limit, Some("100"));
}

#[tokio::test]
async fn test_response_metadata() {
    let mock_server = MockServer::start().await;

    Mock::given(method("GET"))
        .and(path("/api"))
        .respond_with(ResponseTemplate::new(200).set_body_string("Hello"))
        .mount(&mock_server)
        .await;

    let req = base_request(&format!("{}/api", mock_server.uri()));
    let response = http_client::send(&req).await.unwrap();

    assert_eq!(response.status, 200);
    assert_eq!(response.size_bytes, 5); // "Hello" is 5 bytes
    // duration_ms can be 0 for very fast local requests
    assert!(response.at_ms > 0);
}

#[tokio::test]
async fn test_invalid_json_body_returns_error() {
    let mock_server = MockServer::start().await;

    let mut req = base_request(&format!("{}/api", mock_server.uri()));
    req.method = "POST".to_string();
    req.body = RequestBody::Json {
        content: "{ invalid json }".to_string(),
    };

    let result = http_client::send(&req).await;
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Invalid JSON"));
}

#[tokio::test]
async fn test_invalid_url_returns_error() {
    let req = base_request("not-a-valid-url");
    let result = http_client::send(&req).await;

    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Invalid URL"));
}
