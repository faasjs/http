import { Func } from '@faasjs/func';
import { Http } from '../../index';

describe('validator/whitelist', function () {
  describe('normal', function () {
    test('error', async function () {
      const http = new Http({
        validator: {
          whitelist: 'error',
          rules: {
            key: {}
          }
        }
      });
      const handler = new Func({
        plugins: [http],
        handler () { }
      }).export().handler;

      const res = await handler({});

      expect(res.statusCode).toEqual(201);

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":1,"key2":2,"key3":3}'
      });

      expect(res2.statusCode).toEqual(500);
      expect(res2.body).toEqual('{"error":{"message":"Unpermitted params: key2, key3"}}');
    });

    test('ignore', async function () {
      const http = new Http({
        validator: {
          whitelist: 'ignore',
          rules: {
            key: {}
          }
        }
      });
      const handler = new Func({
        plugins: [http],
        handler () {
          return http.params;
        }
      }).export().handler;

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":1,"key2":2,"key3":3}'
      });

      expect(res2.statusCode).toEqual(200);
      expect(res2.body).toEqual('{"data":{"key":1}}');
    });
  });

  describe('array', function () {
    test('error', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                whitelist: 'error',
                rules: {
                  sub: {}
                }
              }
            }
          }
        }
      });
      const handler = new Func({
        plugins: [http],
        handler () { }
      }).export().handler;

      const res = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":[{"sub":1}]}'
      });

      expect(res.statusCode).toEqual(201);

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":[{"key1":1,"key2":2}]}'
      });

      expect(res2.statusCode).toEqual(500);
      expect(res2.body).toEqual('{"error":{"message":"Unpermitted params: key.key1, key.key2"}}');
    });

    test('ignore', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                whitelist: 'ignore',
                rules: {
                  sub: {}
                }
              }
            }
          }
        }
      });
      const handler = new Func({
        plugins: [http],
        handler () {
          return http.params.key;
        }
      }).export().handler;

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":[{"sub":1,"key":2}]}'
      });

      expect(res2.statusCode).toEqual(200);
      expect(res2.body).toEqual('{"data":[{"sub":1}]}');
    });
  });

  describe('object', function () {
    test('error', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                whitelist: 'error',
                rules: {
                  sub: {}
                }
              }
            }
          }
        }
      });
      const handler = new Func({
        plugins: [http],
        handler () { }
      }).export().handler;

      const res = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":{"sub":1}}'
      });

      expect(res.statusCode).toEqual(201);

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":{"key1":1,"key2":2}}'
      });

      expect(res2.statusCode).toEqual(500);
      expect(res2.body).toEqual('{"error":{"message":"Unpermitted params: key.key1, key.key2"}}');
    });

    test('ignore', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                whitelist: 'ignore',
                rules: {
                  sub: {}
                }
              }
            }
          }
        }
      });
      const handler = new Func({
        plugins: [http],
        handler () {
          return http.params.key;
        }
      }).export().handler;

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":{"sub":1,"key":2}}'
      });

      expect(res2.statusCode).toEqual(200);
      expect(res2.body).toEqual('{"data":{"sub":1}}');
    });
  });
});
