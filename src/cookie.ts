import { Session, SessionOption } from './session';
import { InvokeData } from '@faasjs/func';
import deepMerge from '@faasjs/deep_merge';

export interface CookieOptions {
  domain?: string;
  path?: string;
  expires?: number;
  secure?: boolean;
  httpOnly?: boolean;
  session?: SessionOption;
  [key: string]: any;
}

export class Cookie {
  public readonly config: {
    domain?: string;
    path: string;
    expires: number;
    secure: boolean;
    httpOnly: boolean;
    session?: SessionOption;
  };
  public session?: Session;
  public headers?: any;
  private cacheContent?: any;

  constructor (config: CookieOptions) {
    this.config = deepMerge({
      path: '/',
      expires: 31536000,
      secure: true,
      httpOnly: true
    }, config);

    if (this.config.session) {
      this.session = new Session(this.config.session);
    }
  }

  public invoke (data: InvokeData) {
    this.cacheContent = data.event.headers.cookie;
    this.headers = null;
    // 预读取 session
    if (this.session && this.config.session!.key) {
      this.session.invoke(this.read(this.config.session!.key));
    }
    return this;
  }

  public read (key: string) {
    if (!this.cacheContent) {
      return undefined;
    }

    const v = this.cacheContent.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)');

    return v ? decodeURIComponent(v.pop()) : undefined;
  }

  public write (key: string, value: any, opts?: {
    domain?: string;
    path?: string;
    expires?: number | string;
    secure?: boolean;
    httpOnly?: boolean;
  }) {
    opts = Object.assign(this.config, opts || {});

    let cookie: string;
    if (value === null || typeof value === 'undefined') {
      opts.expires = 'Thu, 01 Jan 1970 00:00:01 GMT';
      cookie = `${key}=;`;
    } else {
      cookie = `${key}=${encodeURIComponent(value)};`;
    }

    if (typeof opts.expires === 'number') {
      cookie += `max-age=${opts.expires};`;
    } else if (typeof opts.expires === 'string') {
      cookie += `expires=${opts.expires};`;
    }

    cookie += `path=${opts.path || '/'};`;

    if (opts.domain) {
      cookie += `domain=${opts.domain};`;
    }

    if (opts.secure) {
      cookie += 'Secure;';
    }

    if (opts.httpOnly) {
      cookie += 'HttpOnly;';
    }

    this.headers = {
      'Set-Cookie': cookie
    };

    return value;
  }
}
