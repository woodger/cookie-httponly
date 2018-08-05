/**
 * This module for Node.js® implemented by following the ECMAScript® 2018
 * Language Specification Standard.
 *
 * https://www.ecma-international.org/ecma-262/9.0/index.html
 *
 * This class implemented by following the RFC 6265
 * HTTP State Management Mechanism Standard.
 *
 * https://tools.ietf.org/html/rfc6265.html
 */



const http = require('http');
const {URL} = require('url');
const TypeEnforcement = require('type-enforcement');



const te = new TypeEnforcement({
  'constructor: new Cookie()': {
    request: http.IncomingMessage,
    response: http.ServerResponse
  },
  '#has()': {
    name: String
  },
  '#get()': {
    name: String
  },
  '#set()': {
    name: String,
    value: String,
    path: String,
    domain: String,
    expires: Date
  }
});

// RFC 6265 4.1.1. Syntax

const x00xA0 = /[\x00-\x1F\x7F-\xA0]/g;

const encodeCookieOctet = (str) => {
  return encodeURIComponent(str.replace(x00xA0, ''));
};




class CookieHttpOnly {
  constructor(request, response) {
    let err = te.validate('constructor: new Cookie()', {
      request,
      response
    });

    if (err) {
      throw err;
    }

    this.request = request;
    this.response = response;
    this.entries = new Map();

    let [domain, port = 80] = this.request.headers.host.split(':');

    // RFC 6265 5.1.3 Domain Matching

    this.domain = domain.toLowerCase();

    if (this.request.connection.remoteAddress === this.domain) {
      throw new Error(
        'The connection must be established from the domain name' +
        ' (i.e., not an IP address)'
      );
    }

    // RFC 6265 4.1.2.5. The Secure Attribute

    this.secure = (Number(port) === 443);

    // Read cookies

    let {cookie = ''} = this.request.headers;
    let pairs = cookie.split('; ');

    for (let i of pairs) {
      let index = i.indexOf('=');

      if (index === -1) {
        continue;
      }

      let key = i.substr(0, index);
      key = decodeURIComponent(key);

      let value = i.substr(index + 1);
      value = decodeURIComponent(value);

      this.entries.set(key, value);
    }
  }



  has(name) {
    let err = te.validate('#has()', {
      name
    });

    if (err) {
      throw err;
    }

    return this.entries.has(name);
  }



  get(name) {
    let err = te.validate('#get()', {
      name
    });

    if (err) {
      throw err;
    }

    return this.entries.get(name);
  }



  set(name, value, {domain = this.domain, path = '/', expires} = {}) {
    let now = new Date();

    if (expires === undefined) {
      expires = now;
    }

    let err = te.validate('#set()', {
      name,
      value,
      path,
      domain,
      expires
    });

    if (err) {
      throw err;
    }

    // RFC 6265 4.1.1. Syntax

    name = encodeCookieOctet(name);
    value = encodeCookieOctet(value);

    // RFC 6265 5.1.3 Domain Matching

    domain = domain.toLowerCase();

    let entry = `${name}=${value}`;

    if (domain !== this.domain) {
      entry += `; Domain=${domain}`;
    }

    if (path !== '/') {
      entry += `; Path=${path}`;
    }

    if (expires !== now) {
      entry += `; Expires=${expires.toUTCString()}`;
    }

    if (this.secure === true) {
      entry += `; Secure`;
    }

    entry += `; HttpOnly`;

    let set = this.response.getHeader('Set-Cookie');

    if (set === undefined) {
      set = [];
    }

    set = set.filter(i => {
      return i.substr(0, i.indexOf('=')) !== name;
    });

    set.push(entry);

    this.response.setHeader('Set-Cookie', set);
  }
}

module.exports = CookieHttpOnly;
