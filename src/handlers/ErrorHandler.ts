import type IErrorHandlerOption from '#/handlers/interfaces/IErrorHandlerOption';
import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';

export default abstract class ErrorHandler {
  #payload: unknown;

  #option: IErrorHandlerOption;

  constructor(option: IErrorHandlerOption) {
    this.#payload = undefined;
    this.#option = option;
  }

  public abstract isSelected(
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    reply: FastifyReply,
  ): boolean;

  public abstract stringify(data: unknown): string;

  /**
   * 모든 오류를 일관성 있게 error handler에서 처리하는 경우, route에서 설정한 것과 다른 형태로
   * replay 데이터를 응답하게 되는 경우가 있다. 500오류가 발생하면 그런 상황이 발생하기 쉽다. 그래서
   * 이런 경우에 send나 serialize에 강제로 데이터를 보낼 수 있는데 이 때 header의 content-type
   * 데이터 등을 변경해야 할 수 있다. 이 때 hook을 사용한다
   */
  protected abstract preHook(
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    reply: FastifyReply,
  ): void;

  protected abstract postHook(
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    reply: FastifyReply,
  ): void;

  protected abstract serializor(
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    reply: FastifyReply,
  ): void;

  get option() {
    return this.#option;
  }

  get payload(): unknown {
    return this.#payload;
  }

  set payload(value: unknown) {
    this.#payload = value;
  }

  getMessage(req: FastifyRequest, args: { translate?: unknown; message?: string }) {
    try {
      if (args.translate != null) {
        const message = this.#option.translate(req, args.translate);

        if (message != null) {
          return message;
        }
      }

      if (args.message != null) {
        return args.message;
      }

      if (typeof this.#option.fallbackMessage === 'string') {
        return this.#option.fallbackMessage;
      }

      return this.#option.fallbackMessage(req);
    } catch {
      return undefined;
    }
  }

  send(reply: FastifyReply) {
    if (this.#option.type === 'send') {
      reply.send(this.#payload);
    } else {
      reply.serialize(this.#payload);
    }
  }

  handler(err: Error & { validation?: ErrorObject[] }, req: FastifyRequest, reply: FastifyReply) {
    this.preHook(err, req, reply);
    this.serializor(err, req, reply);
    this.send(reply);
    this.postHook(err, req, reply);
  }
}
