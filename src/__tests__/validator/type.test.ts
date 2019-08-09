import { Func } from '@faasjs/func';
import { Http } from '../../index';

describe('validator/type', function () {
  describe('normal', function () {
    test.each([['string', '"string"'], ['boolean', 'false'], ['number', '0'], ['array', '[]'], ['object', '{}']])('is %p', async function (type: 'string' | 'boolean' | 'number', value) {
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
        body: '{"key":null}'
      });

      expect(res2.statusCode).toEqual(500);
      expect(res2.body).toEqual(`{"error":{"message":"key must be a ${type}."}}`);
    });
  });

  describe('array', function () {
    test.each([['string', '"string"'], ['boolean', 'false'], ['number', '0'], ['array', '[]'], ['object', '{}']])('is %p', async function (type: 'string' | 'boolean' | 'number', value) {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                rules: {
                  sub: {
                    type
                  }
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
        body: `{"key":[{"sub":${value}}]}`
      });

      expect(res.statusCode).toEqual(201);

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":[{"sub":null}]}'
      });

      expect(res2.statusCode).toEqual(500);
      expect(res2.body).toEqual(`{"error":{"message":"key.sub must be a ${type}."}}`);
    });
  });

  describe('object', function () {
    test.each([['string', '"string"'], ['boolean', 'false'], ['number', '0'], ['array', '[]'], ['object', '{}']])('is %p', async function (type: 'string' | 'boolean' | 'number', value) {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                rules: {
                  sub: {
                    type
                  }
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
        body: `{"key":{"sub":${value}}}`
      });

      expect(res.statusCode).toEqual(201);

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":{"sub":null}}'
      });

      expect(res2.statusCode).toEqual(500);
      expect(res2.body).toEqual(`{"error":{"message":"key.sub must be a ${type}."}}`);
    });
  });
});
