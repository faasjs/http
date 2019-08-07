export interface ValidatorConfig {
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
