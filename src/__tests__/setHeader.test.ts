import { Func } from '@faasjs/func';
import { Http } from '../http';

describe('setHeader', function () {
  test('should work', async function () {
    const http = new Http();
    const func = new Func({
      plugins: [http],
      handler () {
        http.setHeader('key', 'value');
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
    expect(res.headers.key).toEqual('value');
  });
});
