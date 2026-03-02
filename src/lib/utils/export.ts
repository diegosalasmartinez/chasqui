import type { Request } from '$lib/types/http';
import type { ExportFormat, ExportOptions } from '$lib/types/export';
import { applyVariableSubstitution } from './variables';

export type { ExportFormat, ExportOptions };

// Build the full URL with query parameters
function buildUrl(request: Request): string {
    const enabledParams = request.params.filter(p => p.enabled && p.key);
    if (enabledParams.length === 0) return request.url;

    const url = new URL(request.url);
    for (const param of enabledParams) {
        url.searchParams.append(param.key, param.value);
    }
    return url.toString();
}

// Build URL with API key in query if needed
function buildUrlWithAuth(request: Request): string {
    let url = buildUrl(request);
    if (request.auth.type === 'api-key' && request.auth.addTo === 'query') {
        const urlObj = new URL(url);
        urlObj.searchParams.append(request.auth.key, request.auth.value);
        url = urlObj.toString();
    }
    return url;
}

// Get headers including auth headers
function getHeaders(request: Request): Array<{ key: string; value: string }> {
    const headers: Array<{ key: string; value: string }> = [];

    // Add custom headers
    for (const h of request.headers) {
        if (h.enabled && h.key) {
            headers.push({ key: h.key, value: h.value });
        }
    }

    // Add auth headers
    if (request.auth.type === 'bearer') {
        headers.push({ key: 'Authorization', value: `Bearer ${request.auth.token}` });
    } else if (request.auth.type === 'basic') {
        const credentials = btoa(`${request.auth.username}:${request.auth.password}`);
        headers.push({ key: 'Authorization', value: `Basic ${credentials}` });
    } else if (request.auth.type === 'api-key' && request.auth.addTo === 'header') {
        headers.push({ key: request.auth.key, value: request.auth.value });
    }

    // Add content-type for body
    if (request.body.type === 'json') {
        if (!headers.some(h => h.key.toLowerCase() === 'content-type')) {
            headers.push({ key: 'Content-Type', value: 'application/json' });
        }
    } else if (request.body.type === 'text') {
        if (!headers.some(h => h.key.toLowerCase() === 'content-type')) {
            headers.push({ key: 'Content-Type', value: 'text/plain' });
        }
    } else if (request.body.type === 'x-www-form-urlencoded') {
        if (!headers.some(h => h.key.toLowerCase() === 'content-type')) {
            headers.push({ key: 'Content-Type', value: 'application/x-www-form-urlencoded' });
        }
    }

    return headers;
}

// Get the request body as a string
function getBody(request: Request): string | null {
    if (request.body.type === 'json' || request.body.type === 'text') {
        return request.body.content || null;
    }
    if (request.body.type === 'x-www-form-urlencoded') {
        const params = request.body.data
            .filter(d => d.enabled && d.key)
            .map(d => `${encodeURIComponent(d.key)}=${encodeURIComponent(d.value)}`)
            .join('&');
        return params || null;
    }
    if (request.body.type === 'form-data') {
        return null;
    }
    return null;
}

// Apply variable substitution wrapper
function prepareRequest(request: Request, options: ExportOptions): Request {
    if (options.variables && options.variables.size > 0) {
        return applyVariableSubstitution(request, options.variables);
    }
    return request;
}

