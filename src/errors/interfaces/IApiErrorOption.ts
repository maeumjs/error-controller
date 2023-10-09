import type { IncomingHttpHeaders } from 'node:http';
import type { IncomingHttpHeaders as IncomingHttp2Headers } from 'node:http2';

export default interface IApiErrorOption {
  status: number;
  header?: IncomingHttpHeaders | IncomingHttp2Headers;
  logging?: Record<string, unknown>;
}
