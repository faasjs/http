import { Func } from '@faasjs/func';
import { Http } from '../http';

describe('validator', function () {
  describe('whitelist', function () {
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

    test('error', async function () {
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
  describe('required', function () {
    test('boolean', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              required: true
            }
          }
        }
      });
      const handler = new Func({
        plugins: [http],
        handler () { }
      }).export().handler;

      const res = await handler({});

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual('{"error":{"message":"key is required."}}');

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":1}'
      });

      expect(res2.statusCode).toEqual(201);
    });
  });

  describe('type', function () {
    test('should work', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              type: 'number'
            }
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
        body: '{"key":1}'
      });

      expect(res2.statusCode).toEqual(201);

      const res3 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":"1"}'
      });

      expect(res3.statusCode).toEqual(500);
      expect(res3.body).toEqual('{"error":{"message":"key must be a number."}}');
    });

    test.each([['string', '"string"'], ['boolean', 'false']])('be %p', async function (type: 'string' | 'boolean', value) {
      const http = new Http({
        validator: {
          rules: {
            key: {
              type
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
        body: `{"key":${value}}`
      });

      expect(res.statusCode).toEqual(201);

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":1}'
      });

      expect(res2.statusCode).toEqual(500);
      expect(res2.body).toEqual(`{"error":{"message":"key must be a ${type}."}}`);
    });
  });

  describe('in', function () {
    test('should work', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              in: [1]
            }
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
        body: '{"key":1}'
      });

      expect(res2.statusCode).toEqual(201);

      const res3 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":2}'
      });

      expect(res3.statusCode).toEqual(500);
      expect(res3.body).toEqual('{"error":{"message":"key must be in 1."}}');
    });
  });
});
