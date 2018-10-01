# Cookie HttpOnly

<!-- [START badges] -->
[![License](https://img.shields.io/npm/l/express.svg)](https://github.com/woodger/cookie-httponly/blob/master/LICENSE)
<!--[![Node.js Version][node-version-image]][node-version-url]-->
[![Build Status](https://travis-ci.com/woodger/cookie-httponly.svg?branch=master)](https://travis-ci.com/woodger/cookie-httponly)
[![Coverage Status](https://coveralls.io/repos/github/woodger/cookie-httponly/badge.svg)](https://coveralls.io/github/woodger/cookie-httponly)
[![Known Vulnerabilities](https://snyk.io/test/github/woodger/cookie-httponly/badge.svg?targetFile=package.json)](https://snyk.io/test/github/woodger/cookie-httponly?targetFile=package.json)
<!-- [END badges] -->

<!-- [START usecases] -->
Restricting access to cookies is essential for security in many web apps. For example, the session ID, the secret token used to identify a particular session, is typically stored in a cookie.

`Cookies HttpOnly` is a [Node.js®](https://nodejs.org) module for getting and setting HTTP(S) cookies with the `HttpOnly` flag set and strict security policy. This module implemented by following the [RFC 6265](https://tools.ietf.org/html/rfc6265.html) Standard.
<!-- [END usecases] -->

## Getting Started

### Installation

To use `Cookie HttpOnly` in your project, run:

```bash
npm i cookie-httponly
```
### Configure Nginx

Setting `location` up Nginx as proxy for Nodejs application:

```bash
location @nodejs {
  proxy_pass http://localhost:8080;
  proxy_http_version 1.1;
  proxy_set_header Host $host:$server_port;
  proxy_set_header IP $remote_addr;
}
```

## API docs

### Table of Contents

[class Cookie](#class-cookie)
  * [constructor: new Cookie(request, response)](#constructor-new-cookierequest-response)
  * [cookie.has(name)](#cookiehasname))
  * [cookie.get(name)](#cookiegetname))
  * [cookie.set(name, value[, options])](#cookiesetname-value-options))
  * [cookie.request](#cookierequest)
  * [cookie.response](#cookieresponse)
  * [cookie.entries](#cookieentries)
  * [cookie.domain](#cookiedomain)
  * [cookie.secure](#cookiesecure)

#### class: Cookie

This class implemented by following the [ECMAScript® 2018 Language Specification
](https://www.ecma-international.org/ecma-262/9.0/index.html) Standard. To use this module:

```js
const Cookie = require('cookie-httponly');
```

#### constructor: new Cookie(request, response)

- `request` <[http.IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)>
- `response` <[http.ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse)>.

```js
const http = require('http');
const Cookie = require('cookie-httponly');

http.createServer((req, res) => {
  const cookie = new Cookie(req, res);
  res.end();
})
.listen(8080);
```
When the class instance is initialized successfully, the HTTP headers are read and parsed. The resulting values are available from the `cookie.entries` field.

> The connection must be established from the domain name (i.e., not an IP address)

#### cookie.has(name)

- `name` <[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
- returns: <[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)> A `true` if an element with the specified key exists in the [cookie.entries](#cookieentries); otherwise `false`.

The method returns a Boolean value indicating whether or not an element with the specified key `name` exists from the `cookie.entries` field.

#### cookie.get(name)

- `name` <[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>
- returns: <[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | [undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)> A `string` if an element with the specified key exists in the [cookie.entries](#cookieentries); otherwise `undefined`.

The method returns the value of the specified name from the `cookie.entries` field.

#### cookie.set(name, value[, options])

- `name` <[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)> Invalid characters will be deleted or escaped.
- `value` <[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)> Invalid characters will be deleted or escaped.
- `options` <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>
  - `domain` <[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)> The Domain attribute specifies those hosts to which the cookie will be sent.  For example, if the value of the Domain attribute is `'example.com'`, the user agent will include the cookie in the Cookie header when making HTTP(S) requests to `'example.com'`, `'www.example.com'`, and `'www.corp.example.com'`.

    > **NOTE** That a leading `'.'`, if present, is ignored even though that character is not permitted, but a trailing `'.'`, if present, will cause the user agent to ignore the attribute.

    If the server omits the Domain attribute, the user agent will return the cookie only to the origin server. Domain matching the string is a host name (i.e., not an IP address). **Default:** `cookie.domain`.
  - `path` <[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)> Cookie path, use `'/'` as the path if you want your cookie to be accessible on all pages. **Default:** `'/'`.
  - `expires` <[Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)> The Expires attribute indicates the date and time at which the cookie expires. **Default:** `current session`.

  > **NOTE** Typical session identifier might reasonably be set to expire in two weeks.
- returns: <[undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)>

Installing HTTP(S) headers. Note that setting headers does not mean the appearance of values in the `cookie.entries` field. If there is a secure `https` connection, the method will automatically add the `security` flag to the headers.

An example of setting the headers to record cookies for 1 year.

```js
const http = require('http');
const Cookie = require('cookie-httponly');

http.createServer((req, res) => {
  const cookie = new Cookie(req, res);
  let forYear = new Date();

  cookie.set('user', '84b7e44aa54d002eac8d00f5bfa9cc93410f2a48', {
    expires: forYear.setUTCFullYear(forYear.getUTCFullYear() + 1)
  });

  res.end();
})
.listen(8080);
```

To send headers for `remove` of cookies by name, simply set the header with the `begin` date and time.

```js
const http = require('http');
const Cookie = require('cookie-httponly');

http.createServer((req, res) => {
  const cookie = new Cookie(req, res);

  cookie.set('user', '', {
    expires: new Date(0) // Thu, 01 Jan 1970 00:00:00 GMT
  });

  res.end();
})
.listen(8080);
```

#### cookie.request

- <[http.IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)>

#### cookie.response

- <[http.ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse)>

#### cookie.entries

- <[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)> The values of the incoming cookie.

#### cookie.domain

- <[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)> The value is set when creating an instance of the class from the `request.headers` field of the current connection. The connection must be established from the domain name (i.e., not an IP address).

#### cookie.secure

- <[Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)> `true` if the current session has a secure connection; otherwise `false`.

You can override the properties `cookie.domain` and `cookie.secure`.
