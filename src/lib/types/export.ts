export type ExportFormat = 'curl' | 'http' | 'fetch' | 'axios' | 'python' | 'php' | 'go'

export type ExportOptions = {
    variables?: Map<string, string>
}
