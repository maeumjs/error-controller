export default interface IMaeumValidationError {
  /** code of error */
  code: string;

  /** description of error */
  message: string;

  /** information of validator result */
  validation: Record<
    string,
    { message: string; data?: unknown; schemaPath: string; params?: unknown }
  >;
}
