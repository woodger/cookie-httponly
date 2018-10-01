const assert = require('assert');
const proxyquire = require('proxyquire');
const mock = require('mock-http');



describe(`class CookieHttpOnly`, () => {
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
      assert.throws(() => {
        new CookieHttpOnly();
      });
    });

    it(`Secure instantiation`, () => {
      let cookie = new CookieHttpOnly(request, response);

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

      assert.throws(() => {
        new CookieHttpOnly(request, response);
      }, {
        name: 'Error',
        message:
          'The connection must be established from the domain name' +
          ' (i.e., not an IP address)'
      });
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

      assert.strictEqual(cookie.entries.size, 1);
    });
  });


  describe('cookie.has(key)', () => {
    const cookie = new CookieHttpOnly(request, response);

    it(`Throw an exception if the argument do not match the type`, () => {
      assert.throws(() => {
        cookie.has(null);
      });
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
      assert.throws(() => {
        cookie.get(null);
      });
    });

    it(`Getting value by key`, () => {
      let value = cookie.get('git');
      assert(value === '041ab08b');
    });

    it(`Get null when not found`, () => {
      let value = cookie.get('not');
      assert(value === undefined);
    });
  });


  describe('cookie.set(key, value[, options])', () => {
    let cookie = new CookieHttpOnly(request, response);

    it(`Throw an exception if the 'key' argument do not match the type`, () => {
      assert.throws(() => {
        cookie.set(null, '5309ece4');
      });
    });

    it(`Throw an exception if the 'value' argument do not match the type`, () => {
      assert.throws(() => {
        cookie.set('npm', null);
      });
    });

    it(`Throw an exception if the 'options' argument do not match the type`, () => {
      assert.throws(() => {
        cookie.set('npm', '5309ece4', null);
      });
    });

    it(`Adding an entry should not make an entry to the repository`, () => {
      cookie.set('npm', '5309ece4');
      let value = cookie.entries.get('npm');

      assert(value === undefined);
    });

    it(`Adding a entry should return undefined`, () => {
      assert(cookie.set('npm', '5309ece4') === undefined);
    });

    it(`Adding a entry should set headers`, () => {
      cookie.set('npm', '5309ece4');
      let header = response.getHeader('Set-Cookie');

      assert.deepStrictEqual(header, [
        'npm=5309ece4; Secure; HttpOnly'
      ]);
    });

    it(`The server should set the Set-Cookie headers with all options`, () => {
      let now = new Date();

      cookie.set('rfc', '47ef14a1', {
        expires: now,
        domain: '.example.com',
        path: '/test'
      });

      let header = response.getHeader('Set-Cookie');
      let utc = now.toUTCString();
      let rfc =
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

      let header = response.getHeader('Set-Cookie');

      assert.deepStrictEqual(header, [
        'npm=5309ece4; HttpOnly'
      ]);
    });
  });
});
