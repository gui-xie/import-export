# Security

This document describes the security considerations, built-in protections, and recommended practices for safe usage of the `@senlinz/import-export` library.

## Formula Injection Protection

Spreadsheet applications such as Microsoft Excel and Google Sheets can interpret cell values that begin with certain characters as formulas. An attacker who controls cell content could exploit this to execute arbitrary commands when a user opens the exported file.

The library includes a formula sanitizer (`sanitizeTextCellValue`) that prefixes dangerous cell values with a single quote (`'`) to neutralize formula interpretation. The following characters are treated as formula prefix characters:

| Character | Description |
|-----------|-------------|
| `=`       | Equals sign |
| `+`       | Plus sign |
| `-`       | Minus / hyphen |
| `@`       | At sign |
| `\t`      | Tab |
| `\r`      | Carriage return |
| `\n`      | Newline |
| `\|`      | Pipe |
| `;`       | Semicolon |

Any text cell value that starts with one of these characters will be prefixed with a single quote when `escapeFormulas` is enabled (the default). This behavior can be disabled per-definition by setting `escapeFormulas: false`, but doing so is not recommended unless you fully control the cell content.

## File Size Limit

The library enforces a file size limit on imported files to prevent excessive memory consumption. The default limit is **25 MB** (25 × 1024 × 1024 bytes).

You can customize this limit per definition via the `maxFileSizeBytes` option on `ExcelDefinition` or `DynamicExcelImportOptions`. The value must be a positive finite number. Files exceeding the configured limit are rejected before reading.

## Image Fetcher Trust Model

The `imageFetcher` callback is a user-provided async function that resolves a URL or identifier to image bytes (`Uint8Array`) during export. The library does not perform any URL validation or filtering on the values passed to this callback.

**Consumers are responsible for validating URLs before fetching.** Specifically:

- Validate that URLs use an expected scheme (e.g., `https:`).
- Restrict URLs to trusted domains or origins to prevent server-side request forgery (SSRF).
- Reject private/internal network addresses if the fetcher runs in a server-side context.

The library validates the bytes returned by the fetcher: empty byte arrays are rejected with a descriptive error, and bytes that cannot be parsed as a valid image produce an error that includes the originating URL.

### CORS Compliance

The `imageFetcher` callback is responsible for CORS compliance. When fetching images from cross-origin URLs in a browser context, ensure the target server returns appropriate CORS headers, or use a proxy that adds them. The library does not add CORS headers or modify fetch requests — it delegates image retrieval entirely to the callback you provide.

Example of an `imageFetcher` with basic URL validation:

```typescript
const imageFetcher = async (url: string): Promise<Uint8Array> => {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') {
    throw new Error(`Refusing to fetch image from non-HTTPS URL: ${url}`);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
};
```

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly through GitHub's private security advisory process:

1. Go to the repository's **Security** tab on GitHub.
2. Click **Report a vulnerability** to open a private security advisory.
3. Provide a description of the vulnerability, steps to reproduce, and any relevant context.

Please do not open public issues for security vulnerabilities. We will acknowledge your report and work with you to address the issue before any public disclosure.
