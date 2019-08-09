import { Func } from '@faasjs/func';
import { Http } from '../../index';

describe('validator/default', function () {
  describe('normal', function () {
    test('const', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              default: 1
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

      const res = await handler({});

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual('{"data":1}');
    });

    test('function', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              default: (params) => params.i + 1
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

      const res = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"i":1}'
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual('{"data":2}');
    });
  });

  describe('array', function () {
    test('const', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                rules: {
                  sub: {
                    default: 1
                  }
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

      const res = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":[{}]}'
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual('{"data":[{"sub":1}]}');
    });

    test('function', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                rules: {
                  sub: {
                    default: (params) => params.i + 1
                  }
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

      const res = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":[{}],"i":1}'
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual('{"data":[{"sub":2}]}');
    });
  });

  describe('object', function () {
    test('const', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                rules: {
                  sub: {
                    default: 1
                  }
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

      const res = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":{}}'
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual('{"data":{"sub":1}}');
    });

    test('function', async function () {
      const http = new Http({
        validator: {
          rules: {
            key: {
              config: {
                rules: {
                  sub: {
                    default: (params) => params.i + 1
                  }
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

      const res = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":{},"i":1}'
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual('{"data":{"sub":2}}');
    });
  });
});