// Export request as curl command
export function toCurl(request: Request, options: ExportOptions = {}): string {
    request = prepareRequest(request, options);
    const parts: string[] = ['curl'];

    if (request.method !== 'GET') {
        parts.push(`-X ${request.method}`);
    }

    const url = buildUrlWithAuth(request);
    const headers = getHeaders(request);

    for (const h of headers) {
        parts.push(`-H '${h.key}: ${h.value}'`);
    }

    if (request.body.type === 'form-data') {
        const formData = request.body.data.filter(d => d.enabled && d.key);
        for (const field of formData) {
            parts.push(`-F '${field.key}=${field.value}'`);
        }
    } else {
        const body = getBody(request);
        if (body) {
            const escapedBody = body.replace(/'/g, "'\\''");
            parts.push(`-d '${escapedBody}'`);
        }
    }

    if (request.insecure) {
        parts.push('--insecure');
    }

    parts.push(`'${url}'`);

    return parts.join(' \\\n  ');
}

// Export request as raw HTTP format
export function toHttp(request: Request, options: ExportOptions = {}): string {
    request = prepareRequest(request, options);
    const lines: string[] = [];
    const url = buildUrlWithAuth(request);

    let path = url;
    let host = '';
    try {
        const urlObj = new URL(url);
        path = urlObj.pathname + urlObj.search;
        host = urlObj.host;
    } catch {
        // Keep full URL if parsing fails
    }

    lines.push(`${request.method} ${path} HTTP/1.1`);

    if (host) {
        lines.push(`Host: ${host}`);
    }

    const headers = getHeaders(request);
    for (const h of headers) {
        lines.push(`${h.key}: ${h.value}`);
    }

    const body = getBody(request);
    if (body) {
        lines.push('');
        lines.push(body);
    }

    return lines.join('\n');
}

// Export request as JavaScript Fetch
export function toFetch(request: Request, options: ExportOptions = {}): string {
    request = prepareRequest(request, options);
    const url = buildUrlWithAuth(request);
    const headers = getHeaders(request);
    const body = getBody(request);

    const lines: string[] = [];
    lines.push(`fetch('${url}', {`);
    lines.push(`  method: '${request.method}',`);

    if (headers.length > 0) {
        lines.push('  headers: {');
        headers.forEach((h, i) => {
            const comma = i < headers.length - 1 ? ',' : '';
            lines.push(`    '${h.key}': '${h.value}'${comma}`);
        });
        lines.push('  },');
    }

    if (body) {
        if (request.body.type === 'json') {
            lines.push(`  body: JSON.stringify(${body}),`);
        } else {
            lines.push(`  body: '${body.replace(/'/g, "\\'")}',`);
        }
    }

    // Remove trailing comma from last property
    const lastLine = lines[lines.length - 1];
    if (lastLine.endsWith(',')) {
        lines[lines.length - 1] = lastLine.slice(0, -1);
    }

    lines.push('})');
    lines.push('.then(response => response.json())');
    lines.push('.then(data => console.log(data))');
    lines.push('.catch(error => console.error(error));');

    return lines.join('\n');
}

// Export request as JavaScript Axios
export function toAxios(request: Request, options: ExportOptions = {}): string {
    request = prepareRequest(request, options);
    const url = buildUrlWithAuth(request);
    const headers = getHeaders(request);
    const body = getBody(request);

    const lines: string[] = [];
    lines.push("import axios from 'axios';");
    lines.push('');
    lines.push(`axios({`);
    lines.push(`  method: '${request.method.toLowerCase()}',`);
    lines.push(`  url: '${url}',`);

    if (headers.length > 0) {
        lines.push('  headers: {');
        headers.forEach((h, i) => {
            const comma = i < headers.length - 1 ? ',' : '';
            lines.push(`    '${h.key}': '${h.value}'${comma}`);
        });
        lines.push('  },');
    }

    if (body) {
        if (request.body.type === 'json') {
            lines.push(`  data: ${body},`);
        } else {
            lines.push(`  data: '${body.replace(/'/g, "\\'")}',`);
        }
    }

    // Remove trailing comma
    const lastLine = lines[lines.length - 1];
    if (lastLine.endsWith(',')) {
        lines[lines.length - 1] = lastLine.slice(0, -1);
    }

    lines.push('})');
    lines.push('.then(response => console.log(response.data))');
    lines.push('.catch(error => console.error(error));');

    return lines.join('\n');
}

// Export request as Python requests
export function toPython(request: Request, options: ExportOptions = {}): string {
    request = prepareRequest(request, options);
    const url = buildUrlWithAuth(request);
    const headers = getHeaders(request);
    const body = getBody(request);

    const lines: string[] = [];
    lines.push('import requests');
    lines.push('');

    // Headers
    if (headers.length > 0) {
        lines.push('headers = {');
        headers.forEach((h, i) => {
            const comma = i < headers.length - 1 ? ',' : '';
            lines.push(`    '${h.key}': '${h.value}'${comma}`);
        });
        lines.push('}');
        lines.push('');
    }

    // Body
    if (body && request.body.type === 'json') {
        lines.push(`data = ${body}`);
        lines.push('');
    } else if (body) {
        lines.push(`data = '${body.replace(/'/g, "\\'")}'`);
        lines.push('');
    }

    // Request
    const method = request.method.toLowerCase();
    const args: string[] = [`'${url}'`];

    if (headers.length > 0) {
        args.push('headers=headers');
    }

    if (body) {
        if (request.body.type === 'json') {
            args.push('json=data');
        } else {
            args.push('data=data');
        }
    }

    if (request.insecure) {
        args.push('verify=False');
    }

    lines.push(`response = requests.${method}(${args.join(', ')})`);
    lines.push('');
    lines.push('print(response.status_code)');
    lines.push('print(response.json())');

    return lines.join('\n');
}

// Export request as PHP cURL
export function toPhp(request: Request, options: ExportOptions = {}): string {
    request = prepareRequest(request, options);
    const url = buildUrlWithAuth(request);
    const headers = getHeaders(request);
    const body = getBody(request);

    const lines: string[] = [];
    lines.push('<?php');
    lines.push('');
    lines.push('$ch = curl_init();');
    lines.push('');
    lines.push(`curl_setopt($ch, CURLOPT_URL, '${url}');`);
    lines.push('curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);');

    if (request.method !== 'GET') {
        lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${request.method}');`);
    }

    if (headers.length > 0) {
        lines.push('curl_setopt($ch, CURLOPT_HTTPHEADER, [');
        headers.forEach((h, i) => {
            const comma = i < headers.length - 1 ? ',' : '';
            lines.push(`    '${h.key}: ${h.value}'${comma}`);
        });
        lines.push(']);');
    }

    if (body) {
        const escapedBody = body.replace(/'/g, "\\'");
        lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, '${escapedBody}');`);
    }

    if (request.insecure) {
        lines.push('curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);');
    }

    lines.push('');
    lines.push('$response = curl_exec($ch);');
    lines.push('$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);');
    lines.push('');
    lines.push('curl_close($ch);');
    lines.push('');
    lines.push('echo "Status: " . $httpCode . "\\n";');
    lines.push('echo $response;');

    return lines.join('\n');
}

// Export request as Go net/http
export function toGo(request: Request, options: ExportOptions = {}): string {
    request = prepareRequest(request, options);
    const url = buildUrlWithAuth(request);
    const headers = getHeaders(request);
    const body = getBody(request);

    const lines: string[] = [];
    lines.push('package main');
    lines.push('');
    lines.push('import (');
    lines.push('    "fmt"');
    lines.push('    "io"');
    lines.push('    "net/http"');
    if (body) {
        lines.push('    "strings"');
    }
    lines.push(')');
    lines.push('');
    lines.push('func main() {');

    if (body) {
        const escapedBody = body.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        lines.push(`    body := strings.NewReader("${escapedBody}")`);
        lines.push('');
        lines.push(`    req, err := http.NewRequest("${request.method}", "${url}", body)`);
    } else {
        lines.push(`    req, err := http.NewRequest("${request.method}", "${url}", nil)`);
    }

    lines.push('    if err != nil {');
    lines.push('        panic(err)');
    lines.push('    }');
    lines.push('');

    if (headers.length > 0) {
        headers.forEach(h => {
            lines.push(`    req.Header.Set("${h.key}", "${h.value}")`);
        });
        lines.push('');
    }

    lines.push('    client := &http.Client{}');
    lines.push('    resp, err := client.Do(req)');
    lines.push('    if err != nil {');
    lines.push('        panic(err)');
    lines.push('    }');
    lines.push('    defer resp.Body.Close()');
    lines.push('');
    lines.push('    bodyBytes, _ := io.ReadAll(resp.Body)');
    lines.push('    fmt.Println("Status:", resp.StatusCode)');
    lines.push('    fmt.Println(string(bodyBytes))');
    lines.push('}');

    return lines.join('\n');
}

// Export request to the specified format
export function exportRequest(request: Request, format: ExportFormat, options: ExportOptions = {}): string {
    switch (format) {
        case 'curl':
            return toCurl(request, options);
        case 'http':
            return toHttp(request, options);
        case 'fetch':
            return toFetch(request, options);
        case 'axios':
            return toAxios(request, options);
        case 'python':
            return toPython(request, options);
        case 'php':
            return toPhp(request, options);
        case 'go':
            return toGo(request, options);
        default:
            throw new Error(`Unknown export format: ${format}`);
    }
}

// Get display name for export format
export function getFormatName(format: ExportFormat): string {
    switch (format) {
        case 'curl':
            return 'cURL';
        case 'http':
            return 'HTTP';
        case 'fetch':
            return 'JavaScript Fetch';
        case 'axios':
            return 'JavaScript Axios';
        case 'python':
            return 'Python';
        case 'php':
            return 'PHP';
        case 'go':
            return 'Go';
        default:
            return format;
    }
}

export const EXPORT_FORMATS: ExportFormat[] = ['curl', 'http', 'fetch', 'axios', 'python', 'php', 'go'];
