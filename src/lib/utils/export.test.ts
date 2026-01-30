import { describe, it, expect } from 'vitest';
import { toCurl, toHttp, toFetch, toAxios, toPython, toPhp, toGo, exportRequest, type ExportOptions } from './export';
import type { Request } from '$lib/types/http';

function createRequest(overrides: Partial<Request> = {}): Request {
    return {
        method: 'GET',
        url: 'https://api.example.com/users',
        params: [],
        headers: [],
        auth: { type: 'none' },
        body: { type: 'none' },
        insecure: false,
        ...overrides,
    };
}

describe('toCurl', () => {
    it('generates simple GET request', () => {
        const request = createRequest();
        const result = toCurl(request);

        expect(result).toContain('curl');
        expect(result).toContain("'https://api.example.com/users'");
        expect(result).not.toContain('-X'); // GET is default
    });

    it('includes method for non-GET requests', () => {
        const request = createRequest({ method: 'POST' });
        const result = toCurl(request);

        expect(result).toContain('-X POST');
    });

    it('includes query parameters in URL', () => {
        const request = createRequest({
            params: [
                { key: 'page', value: '1', enabled: true },
                { key: 'limit', value: '10', enabled: true },
                { key: 'disabled', value: 'ignored', enabled: false },
            ],
        });
        const result = toCurl(request);

        expect(result).toContain('page=1');
        expect(result).toContain('limit=10');
        expect(result).not.toContain('disabled');
    });

    it('includes custom headers', () => {
        const request = createRequest({
            headers: [
                { key: 'X-Custom', value: 'value', enabled: true },
                { key: 'X-Disabled', value: 'ignored', enabled: false },
            ],
        });
        const result = toCurl(request);

        expect(result).toContain("-H 'X-Custom: value'");
        expect(result).not.toContain('X-Disabled');
    });

    it('includes Bearer auth header', () => {
        const request = createRequest({
            auth: { type: 'bearer', token: 'my-token-123' },
        });
        const result = toCurl(request);

        expect(result).toContain("-H 'Authorization: Bearer my-token-123'");
    });

    it('includes Basic auth header', () => {
        const request = createRequest({
            auth: { type: 'basic', username: 'user', password: 'pass' },
        });
        const result = toCurl(request);

        // "user:pass" base64 = "dXNlcjpwYXNz"
        expect(result).toContain("-H 'Authorization: Basic dXNlcjpwYXNz'");
    });

    it('includes API key in header', () => {
        const request = createRequest({
            auth: { type: 'api-key', key: 'X-API-Key', value: 'secret', addTo: 'header' },
        });
        const result = toCurl(request);

        expect(result).toContain("-H 'X-API-Key: secret'");
    });

    it('includes API key in query', () => {
        const request = createRequest({
            auth: { type: 'api-key', key: 'api_key', value: 'secret', addTo: 'query' },
        });
        const result = toCurl(request);

        expect(result).toContain('api_key=secret');
    });

    it('includes JSON body with content-type', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'json', content: '{"name":"test"}' },
        });
        const result = toCurl(request);

        expect(result).toContain("-H 'Content-Type: application/json'");
        expect(result).toContain("-d '{\"name\":\"test\"}'");
    });

    it('includes text body', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'text', content: 'Hello World' },
        });
        const result = toCurl(request);

        expect(result).toContain("-H 'Content-Type: text/plain'");
        expect(result).toContain("-d 'Hello World'");
    });

    it('includes form-urlencoded body', () => {
        const request = createRequest({
            method: 'POST',
            body: {
                type: 'x-www-form-urlencoded',
                data: [
                    { key: 'username', value: 'john', enabled: true },
                    { key: 'password', value: 'secret', enabled: true },
                ],
            },
        });
        const result = toCurl(request);

        expect(result).toContain("-H 'Content-Type: application/x-www-form-urlencoded'");
        expect(result).toContain("-d 'username=john&password=secret'");
    });

    it('includes form-data as -F flags', () => {
        const request = createRequest({
            method: 'POST',
            body: {
                type: 'form-data',
                data: [
                    { key: 'field1', value: 'value1', enabled: true },
                    { key: 'field2', value: 'value2', enabled: true },
                ],
            },
        });
        const result = toCurl(request);

        expect(result).toContain("-F 'field1=value1'");
        expect(result).toContain("-F 'field2=value2'");
    });

    it('includes --insecure flag when enabled', () => {
        const request = createRequest({ insecure: true });
        const result = toCurl(request);

        expect(result).toContain('--insecure');
    });

    it('escapes single quotes in body', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'json', content: '{"message":"it\'s working"}' },
        });
        const result = toCurl(request);

        expect(result).toContain("'\\''");
    });
});

