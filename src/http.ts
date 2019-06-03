import { Plugin, InvokeData, DeployData, Next } from '@faasjs/func';
import deepMerge from '@faasjs/deep_merge';

export interface HttpConfig {
  name?: string;
  config?: {
    path?: string;
    method?: number;
    timeout?: number;
    functionName?: string;
    [key: string]: any;
  };
}

export class Http implements Plugin {
  public readonly type: string;
  private config: HttpConfig;

  constructor (config: HttpConfig = Object.create(null)) {
    this.type = 'http';
    this.config = config;
  }

  public async onDeploy (data: DeployData, next: Next) {
    data.logger.debug('[Http] 组装网关配置');
    data.logger.debug('%o', data);

    let config;

    if (!this.config.name) {
      // 若没有指定配置名，则读取默认配置
      config = deepMerge(data.config.plugins.defaults.function, this.config, { config: Object.create(null) });
    } else {
      // 检查配置是否存在
      if (!data.config.plugins[this.config.name]) {
        throw Error(`[faas.yaml] Plugin not found: ${this.config.name}`);
      }

      // 合并默认配置
      config = deepMerge(data.config.plugins[this.config.name], this.config, { config: Object.create(null) });
    }

    data.logger.debug('[Http] 组装完成 %o', config);

    // 引用服务商部署插件
    // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-var-requires
    const Provider = require(config.provider.type);
    const provider = new Provider();

    // 部署网关
    await provider.deploy(this.type, data, config);

    await next();
  }

  public async onInvoke (data: InvokeData, next: Next) {
    data.logger.debug('[Http] 注入 data.param');
    if (data.event.body) {
      try {
        data.param = JSON.parse(data.event.body);
      } catch (error) {
        data.logger.warn(error);
      }
    }

    await next();

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
  }
}
