import { Func } from '@faasjs/func';
import { Http } from '../http';

describe('setStatusCode', function () {
  test('should work', async function () {
    const http = new Http();
    const func = new Func({
      plugins: [http],
      handler () {
        http.setStatusCode(404);
      }
    });

    func.config = {
      plugins: {
        http: {}
      }
    };
    const handler = func.export().handler;

    const res = await handler({});

    expect(res.statusCode).toEqual(404);
  });
});
