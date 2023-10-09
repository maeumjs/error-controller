export default interface IApiErrorReply<TDataType = unknown> {
  code: string;
  message: string;
  payload?: TDataType;
}
