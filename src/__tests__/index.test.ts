import { Func, InvokeData } from '@faasjs/func';
import { Http } from '../http';

describe('http', function () {
  test('plugin', function () {
    const http = new Http();

    expect(http.type).toEqual('http');
  });

  test('should work', async function () {
    const handler = new Func({
      plugins: [new Http()],
      handler (data: InvokeData) {
        return data.param.n + 1;
      }
    }).export().handler;

    const res = await handler({ body: '{"n":0}' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual('{"data":1}');
  });
});
