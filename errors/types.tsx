export type ErrorType = {
  NUMBER: number;
  NAME: string;
  DESCRIPTION: string;
  INVALID: string[];
  INVALID_ERRORS?: string[]; // array of custom errors to match with INVALID
                             // can set individual entries to null to match against standard error
  VALID: string[];

  // Additional details on the error
  METADATA_ERROR?: boolean;
  AFFECTED_BY_OPS?: boolean;
};
