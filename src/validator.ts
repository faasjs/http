import { Cookie } from './cookie';
import { Session } from './session';
import Logger from '@faasjs/logger';

export interface ValidatorConfig {
  whitelist?: 'error' | 'ignore';
  rules: {
    [key: string]: {
      type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required?: boolean;
      in?: any[];
      default?: any;
      config?: Partial<ValidatorConfig>;
    };
  };
}

export class Validator {
  public paramsConfig?: ValidatorConfig;
  public cookieConfig?: ValidatorConfig;
  public sessionConfig?: ValidatorConfig;
  private request?: {
    params?: any;
    cookie?: Cookie;
    session?: Session;
  }
  private logger: Logger;

  constructor (config: {
    params?: ValidatorConfig;
    cookie?: ValidatorConfig;
    session?: ValidatorConfig;
  }) {
    this.paramsConfig = config.params;
    this.cookieConfig = config.cookie;
    this.sessionConfig = config.session;
    this.logger = new Logger('Http.Validator');
  }

  public valid ({
    params,
    cookie,
    session
  }:
  {
    params?: any;
    cookie?: Cookie;
    session?: Session;
  }) {
    this.request = {
      params,
      cookie,
      session
    };
    this.logger.debug('Begin');

    if (this.paramsConfig) {
      this.logger.debug('Valid params');
      this.validContent('params', params, '', this.paramsConfig);
    }

    if (this.cookieConfig) {
      this.logger.debug('Valid cookie');
      if (!cookie) {
        throw Error('Not found Cookie');
      }
      this.validContent('cookie', cookie.content, '', this.cookieConfig);
    }

    if (this.sessionConfig) {
      this.logger.debug('Valid Session');
      if (!session) {
        throw Error('Not found Session');
      }
      this.validContent('session', session.content, '', this.sessionConfig);
    }
  }

  public validContent (type: string, params: {
    [key: string]: any;
  }, baseKey: string, config: ValidatorConfig) {
    if (config.whitelist) {
      const paramsKeys = Object.keys(params);
      const rulesKeys = Object.keys(config.rules);
      const diff = paramsKeys.filter(k => !rulesKeys.includes(k));
      if (diff.length) {
        switch (config.whitelist) {
          case 'error':
            throw Error(`[${type}] Unpermitted keys: ${diff.map(k => `${baseKey}${k}`).join(', ')}`);
          case 'ignore':
            for (const key of diff) {
              delete params[key as string];
            }
            break;
        }
      }
    }
    for (const key in config.rules) {
      const rule = config.rules[key as string];
      let value = params[key as string];

      // default
      if (rule.default) {
        if (type === 'cookie' || type === 'session') {
          this.logger.warn('Cookie and Session not support default rule.');
        } else if (typeof value === 'undefined' && rule.default) {
          value = typeof rule.default === 'function' ? rule.default(this.request) : rule.default;
          params[key as string] = value;
        }
      }

      // required
      if (rule.required === true) {
        if (typeof value === 'undefined' || value === null) {
          throw Error(`[${type}] ${baseKey}${key} is required.`);
        }
      }

      if (typeof value !== 'undefined') {
        // type
        if (rule.type) {
          if (type === 'cookie') {
            this.logger.warn('Cookie not support type rule');
          } else {
            switch (rule.type) {
              case 'array':
                if (!Array.isArray(value)) {
                  throw Error(`[${type}] ${baseKey}${key} must be a ${rule.type}.`);
                }
                break;
              case 'object':
                if (Object.prototype.toString.call(value) !== '[object Object]') {
                  throw Error(`[${type}] ${baseKey}${key} must be a ${rule.type}.`);
                }
                break;
              default:
                if (typeof value !== rule.type) {
                  throw Error(`[${type}] ${baseKey}${key} must be a ${rule.type}.`);
                }
                break;
            }
          }
        }

        // in
        if (rule.in && !rule.in.includes(value)) {
          throw Error(`[${type}] ${baseKey}${key} must be in ${rule.in.join(', ')}.`);
        }

        // nest config
        if (rule.config) {
          if (type === 'cookie') {
            this.logger.warn('Cookie not support nest rule.');
          } else {
            if (Array.isArray(value)) {
              // array
              for (const val of value) {
                this.validContent(type, val, (baseKey ? `${baseKey}.${key}.` : `${key}.`), rule.config as ValidatorConfig);
              }
            } else if (typeof value === 'object') {
              // object
              this.validContent(type, value, (baseKey ? `${baseKey}.${key}.` : `${key}.`), rule.config as ValidatorConfig);
            }
          }
        }
      }
    }
  }
}
