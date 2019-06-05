import { Plugin, InvokeData, MountData, DeployData, Next } from '@faasjs/func';
import deepMerge from '@faasjs/deep_merge';
import { Cookie, CookieOptions } from './cookie';
import { Session } from './session';

export interface HttpConfig {
  name?: string;
  config?: {
    path?: string;
    method?: number;
    timeout?: number;
    functionName?: string;
    cookie?: CookieOptions;
    [key: string]: any;
  };
  [key: string]: any;
}

export class Http implements Plugin {
  public readonly type: string;
  public response?: {
    statusCode: number;
    headers: {
      [key: string]: string;
    };
    body?: any;
  };
  public params: any;
  public cookie?: Cookie;
  public session?: Session;
  private config: {
    name?: string;
    type: string;
    config: {
      path?: string;
      method?: number;
      timeout?: number;
      functionName?: string;
      cookie: CookieOptions;
      [key: string]: any;
    };
    [key: string]: any;
  };

  constructor (config: HttpConfig = Object.create(null)) {
    this.type = 'http';
    this.config = deepMerge({
      type: this.type,
      config: {
        cookie: {}
      }
    }, config);
  }

  public async onDeploy (data: DeployData, next: Next) {
    data.logger!.debug('[Http] 组装网关配置');
    data.logger!.debug('%o', data);

    let config;

    if (!this.config.name) {
      // 若没有指定配置名，则读取默认配置
      config = deepMerge(data.config!.plugins.defaults.http, this.config);
    } else {
      // 检查配置是否存在
      if (!data.config!.plugins[this.config.name]) {
        throw Error(`[faas.yaml] Plugin not found: ${this.config.name}`);
      }

      // 合并默认配置
      config = deepMerge(data.config!.plugins[this.config.name], this.config);
    }

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
    if (!this.config.name) {
      this.config.name = data.config.plugins.defaults.http.name;
      this.config = deepMerge(this.config, data.config.plugins.defaults.http);
    } else {
      this.config = deepMerge(this.config, data.config.plugins[this.config.name!]);
    }

    // 初始化 Cookie
    this.cookie = new Cookie(this.config.config.cookie);
    this.session = this.cookie.session;

    await next();
  }

  public async onInvoke (data: InvokeData, next: Next) {
    data.logger.debug('[Http] 初始化响应对象');

    data.logger.debug('[Http] 解析 body');
    if (data.event.headers['Content-Type'] && data.event.headers['Content-Type'].includes('application/json')) {
      data.event.body = JSON.parse(data.event.body);
    }

    data.logger.debug('[Http] 解析 cookie');
    this.cookie!.invoke(data);

    await next();

    // 检查 session 是否有变动
    if (this.session && this.session.changed) {
      this.cookie!.write(this.session.config.key, this.session!.encode(this.session.cacheContent));
    }

    data.logger.debug('[Http] 补全 response');
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
  }
}