describe('toHttp', () => {
    it('generates HTTP request line', () => {
        const request = createRequest();
        const result = toHttp(request);

        expect(result).toContain('GET /users HTTP/1.1');
        expect(result).toContain('Host: api.example.com');
    });

    it('includes query parameters in path', () => {
        const request = createRequest({
            params: [{ key: 'page', value: '1', enabled: true }],
        });
        const result = toHttp(request);

        expect(result).toContain('GET /users?page=1 HTTP/1.1');
    });

    it('includes headers', () => {
        const request = createRequest({
            headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
        });
        const result = toHttp(request);

        expect(result).toContain('Accept: application/json');
    });

    it('includes Bearer auth header', () => {
        const request = createRequest({
            auth: { type: 'bearer', token: 'token123' },
        });
        const result = toHttp(request);

        expect(result).toContain('Authorization: Bearer token123');
    });

    it('includes body with blank line separator', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'json', content: '{"test":true}' },
        });
        const result = toHttp(request);
        const lines = result.split('\n');

        // Find blank line before body
        const blankLineIndex = lines.findIndex((line, i) => line === '' && i > 0);
        expect(blankLineIndex).toBeGreaterThan(0);
        expect(lines[blankLineIndex + 1]).toBe('{"test":true}');
    });
});

describe('toFetch', () => {
    it('generates basic fetch call', () => {
        const request = createRequest();
        const result = toFetch(request);

        expect(result).toContain("fetch('https://api.example.com/users'");
        expect(result).toContain("method: 'GET'");
        expect(result).toContain('.then(response => response.json())');
    });

    it('includes headers object', () => {
        const request = createRequest({
            headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
        });
        const result = toFetch(request);

        expect(result).toContain('headers: {');
        expect(result).toContain("'Accept': 'application/json'");
    });

    it('includes JSON body with JSON.stringify', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'json', content: '{"name":"test"}' },
        });
        const result = toFetch(request);

        expect(result).toContain('body: JSON.stringify({"name":"test"})');
    });

    it('includes text body as string', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'text', content: 'Hello World' },
        });
        const result = toFetch(request);

        expect(result).toContain("body: 'Hello World'");
    });
});

describe('toAxios', () => {
    it('generates axios call with import', () => {
        const request = createRequest();
        const result = toAxios(request);

        expect(result).toContain("import axios from 'axios'");
        expect(result).toContain('axios({');
        expect(result).toContain("method: 'get'");
        expect(result).toContain("url: 'https://api.example.com/users'");
    });

    it('includes headers', () => {
        const request = createRequest({
            headers: [{ key: 'X-Custom', value: 'value', enabled: true }],
        });
        const result = toAxios(request);

        expect(result).toContain('headers: {');
        expect(result).toContain("'X-Custom': 'value'");
    });

    it('includes data for JSON body', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'json', content: '{"id":1}' },
        });
        const result = toAxios(request);

        expect(result).toContain('data: {"id":1}');
    });
});

