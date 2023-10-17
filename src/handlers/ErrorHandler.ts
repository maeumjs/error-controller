import type IErrorHandlerOption from '#/handlers/interfaces/IErrorHandlerOption';

export default abstract class ErrorHandler<T> {
  protected $option: IErrorHandlerOption<T>;

  constructor(option: IErrorHandlerOption<T>) {
    this.$option = option;
  }

  public abstract isSelected(args: T): boolean;

  public abstract stringify(data: unknown): string;

  /**
   * 모든 오류를 일관성 있게 error handler에서 처리하는 경우, route에서 설정한 것과 다른 형태로
   * replay 데이터를 응답하게 되는 경우가 있다. 500오류가 발생하면 그런 상황이 발생하기 쉽다. 그래서
   * 이런 경우에 send나 serialize에 강제로 데이터를 보낼 수 있는데 이 때 header의 content-type
   * 데이터 등을 변경해야 할 수 있다. 이 때 hook을 사용한다
   */
  protected abstract preHook(args: T): void;

  protected abstract postHook(args: T): void;

  protected abstract serializor(args: T): unknown;

  get option() {
    return this.$option;
  }

  getMessage(args: T, i18n: { translate?: unknown; message?: string }) {
    try {
      if (i18n.translate != null) {
        const language = this.$option.getLanguage(args);
        const message = this.$option.translate(language, i18n.translate);

        if (message != null) {
          return message;
        }
      }

      if (i18n.message != null) {
        return i18n.message;
      }

      if (typeof this.$option.fallbackMessage === 'string') {
        return this.$option.fallbackMessage;
      }

      return this.$option.fallbackMessage(args);
    } catch {
      return undefined;
    }
  }

  abstract finalize(args: T, payload: string): void;

  handler(args: T) {
    this.preHook(args);
    const payload = this.serializor(args);
    const stringified = this.stringify(payload);
    this.finalize(args, stringified);
    this.postHook(args);
  }
}
