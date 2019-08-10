<a name="Http"></a>

## Http
**Kind**: global class  

* [Http](#Http)
    * [new Http(config)](#new_Http_new)
    * [.setHeader(key, value)](#Http+setHeader)
    * [.setContentType(type, charset)](#Http+setContentType)
    * [.setStatusCode(code)](#Http+setStatusCode)
    * [.setBody(body)](#Http+setBody)

<a name="new_Http_new"></a>

### new Http(config)
创建 Http 插件实例


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | 配置项 |
| config.name | <code>string</code> | 配置名 |
| config.config | <code>object</code> | 网关配置 |
| config.validator | <code>object</code> | 入参校验配置 |
| config.validator.params | <code>object</code> | params 校验配置 |
| config.validator.cookie | <code>object</code> | cookie 校验配置 |
| config.validator.session | <code>object</code> | session 校验配置 |

<a name="Http+setHeader"></a>

### http.setHeader(key, value)
设置 header

**Kind**: instance method of [<code>Http</code>](#Http)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | key |
| value | <code>\*</code> | value |

<a name="Http+setContentType"></a>

### http.setContentType(type, charset)
设置 Content-Type

**Kind**: instance method of [<code>Http</code>](#Http)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| type | <code>string</code> |  | 类型 |
| charset | <code>string</code> | <code>&quot;utf-8&quot;</code> | 编码 |

<a name="Http+setStatusCode"></a>

### http.setStatusCode(code)
设置状态码

**Kind**: instance method of [<code>Http</code>](#Http)  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>number</code> | 状态码 |

<a name="Http+setBody"></a>

### http.setBody(body)
设置 body

**Kind**: instance method of [<code>Http</code>](#Http)  

| Param | Type | Description |
| --- | --- | --- |
| body | <code>\*</code> | 内容 |

