export interface ErrorType {
  NUMBER: number;
  NAME: string;
  METADATA_ERROR?: boolean;
  DESCRIPTION: string;
  INVALID: string[];
  INVALID_ERRORS?: string[]; // array of custom errors to match with INVALID
                             // can set individual entries to null to match against standard error
  VALID: string[];
}
