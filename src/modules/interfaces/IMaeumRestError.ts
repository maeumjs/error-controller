export default interface IMaeumRestError<TBodyType = unknown, THeaderType = unknown> {
  /** code of error */
  code?: string;

  /** description of error */
  message: string;

  /** additional header data for error */
  header?: THeaderType;

  /** additional body data for error */
  body?: TBodyType;
}
