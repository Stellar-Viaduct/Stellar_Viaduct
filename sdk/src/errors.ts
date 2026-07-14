export class StellarViaductSdkError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, code = "SDK_ERROR", details?: unknown) {
    super(message);
    this.name = "StellarViaductSdkError";
    this.code = code;
    this.details = details;
  }
}

export class StellarViaductConnectionError extends StellarViaductSdkError {
  constructor(message: string, details?: unknown) {
    super(message, "CONNECTION_ERROR", details);
    this.name = "StellarViaductConnectionError";
  }
}

export class StellarViaductTransactionError extends StellarViaductSdkError {
  constructor(message: string, details?: unknown) {
    super(message, "TRANSACTION_ERROR", details);
    this.name = "StellarViaductTransactionError";
  }
}

export class StellarViaductQueryError extends StellarViaductSdkError {
  constructor(message: string, details?: unknown) {
    super(message, "QUERY_ERROR", details);
    this.name = "StellarViaductQueryError";
  }
}
