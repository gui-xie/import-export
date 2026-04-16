interface ImportExportErrorOptions {
  cause?: unknown;
}

class ImportExportError extends Error {
  declare cause?: unknown;

  constructor(message: string, options: ImportExportErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.cause = options.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class ValidationError extends ImportExportError {}

class WasmInitError extends ImportExportError {}

class ImportError extends ImportExportError {}

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
