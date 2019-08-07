import { Func } from '@faasjs/func';
import { Http } from '../http';

describe('validator', function () {
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
      const func = new Func({
        plugins: [http],
        handler () { }
      });

      const handler = func.export().handler;

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
      const func = new Func({
        plugins: [http],
        handler () { }
      });

      const handler = func.export().handler;

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
      const func = new Func({
        plugins: [http],
        handler () { }
      });

      const handler = func.export().handler;

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
      const func = new Func({
        plugins: [http],
        handler () { }
      });

      const handler = func.export().handler;

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
