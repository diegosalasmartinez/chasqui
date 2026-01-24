/**
 * Simple echo server for testing Chasqui
 *
 * Run with: node test-server/server.js
 *
 * Echoes back all request details as JSON:
 * - method, url, path
 * - headers
 * - query params
 * - body (parsed if JSON)
 */

const http = require('http');
const url = require('url');

const PORT = 3456;

const server = http.createServer((req, res) => {
    // Collect body
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const parsedUrl = url.parse(req.url, true);

        // Try to parse body as JSON
        let parsedBody = body;
        const contentType = req.headers['content-type'] || '';

        if (contentType.includes('application/json') && body) {
            try {
                parsedBody = JSON.parse(body);
            } catch (e) {
                parsedBody = { _raw: body, _parseError: e.message };
            }
        } else if (contentType.includes('application/x-www-form-urlencoded') && body) {
            parsedBody = Object.fromEntries(new URLSearchParams(body));
        }

        const response = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            path: parsedUrl.pathname,
            query: parsedUrl.query,
            headers: req.headers,
            body: parsedBody,
            bodyRaw: body || null,
        };

        // CORS headers for testing from browser
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');

        // Handle preflight
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Echo-Server', 'chasqui-test');
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));

        // Log to console
        console.log(`${req.method} ${req.url}`);
    });
});

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════╗
║         Chasqui Echo Server                        ║
╠════════════════════════════════════════════════════╣
║  Running on: http://localhost:${PORT}                 ║
║                                                    ║
║  Try these endpoints:                              ║
║    GET  http://localhost:${PORT}/api/users            ║
║    POST http://localhost:${PORT}/api/data             ║
║    Any method/path will echo back your request     ║
║                                                    ║
║  Press Ctrl+C to stop                              ║
╚════════════════════════════════════════════════════╝
`);
});
