import ApiError from '#/errors/ApiError';
import type IApiErrorOption from '#/errors/interfaces/IApiErrorOption';
import type {
  TApiErrorReplyArgs,
  TPartialApiErrorReplyArgs,
} from '#/errors/interfaces/TApiErrorReplyArgs';
import { describe, expect, it } from '@jest/globals';

describe('RestError', () => {
  describe('getRestErrorReply', () => {
    it('empty parameters', () => {
      const reply = ApiError.getRestErrorReply();

      expect(reply).toMatchObject({
        code: '',
        message: 'unknown error raised',
        translateArgs: undefined,
        payload: undefined,
      });
    });

    it('message', () => {
      const obj = {
        code: 'asdf',
        message: 'm',
        payload: { name: 'ironman' },
      };

      const reply = ApiError.getRestErrorReply(obj);

      expect(reply).toMatchObject(obj);
    });

    it('polyglot', () => {
      const obj = {
        code: 'asdf',
        translateArgs: { phrase: 'a', options: { name: 'ironman' } },
        payload: { name: 'ironman' },
      } satisfies TApiErrorReplyArgs;

      const reply = ApiError.getRestErrorReply(obj);

      expect(reply).toMatchObject(obj);
    });
  });

  describe('getRestErrorReply', () => {
    it('empty parameters', () => {
      const reply = ApiError.getRestErrorOption();

      expect(reply).toMatchObject({
        status: 500,
        header: undefined,
        logging: undefined,
      });
    });

    it('parameters', () => {
      const obj = {
        status: 400,
        header: { 'Content-Type': 'application/json' },
        logging: { name: 'ironman' },
      } satisfies Partial<IApiErrorOption>;

      const reply = ApiError.getRestErrorOption(obj);

      expect(reply).toMatchObject(obj);
    });
  });

  describe('constructor', () => {
    it('string parameter', () => {
      const err = new ApiError('unknown error raised T_T');
      expect(err.message).toEqual('unknown error raised T_T');
    });

    it('reply parameter with code', () => {
      const reply: TApiErrorReplyArgs = { code: 'err01', message: 'unknown error 001' };
      const err = new ApiError({ reply });
      expect(err.reply).toMatchObject(reply);
    });

    it('reply parameter without code', () => {
      const reply: TPartialApiErrorReplyArgs = { message: 'unknown error 001' };
      const err = new ApiError({ reply });
      expect(err.reply).toMatchObject(reply);
    });

    it('reply parameter with polyglot', () => {
      const reply: TPartialApiErrorReplyArgs = { translateArgs: { phrase: 'p01' } };
      const err = new ApiError({ reply });
      expect(err.reply).toMatchObject(reply);
    });

    it('instation using RestError', () => {
      const err = new ApiError('error for test');
      const r01 = new ApiError(err);

      expect(r01.message).toEqual(err.message);
      expect(r01.stack).toEqual(err.stack);
    });

    it('instation using Error', () => {
      const err = new Error('error for test');
      const r01 = new ApiError(err);

      expect(r01.message).toEqual(err.message);
      expect(r01.stack).toEqual(err.stack);
    });
  });
});
