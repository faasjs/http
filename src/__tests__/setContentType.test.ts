import { Func } from '@faasjs/func';
import { Http, ContentType } from '../http';

describe('setContentType', function () {
  test.each(Object.keys(ContentType))('type is %s', async function (type) {
    const http = new Http();
    const func = new Func({
      plugins: [http],
      handler () {
        http.setContentType(type);
      }
    });

    func.config = {
      plugins: {
        http: {}
      }
    };
    const handler = func.export().handler;

    const res = await handler({});

    expect(res.statusCode).toEqual(201);
    expect(res.headers['Content-Type']).toEqual(`${ContentType[type as string]}; charset=utf-8`);
  });

  test('set charset', async function () {
    const http = new Http();
    const func = new Func({
      plugins: [http],
      handler () {
        http.setContentType('type', 'utf-16');
      }
    });

    func.config = {
      plugins: {
        http: {}
      }
    };
    const handler = func.export().handler;

    const res = await handler({});

    expect(res.statusCode).toEqual(201);
    expect(res.headers['Content-Type']).toEqual('type; charset=utf-16');
  });
});
