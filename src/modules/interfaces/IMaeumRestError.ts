export default interface IMaeumRestError<T = unknown> {
  /** code of error */
  code: string;

  /** description of error */
  message: string;

  /** additional data for error */
  data?: T;
}
