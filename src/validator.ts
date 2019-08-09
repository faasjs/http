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
  public config: ValidatorConfig;
  private params?: {
    [key: string]: any;
  }

  constructor (config: ValidatorConfig) {
    this.config = config;
  }

  public valid (params: {
    [key: string]: any;
  }, baseKey: string = '', config?: ValidatorConfig) {
    // root
    if (!config) {
      config = this.config;
      this.params = params;
    }
    if (config.whitelist) {
      const paramsKeys = Object.keys(params);
      const rulesKeys = Object.keys(config.rules);
      const diff = paramsKeys.filter(k => !rulesKeys.includes(k));
      if (diff.length) {
        switch (config.whitelist) {
          case 'error':
            throw Error(`Unpermitted params: ${diff.map(k => `${baseKey}${k}`).join(', ')}`);
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
      if (typeof value === 'undefined' && rule.default) {
        value = typeof rule.default === 'function' ? rule.default(this.params) : rule.default;
        params[key as string] = value;
      }

      // required
      if (rule.required === true) {
        if (typeof value === 'undefined' || value === null) {
          throw Error(`${baseKey}${key} is required.`);
        }
      }

      if (typeof value !== 'undefined') {
        // type
        if (rule.type) {
          switch (rule.type) {
            case 'array':
              if (!Array.isArray(value)) {
                throw Error(`${baseKey}${key} must be a ${rule.type}.`);
              }
              break;
            case 'object':
              if (Object.prototype.toString.call(value) !== '[object Object]') {
                throw Error(`${baseKey}${key} must be a ${rule.type}.`);
              }
              break;
            default:
              if (typeof value !== rule.type) {
                throw Error(`${baseKey}${key} must be a ${rule.type}.`);
              }
              break;
          }
        }

        // in
        if (rule.in && !rule.in.includes(value)) {
          throw Error(`${baseKey}${key} must be in ${rule.in.join(', ')}.`);
        }

        if (Array.isArray(value) && rule.config) {
          // array
          for (const val of value) {
            this.valid(val, (baseKey ? `${baseKey}.${key}.` : `${key}.`), rule.config as ValidatorConfig);
          }
        } else if (typeof value === 'object' && rule.config) {
          // object
          this.valid(value, (baseKey ? `${baseKey}.${key}.` : `${key}.`), rule.config as ValidatorConfig);
        }
      }
    }
  }
}
