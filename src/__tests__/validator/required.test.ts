import { Func } from '@faasjs/func';
import { Http } from '../../index';

describe('validator/required', function () {
  test('normal', async function () {
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

  describe('array', function () {
    test('empty', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                rules: {
                  sub: {
                    required: true
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

      const res = await handler({});

      expect(res.statusCode).toEqual(201);

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":[]}'
      });

      expect(res2.statusCode).toEqual(201);
    });

    test('plain object', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                rules: {
                  sub: {
                    required: true
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

      const res = await handler({});

      expect(res.statusCode).toEqual(201);

      const res2 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":[{}]}'
      });

      expect(res2.statusCode).toEqual(500);
      expect(res2.body).toEqual('{"error":{"message":"key.sub is required."}}');
    });
  });

  test('object', async function () {
    const http = new Http({
      validator: {
        rules: {
          key: {
            config: {
              rules: {
                sub: {
                  required: true
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

    const res = await handler({});

    expect(res.statusCode).toEqual(201);

    const res2 = await handler({
      headers: { 'content-type': 'application/json' },
      body: '{"key":{}}'
    });

    expect(res2.statusCode).toEqual(500);
    expect(res2.body).toEqual('{"error":{"message":"key.sub is required."}}');
  });
});
