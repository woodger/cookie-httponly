const assert = require('assert');
const proxyquire = require('proxyquire');
const mock = require('mock-http');

describe('class CookieHttpOnly', () => {
  const CookieHttpOnly = proxyquire('..', {
    http: {
      IncomingMessage: mock.Request,
      ServerResponse: mock.Response
    }
  });

  const request = new mock.Request({
    url: '/',
    method: 'GET',
    headers: {
      host: 'example.com:443',
      cookie: 'git=041ab08b'
    }
  });

  const response = new mock.Response();

  describe('constructor: new CookieHttpOnly()', () => {
    it(`Throw an exception if the arguments are not of type`, () => {
      try {
        new CookieHttpOnly();
      }
      catch (e) {
        assert(
          e.message === `Invalid value 'request' in order ` +
          `'constructor: new CookieHttpOnly()'. Expected Request`
        );
      }
    });

    it(`Secure instantiation`, () => {
      const cookie = new CookieHttpOnly(request, response);

      assert.deepEqual(cookie, {
        request,
        response,
        domain: 'example.com',
        secure: true,
        entries: new Map([[
          'git',
          '041ab08b'
        ]])
      });
    });

    it(
      'The connection must be established from the domain name ' +
      '(i.e., not an IP address)', () => {
      const CookieHttpOnly = proxyquire('..', {
        http: {
          IncomingMessage: mock.Request,
          ServerResponse: mock.Response
        }
      });

      const request = new mock.Request({
        headers: {
          host: '127.0.0.1:8080'
        }
      });

      const response = new mock.Response();

      try {
        new CookieHttpOnly(request, response);
      }
      catch (e) {

      }
    });

    it(`The server should not read failed cookies`, () => {
      const CookieHttpOnly = proxyquire('..', {
        http: {
          IncomingMessage: mock.Request,
          ServerResponse: mock.Response
        }
      });

      const request = new mock.Request({
        headers: {
          host: 'example.com:443',
          cookie: 'git=041ab08b; lang'
        }
      });

      const response = new mock.Response();
      const cookie = new CookieHttpOnly(request, response);

      assert(cookie.entries.size === 1);
    });
  });

  describe('cookie.has(key)', () => {
    const cookie = new CookieHttpOnly(request, response);

    it(`Throw an exception if the argument do not match the type`, () => {
      try {
        cookie.has(null);
      }
      catch (e) {
        assert(
          e.message === `Invalid value 'name' in order '#has()'. Expected String`
        );
      }
    });

    it(`The key entry must be present`, () => {
      assert(cookie.has('git'));
    });

    it(`False when the key is not found`, () => {
      assert(cookie.has('not') === false);
    });
  });

  describe('cookie.get(key)', () => {
    const cookie = new CookieHttpOnly(request, response);

    it(`Throw an exception if the argument do not match the type`, () => {
      try {
        cookie.get(null);
      }
      catch (e) {
        assert(
          e.message === `Invalid value 'name' in order '#get()'. Expected String`
        );
      }
    });

    it(`Getting value by key`, () => {
      const value = cookie.get('git');
      assert(value === '041ab08b');
    });

    it(`Get null when not found`, () => {
      const value = cookie.get('not');
      assert(value === undefined);
    });
  });

  describe('cookie.set(key, value[, options])', () => {
    const cookie = new CookieHttpOnly(request, response);

    it(`Throw an exception if the 'key' argument do not match the type`, () => {
      try {
        cookie.set(null, '5309ece4');
      }
      catch (e) {
        assert(
          e.message === `Invalid value 'name' in order '#set()'. Expected String`
        );
      }
    });

    it(`Throw an exception if the 'value' argument do not match the type`, () => {
      try {
        cookie.set('npm', null);
      }
      catch (e) {
        assert(
          e.message === `Invalid value 'value' in order '#set()'. Expected String`
        );
      }
    });

    it(`Throw an exception if the 'options' argument do not match the type`, () => {
      try {
        cookie.set('npm', '5309ece4', null);
      }
      catch (e) {
        assert(
          e.message === "Cannot destructure property `domain` of 'undefined' or 'null'."
        );
      }
    });

    it(`Adding an entry should not make an entry to the repository`, () => {
      cookie.set('npm', '5309ece4');
      const value = cookie.entries.get('npm');

      assert(value === undefined);
    });

    it(`Adding a entry should return undefined`, () => {
      assert(cookie.set('npm', '5309ece4') === undefined);
    });

    it(`Adding a entry should set headers`, () => {
      cookie.set('npm', '5309ece4');
      const header = response.getHeader('Set-Cookie');

      assert.deepStrictEqual(header, [
        'npm=5309ece4; Secure; HttpOnly'
      ]);
    });

    it(`The server should set the Set-Cookie headers with all options`, () => {
      const now = new Date();

      cookie.set('rfc', '47ef14a1', {
        expires: now,
        domain: '.example.com',
        path: '/test'
      });

      const header = response.getHeader('Set-Cookie');
      const utc = now.toUTCString();
      const rfc =
        `rfc=47ef14a1; Domain=.example.com; Path=/test; Expires=${utc}; Secure; HttpOnly`;

      assert.deepStrictEqual(header, [
        'npm=5309ece4; Secure; HttpOnly',
        rfc
      ]);
    });

    it(
      'The server should set the Set-Cookie' +
      ' when headers not secure (i.e., not an port 443)', () => {
      const CookieHttpOnly = proxyquire('..', {
        http: {
          IncomingMessage: mock.Request,
          ServerResponse: mock.Response
        }
      });

      const request = new mock.Request({
        headers: {
          host: 'example.com:8080'
        }
      });

      const response = new mock.Response();
      const cookie = new CookieHttpOnly(request, response);

      cookie.set('npm', '5309ece4');
      const header = response.getHeader('Set-Cookie');

      assert.deepStrictEqual(header, [
        'npm=5309ece4; HttpOnly'
      ]);
    });
  });
});
