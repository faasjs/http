import { Func } from '@faasjs/func';
import { Http } from '../../index';

describe('validator/in', function () {
  describe('params', function () {
    test('normal', async function () {
      const http = new Http({
        validator: {
          params: {
            rules: {
              key: {
                in: [1]
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
        body: '{"key":1}'
      });

      expect(res2.statusCode).toEqual(201);

      const res3 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":2}'
      });

      expect(res3.statusCode).toEqual(500);
      expect(res3.body).toEqual('{"error":{"message":"[params] key must be in 1."}}');
    });

    test('array', async function () {
      const http = new Http({
        validator: {
          params: {
            rules: {
              key: {
                config: {
                  rules: {
                    sub: {
                      in: [1]
                    }
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
        body: '{"key":[{"sub":1}]}'
      });

      expect(res2.statusCode).toEqual(201);

      const res3 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":[{"sub":2}]}'
      });

      expect(res3.statusCode).toEqual(500);
      expect(res3.body).toEqual('{"error":{"message":"[params] key.sub must be in 1."}}');
    });

    test('object', async function () {
      const http = new Http({
        validator: {
          params: {
            rules: {
              key: {
                config: {
                  rules: {
                    sub: {
                      in: [1]
                    }
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
        body: '{"key":{"sub":1}}'
      });

      expect(res2.statusCode).toEqual(201);

      const res3 = await handler({
        headers: { 'content-type': 'application/json' },
        body: '{"key":{"sub":2}}'
      });

      expect(res3.statusCode).toEqual(500);
      expect(res3.body).toEqual('{"error":{"message":"[params] key.sub must be in 1."}}');
    });
  });

  describe('cookie', function () {
    test('should work', async function () {
      const http = new Http({
        validator: {
          cookie: {
            rules: {
              key: {
                in: ['1']
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
        headers: {
          cookie: 'key=1'
        }
      });

      expect(res2.statusCode).toEqual(201);

      const res3 = await handler({
        headers: {
          cookie: 'key=2'
        }
      });

      expect(res3.statusCode).toEqual(500);
      expect(res3.body).toEqual('{"error":{"message":"[cookie] key must be in 1."}}');
    });
  });

  describe('session', function () {
    test('normal', async function () {
      const http = new Http({
        validator: {
          session: {
            rules: {
              key: {
                in: [1]
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
        headers: {
          cookie: `key=${http.session.encode({ key: 1 })}`
        }
      });

      expect(res2.statusCode).toEqual(201);

      const res3 = await handler({
        headers: {
          cookie: `key=${http.session.encode({ key: '1' })}`
        }
      });

      expect(res3.statusCode).toEqual(500);
      expect(res3.body).toEqual('{"error":{"message":"[session] key must be in 1."}}');
    });

    test('array', async function () {
      const http = new Http({
        validator: {
          session: {
            rules: {
              key: {
                config: {
                  rules: {
                    sub: {
                      in: [1]
                    }
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
        headers: {
          cookie: `key=${http.session.encode({ key: [{ sub: 1 }] })}`
        }
      });

      expect(res2.statusCode).toEqual(201);

      const res3 = await handler({
        headers: {
          cookie: `key=${http.session.encode({ key: [{ sub: '1' }] })}`
        }
      });

      expect(res3.statusCode).toEqual(500);
      expect(res3.body).toEqual('{"error":{"message":"[session] key.sub must be in 1."}}');
    });

    test('object', async function () {
      const http = new Http({
        validator: {
          session: {
            rules: {
              key: {
                config: {
                  rules: {
                    sub: {
                      in: [1]
                    }
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
        headers: {
          cookie: `key=${http.session.encode({ key: { sub: 1 } })}`
        }
      });

      expect(res2.statusCode).toEqual(201);

      const res3 = await handler({
        headers: {
          cookie: `key=${http.session.encode({ key: { sub: '1' } })}`
        }
      });

      expect(res3.statusCode).toEqual(500);
      expect(res3.body).toEqual('{"error":{"message":"[session] key.sub must be in 1."}}');
    });
  });
});