describe('toPython', () => {
    it('generates Python requests code', () => {
        const request = createRequest();
        const result = toPython(request);

        expect(result).toContain('import requests');
        expect(result).toContain("response = requests.get('https://api.example.com/users')");
        expect(result).toContain('print(response.status_code)');
    });

    it('includes headers dict', () => {
        const request = createRequest({
            headers: [{ key: 'Authorization', value: 'Bearer token', enabled: true }],
        });
        const result = toPython(request);

        expect(result).toContain('headers = {');
        expect(result).toContain("'Authorization': 'Bearer token'");
        expect(result).toContain('headers=headers');
    });

    it('uses json parameter for JSON body', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'json', content: '{"name":"test"}' },
        });
        const result = toPython(request);

        expect(result).toContain('data = {"name":"test"}');
        expect(result).toContain('json=data');
    });

    it('includes verify=False for insecure requests', () => {
        const request = createRequest({ insecure: true });
        const result = toPython(request);

        expect(result).toContain('verify=False');
    });
});

describe('toPhp', () => {
    it('generates PHP cURL code', () => {
        const request = createRequest();
        const result = toPhp(request);

        expect(result).toContain('<?php');
        expect(result).toContain('$ch = curl_init()');
        expect(result).toContain("curl_setopt($ch, CURLOPT_URL, 'https://api.example.com/users')");
        expect(result).toContain('curl_setopt($ch, CURLOPT_RETURNTRANSFER, true)');
    });

    it('sets custom request method for non-GET', () => {
        const request = createRequest({ method: 'POST' });
        const result = toPhp(request);

        expect(result).toContain("curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST')");
    });

    it('includes headers array', () => {
        const request = createRequest({
            headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
        });
        const result = toPhp(request);

        expect(result).toContain('curl_setopt($ch, CURLOPT_HTTPHEADER, [');
        expect(result).toContain("'Content-Type: application/json'");
    });

    it('includes postfields for body', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'json', content: '{"test":true}' },
        });
        const result = toPhp(request);

        expect(result).toContain("curl_setopt($ch, CURLOPT_POSTFIELDS, '{\"test\":true}')");
    });

    it('disables SSL verification for insecure', () => {
        const request = createRequest({ insecure: true });
        const result = toPhp(request);

        expect(result).toContain('curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false)');
    });
});

describe('toGo', () => {
    it('generates Go net/http code', () => {
        const request = createRequest();
        const result = toGo(request);

        expect(result).toContain('package main');
        expect(result).toContain('import (');
        expect(result).toContain('"net/http"');
        expect(result).toContain('func main() {');
        expect(result).toContain('http.NewRequest("GET", "https://api.example.com/users", nil)');
    });

    it('includes strings import for body', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'json', content: '{"test":true}' },
        });
        const result = toGo(request);

        expect(result).toContain('"strings"');
        expect(result).toContain('body := strings.NewReader');
    });

    it('sets headers', () => {
        const request = createRequest({
            headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
        });
        const result = toGo(request);

        expect(result).toContain('req.Header.Set("Accept", "application/json")');
    });

    it('includes request body in NewRequest', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'text', content: 'Hello' },
        });
        const result = toGo(request);

        expect(result).toContain('http.NewRequest("POST"');
        expect(result).toContain(', body)');
    });
});

describe('exportRequest', () => {
    it('exports to curl format', () => {
        const request = createRequest();
        const result = exportRequest(request, 'curl');

        expect(result).toContain('curl');
    });

    it('exports to http format', () => {
        const request = createRequest();
        const result = exportRequest(request, 'http');

        expect(result).toContain('HTTP/1.1');
    });

    it('exports to fetch format', () => {
        const request = createRequest();
        const result = exportRequest(request, 'fetch');

        expect(result).toContain('fetch(');
    });

    it('exports to axios format', () => {
        const request = createRequest();
        const result = exportRequest(request, 'axios');

        expect(result).toContain('axios({');
    });

    it('exports to python format', () => {
        const request = createRequest();
        const result = exportRequest(request, 'python');

        expect(result).toContain('import requests');
    });

    it('exports to php format', () => {
        const request = createRequest();
        const result = exportRequest(request, 'php');

        expect(result).toContain('<?php');
    });

    it('exports to go format', () => {
        const request = createRequest();
        const result = exportRequest(request, 'go');

        expect(result).toContain('package main');
    });

    it('throws for unknown format', () => {
        const request = createRequest();
        expect(() => exportRequest(request, 'unknown' as any)).toThrow();
    });
});

