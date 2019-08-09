export interface ValidatorConfig {
  whitelist?: 'error' | 'ignore';
  rules: {
    [key: string]: {
      type?: 'string' | 'number' | 'boolean' | 'object';
      required?: boolean;
      in?: any[];
    };
  };
}

export class Validator {
  public config: ValidatorConfig;

  constructor (config: ValidatorConfig) {
    this.config = config;
  }

  public valid (params: {
    [key: string]: any;
  }) {
    if (this.config.whitelist) {
      const paramsKeys = Object.keys(params);
      const rulesKeys = Object.keys(this.config.rules);
      const diff = paramsKeys.filter(k => !rulesKeys.includes(k));
      if (diff.length) {
        switch (this.config.whitelist) {
          case 'error':
            throw Error(`Unpermitted params: ${diff.join(', ')}`);
          case 'ignore':
            for (const key of diff) {
              delete params[key as string];
            }
            break;
        }
      }
    }
    for (const key in this.config.rules) {
      const rule = this.config.rules[key as string];
      const value = params[key as string];

      // required
      if (rule.required === true) {
        if (typeof value === 'undefined' || value === null) {
          throw Error(`${key} is required.`);
        }
      }

      if (typeof value !== 'undefined') {
        // type
        if (rule.type && typeof value !== rule.type) {
          throw Error(`${key} must be a ${rule.type}.`);
        }

        // in
        if (rule.in && !rule.in.includes(value)) {
          throw Error(`${key} must be in ${rule.in.join(', ')}.`);
        }
      }
    }
  }
}
