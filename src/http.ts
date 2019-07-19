import { Plugin, InvokeData, MountData, DeployData, Next } from '@faasjs/func';
import deepMerge from '@faasjs/deep_merge';
import { Cookie, CookieOptions } from './cookie';
import { Session } from './session';

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

export class Http implements Plugin {
  public readonly type: string;
  public name?: string
  public response?: {
    statusCode: number;
    headers: {
      [key: string]: string;
    };
    body?: any;
  };
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
    // 处理结果并返回
    if (typeof data.response === 'undefined' || data.response === null) {
      // 没有结果或结果内容为空时，直接返回 201
      data.response = {
        statusCode: 201,
      };
    } else if (data.response instanceof Error) {
      // 当结果是错误类型时
      data.response = {
        body: { error: { message: data.response.message } },
        statusCode: 500,
      };
    } else if (!data.response.statusCode) {
      data.response = {
        body: { data: data.response },
        statusCode: 200,
      };
    }

    // 序列化 body
    if (typeof data.response.body !== 'undefined' && data.response.body !== 'string') {
      data.response.body = JSON.stringify(data.response.body);
    }

    data.response.headers = Object.assign({
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Request-Id': (data.context ? data.context.request_id : new Date().getTime().toString())
    }, this.cookie!.headers, data.response.headers || {});

    data.logger.timeEnd('http', '[Http][After] end');
  }
}
