import { Func } from '@faasjs/func';
import { Http } from '../http';

describe('setBody', function () {
  test('should work', async function () {
    const http = new Http();
    const func = new Func({
      plugins: [http],
      handler () {
        http.setBody('body');
      }
    });

    func.config = {
      plugins: {
        http: {}
      }
    };
    const handler = func.export().handler;

    const res = await handler({});

    expect(res.body).toEqual('body');
  });
});
