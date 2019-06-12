import { Func, InvokeData } from '@faasjs/func';
import { Http } from '../http';

describe('cookie', function () {
  describe('read', function () {
    const http = new Http();
    const func = new Func({
      plugins: [http],
      handler (data: InvokeData) {
        return http.cookie.read(data.event.key);
      }
    });
    func.config = {
      plugins: {
        http: {}
      }
    };
    const handler = func.export().handler;

    test('should work', async function () {
      let res = await handler({
        headers: {
          cookie: 'a=1; b=2'
        },
        key: 'a'
      });
      expect(res.body).toEqual('{"data":"1"}');

      res = await handler({
        headers: {
          cookie: 'a=1; b=2'
        },
        key: 'b'
      });
      expect(res.body).toEqual('{"data":"2"}');

      res = await handler({
        headers: {
          cookie: 'a=1; b=2'
        },
        key: 'c'
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeUndefined();
    });

    test('no cookie', async function () {
      const res = await handler({
        headers: {},
        key: 'a'
      });

      expect(res.body).toBeUndefined();
    });
  });

  describe('write', function () {
    const http = new Http();
    const func = new Func({
      plugins: [http],
      handler (data: InvokeData) {
        http.cookie.write(data.event.key, data.event.value);
      }
    });
    func.config = {
      plugins: {
        http: {}
      }
    };
    const handler = func.export().handler;

    test('base', async function () {
      const res = await handler({
        headers: {},
        key: 'key',
        value: 'value'
      });

      expect(res.headers['Set-Cookie']).toEqual('key=value;max-age=31536000;path=/;Secure;HttpOnly;');
    });

    test('delete', async function () {
      const res = await handler({
        headers: {},
        key: 'key',
        value: null
      });

      expect(res.headers['Set-Cookie']).toEqual('key=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;Secure;HttpOnly;');
    });
  });

  describe('write options', function () {
    test('domain', async function () {
      const http = new Http();
      const func = new Func({
        plugins: [http],
        handler () {
          http.cookie.write('key', null);
        }
      });
      func.config = {
        plugins: {
          http: {
            config: {
              cookie: {
                domain: 'domain.com'
              }
            }
          }
        }
      };
      const res = await func.export().handler({
        headers: {},
        key: 'key',
        value: null
      });

      expect(res.headers['Set-Cookie']).toEqual('key=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;domain=domain.com;Secure;HttpOnly;');
    });

    test('path', async function () {
      const http = new Http();
      const func = new Func({
        plugins: [http],
        handler () {
          http.cookie.write('key', null);
        }
      });
      func.config = {
        plugins: {
          http: {
            config: {
              cookie: {
                path: '/path'
              }
            }
          }
        }
      };
      const res = await func.export().handler({
        headers: {},
        key: 'key',
        value: null
      });

      expect(res.headers['Set-Cookie']).toEqual('key=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/path;Secure;HttpOnly;');
    });

    test('expires number', async function () {
      const http = new Http();
      const func = new Func({
        plugins: [http],
        handler () {
          http.cookie.write('key', 1);
        }
      });
      func.config = {
        plugins: {
          http: {
            config: {
              cookie: {
                expires: 1
              }
            }
          }
        }
      };
      const res = await func.export().handler({
        headers: {},
        key: 'key',
        value: null
      });

      expect(res.headers['Set-Cookie']).toEqual('key=1;max-age=1;path=/;Secure;HttpOnly;');
    });

    test('expires string', async function () {
      const http = new Http();
      const func = new Func({
        plugins: [http],
        handler () {
          http.cookie.write('key', 1);
        }
      });
      func.config = {
        plugins: {
          http: {
            config: {
              cookie: {
                expires: '1'
              }
            }
          }
        }
      };
      const res = await func.export().handler({
        headers: {},
        key: 'key',
        value: null
      });

      expect(res.headers['Set-Cookie']).toEqual('key=1;expires=1;path=/;Secure;HttpOnly;');
    });
  });
});
