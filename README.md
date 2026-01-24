# Chasqui

A lightweight, open-source API client for developers who just want to test APIs without the bloat.

Built with Tauri, Rust, and Svelte. Fast, native, and doesn't phone home.

## Why?

Postman got heavy. Insomnia went weird. I just wanted something simple to send HTTP requests without signing up for an account or waiting 10 seconds for the app to load.

Chasqui is that. Nothing more.

## Features

- **HTTP requests** - GET, POST, PUT, PATCH, DELETE, etc.
- **Request body** - JSON, plain text, form-data, x-www-form-urlencoded
- **Authentication** - Bearer token, Basic auth, API key (header or query)
- **Environments** - Store variables and switch between dev/staging/prod
- **Workspaces** - Organize your projects separately
- **Collections** - Group requests into folders
- **History** - See what you sent and when
- **Monaco editor** - Syntax highlighting for JSON bodies
- **Dark/Light mode** - Easy on the eyes

## Screenshot

<!-- TODO: Add screenshot -->

## Install

### Download

Grab the latest release from the [Releases](https://github.com/YOUR_USERNAME/chasqui/releases) page.

- **macOS**: `.dmg` or `.app`
- **Windows**: `.msi` or `.exe`
- **Linux**: `.deb`, `.AppImage`, or `.rpm`

### Build from source

You'll need:
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)
- [Rust](https://rustup.rs/)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/chasqui.git
cd chasqui

# Install dependencies
pnpm install

# Run in development
pnpm tauri dev

# Build for production
pnpm tauri build
```

The built app will be in `src-tauri/target/release/bundle/`.

## Development

```bash
# Start dev server with hot reload
pnpm tauri dev

# Type check
pnpm check

# Build frontend only
pnpm build
```

## Testing

```bash
# Run Rust integration tests (HTTP client)
pnpm test:rust

# Start echo server for manual testing
pnpm test:server
# Then open Chasqui and send requests to http://localhost:3456
```

The echo server returns all request details (headers, body, params) as JSON so you can verify everything is being sent correctly.

## Tech Stack

- **Frontend**: SvelteKit 2, TypeScript, Monaco Editor
- **Backend**: Tauri 2, Rust
- **HTTP**: reqwest
- **Storage**: tauri-plugin-store (local JSON files)

## Roadmap

Things I might add if there's interest:

- [ ] Import/export collections (Postman format)
- [ ] GraphQL support
- [ ] WebSocket testing
- [ ] Request scripting (pre-request, tests)
- [ ] Cookies management
- [ ] Proxy settings
- [ ] Code generation (curl, fetch, etc.)

## Contributing

PRs welcome. Keep it simple.

## License

MIT

---

*"Chasqui" were the messengers of the Inca Empire, known for their speed and reliability.*