describe('variable substitution', () => {
    const variables = new Map([
        ['base_url', 'https://api.prod.com'],
        ['api_key', 'secret-key-123'],
        ['user_id', '42'],
    ]);
    const options: ExportOptions = { variables };

    it('substitutes variables in URL', () => {
        const request = createRequest({
            url: '{{base_url}}/users/{{user_id}}',
        });
        const result = toCurl(request, options);

        expect(result).toContain('https://api.prod.com/users/42');
        expect(result).not.toContain('{{base_url}}');
        expect(result).not.toContain('{{user_id}}');
    });

    it('substitutes variables in headers', () => {
        const request = createRequest({
            headers: [{ key: 'X-API-Key', value: '{{api_key}}', enabled: true }],
        });
        const result = toCurl(request, options);

        expect(result).toContain("'X-API-Key: secret-key-123'");
        expect(result).not.toContain('{{api_key}}');
    });

    it('substitutes variables in query params', () => {
        const request = createRequest({
            params: [{ key: 'userId', value: '{{user_id}}', enabled: true }],
        });
        const result = toCurl(request, options);

        expect(result).toContain('userId=42');
        expect(result).not.toContain('{{user_id}}');
    });

    it('substitutes variables in bearer auth', () => {
        const request = createRequest({
            auth: { type: 'bearer', token: '{{api_key}}' },
        });
        const result = toCurl(request, options);

        expect(result).toContain('Bearer secret-key-123');
        expect(result).not.toContain('{{api_key}}');
    });

    it('substitutes variables in basic auth', () => {
        const request = createRequest({
            auth: { type: 'basic', username: '{{user_id}}', password: '{{api_key}}' },
        });
        const result = toCurl(request, options);

        // The auth header should contain the base64 of "42:secret-key-123"
        expect(result).toContain('Basic');
        expect(result).not.toContain('{{user_id}}');
        expect(result).not.toContain('{{api_key}}');
    });

    it('substitutes variables in JSON body', () => {
        const request = createRequest({
            method: 'POST',
            body: { type: 'json', content: '{"userId": "{{user_id}}"}' },
        });
        const result = toCurl(request, options);

        expect(result).toContain('"userId": "42"');
        expect(result).not.toContain('{{user_id}}');
    });

    it('substitutes variables in form data', () => {
        const request = createRequest({
            method: 'POST',
            body: {
                type: 'x-www-form-urlencoded',
                data: [{ key: 'user', value: '{{user_id}}', enabled: true }],
            },
        });
        const result = toCurl(request, options);

        expect(result).toContain('user=42');
        expect(result).not.toContain('{{user_id}}');
    });

    it('keeps unresolved variables as-is', () => {
        const request = createRequest({
            url: '{{base_url}}/{{unknown_var}}',
        });
        const result = toCurl(request, options);

        expect(result).toContain('https://api.prod.com');
        expect(result).toContain('{{unknown_var}}');
    });

    it('works without variables option', () => {
        const request = createRequest({
            url: '{{base_url}}/users',
        });
        const result = toCurl(request);

        // Should keep variables as-is when no substitution provided
        expect(result).toContain('{{base_url}}');
    });

    it('substitutes variables in HTTP format', () => {
        const request = createRequest({
            url: '{{base_url}}/users/{{user_id}}',
            headers: [{ key: 'Authorization', value: 'Bearer {{api_key}}', enabled: true }],
        });
        const result = toHttp(request, options);

        expect(result).toContain('GET /users/42 HTTP/1.1');
        expect(result).toContain('Host: api.prod.com');
        expect(result).toContain('Authorization: Bearer secret-key-123');
    });
});
