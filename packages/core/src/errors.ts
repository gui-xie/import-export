/**
 * Mirrors the native `Error` options bag so wrapped failures can keep their original cause.
 */
interface ImportExportErrorOptions {
  /** Original error or rejection reason that triggered the higher-level package error. */
  cause?: unknown;
}

/**
 * Base error for all public `@senlinz/import-export` failures.
 */
class ImportExportError extends Error {
  declare cause?: unknown;

  constructor(message: string, options: ImportExportErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.cause = options.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Raised when caller-provided definitions or options fail validation before work starts.
 */
class ValidationError extends ImportExportError {}

/**
 * Raised when the WASM runtime cannot be decoded, initialized, or reconfigured safely.
 */
class WasmInitError extends ImportExportError {}

/**
 * Raised while reading or parsing imported workbook data.
 */
class ImportError extends ImportExportError {}

/**
 * Raised while mapping caller data into workbook output.
 */
class ExportError extends ImportExportError {}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export {
  ExportError,
  getErrorMessage,
  ImportError,
  ImportExportError,
  ValidationError,
  WasmInitError,
};
