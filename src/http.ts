import { Plugin, InvokeData, MountData, DeployData, Next } from '@faasjs/func';
import deepMerge from '@faasjs/deep_merge';
import { Cookie, CookieOptions } from './cookie';
import { Session } from './session';

export const ContentType: {
  [key: string]: string;
} = {
  plain: 'text/plain',
  html: 'text/html',
  xml: 'application/xml',
  csv: 'text/csv',
  css: 'text/css',
  javascript: 'application/javascript',
  json: 'application/json',
  jsonp: 'application/javascript'
};

export interface HttpConfig {
  name?: string;
  config?: {
    method?: string;
    timeout?: number;
    functionName?: string;
    cookie?: CookieOptions;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Response {
  statusCode?: number;
  headers: {
    [key: string]: any;
  };
  body?: string;
}

export class Http implements Plugin {
  public readonly type: string;
  public name?: string
  public response?: Response;
  public headers?: {
    [key: string]: string;
  };
  public params: any;
  public cookie?: Cookie;
  public session?: Session;
  private config: {
    method?: number;
    timeout?: number;
    functionName?: string;
    cookie?: CookieOptions;
    [key: string]: any;
  };

  constructor (config: HttpConfig = Object.create(null)) {
    this.type = 'http';
    this.name = config.name;
    this.config = config.config || Object.create(null);
  }

  public async onDeploy (data: DeployData, next: Next) {
    data.logger!.debug('[Http] 组装网关配置');
    data.logger!.debug('%o', data);

    const config = deepMerge(data.config!.plugins![this.name || this.type], { config: this.config });

    // 根据文件及文件夹名生成路径
    config.config.path = '/' + data.name!.replace(/_/g, '/').replace(/\/index$/, '');

    data.logger!.debug('[Http] 组装完成 %o', config);

    // 引用服务商部署插件
    // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-var-requires
    const Provider = require(config.provider.type);
    const provider = new Provider();

    // 部署网关
    await provider.deploy(this.type, data, config);

    await next();
  }

  public async onMount (data: MountData, next: Next) {
    // 初始化配置项
    if (data.config.plugins[this.name || this.type]) {
      this.config = deepMerge(this.config, data.config.plugins[this.name || this.type].config);
    }

    // 初始化 Cookie
    this.cookie = new Cookie(this.config.cookie || {});
    this.session = this.cookie.session;

    await next();
  }

  public async onInvoke (data: InvokeData, next: Next) {
    data.logger.debug('[Http][Before] begin');
    data.logger.time('http');

    this.headers = data.event.headers || {};
    this.params = {};
    this.response = {
      statusCode: undefined,
      headers: {},
      body: undefined
    };

    if (data.event.body) {
      if (data.event.headers && data.event.headers['content-type'] && data.event.headers['content-type'].includes('application/json')) {
        data.logger.debug('[Http] Parse params from json body');
        this.params = JSON.parse(data.event.body);
      } else {
        data.logger.debug('[Http] Parse params from raw body');
        this.params = data.event.body;
      }
    } else if (data.event.queryString) {
      data.logger.debug('[Http] Parse params from queryString');
      this.params = data.event.queryString;
    }

    data.logger.debug('[Http] Parse cookie');
    this.cookie!.invoke(data);

    data.logger.timeEnd('http', '[Http][Before] end');

    await next();

    data.logger.debug('[Http][After] begin');
    data.logger.time('http');

    // 检查 session 是否有变动
    if (this.session && this.session.changed) {
      this.cookie!.write(this.session.config.key, this.session!.encode(this.session.cacheContent));
    }

    data.logger.debug('[Http] Generate response');
    const response: Response = {
      statusCode: undefined,
      headers: {},
      body: undefined
    };
    // 处理 body
    if (data.response) {
      if (data.response instanceof Error) {
        // 当结果是错误类型时
        response.body = JSON.stringify({ error: { message: data.response.message } });
        response.statusCode = 500;
      } else {
        response.body = JSON.stringify({ data: data.response });
      }
    } else {
      response.body = this.response.body;
    }

    // 处理 statusCode
    if (!response.statusCode) {
      response.statusCode = this.response.statusCode || (response.body ? 200 : 201);
    }

    // 处理 headers
    response.headers = Object.assign({
      'Content-Type': 'application/json; charset=utf-8',
      'X-Request-Id': (data.context ? data.context.request_id : new Date().getTime().toString())
    }, this.cookie!.headers, this.response.headers);

    /* eslint-disable require-atomic-updates */
    data.response = response;

    data.logger.timeEnd('http', '[Http][After] end');
  }

  /**
   * 设置 header
   * @param key {string} key
   * @param value {*} value
   */
  public setHeader (key: string, value: any) {
    this.response!.headers[key as string] = value;
    return this;
  }

  /**
   * 设置 Content-Type
   * @param type {string} 类型
   * @param charset {string} 编码
   */
  public setContentType (type: string, charset: string = 'utf-8') {
    if (ContentType[type as string]) {
      this.setHeader('Content-Type', `${ContentType[type as string]}; charset=${charset}`);
    } else {
      this.setHeader('Content-Type', `${type}; charset=${charset}`);
    }
    return this;
  }

  /**
   * 设置状态码
   * @param code {number} 状态码
   */
  public setStatusCode (code: number) {
    this.response!.statusCode = code;
    return this;
  }

  /**
   * 设置 body
   * @param body {*} 内容
   */
  public setBody (body: string) {
    this.response!.body = body;
    return this;
  }
}
