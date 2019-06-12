import { Func } from '@faasjs/func';
import { Http } from '../http';

describe('http', function () {
  test('should work', async function () {
    const http = new Http();
    const func = new Func({
      plugins: [http],
      handler () {
        return 1;
      }
    });

    func.config = {
      plugins: {
        http: {}
      }
    };
    const handler = func.export().handler;

    const res = await handler({
      headers: {},
      body: null
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual('{"data":1}');
  });

  test('with config name', async function () {
    const http = new Http({
      name: 'name'
    });
    const func = new Func({
      plugins: [http],
      handler () {
        return 1;
      }
    });

    func.config = {
      plugins: {
        name: {}
      }
    };
    const handler = func.export().handler;

    const res = await handler({
      headers: {},
      body: null
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual('{"data":1}');
  });

  test('throw error', async function () {
    const http = new Http();
    const func = new Func({
      plugins: [http],
      handler () {
        throw Error('wrong');
      }
    });

    func.config = {
      plugins: {
        http: {}
      }
    };
    const handler = func.export().handler;

    const res = await handler({});

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual('{"error":{"message":"wrong"}}');
  });
});
