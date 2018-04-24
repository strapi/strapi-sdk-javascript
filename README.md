# Strapi javascript SDK

![Strapi](https://cldup.com/7umchwdUBh.png)

The official Strapi SDK for JavaScript, available for browsers or Node.js backends.

***

[![Travis](https://img.shields.io/travis/strapi/strapi-sdk-javascript.svg?style=for-the-badge)](https://travis-ci.org/strapi/strapi-sdk-javascript)
[![GitHub release](https://img.shields.io/github/release/strapi/strapi-sdk-javascript.svg?style=for-the-badge)](https://github.com/strapi/strapi-sdk-javascript/releases)
[![Codecov](https://img.shields.io/codecov/c/github/strapi/strapi-sdk-javascript.svg?style=for-the-badge)](https://codecov.io/gh/strapi/strapi-sdk-javascript)

## Install

```sh
npm install strapi-sdk-javascript
```

## Start now

### Example

```js
import Strapi from 'strapi-sdk-javascript'

const strapi = new Strapi('http://localhost:1337')
(async () => {
    const posts = await strapi.getEntries('post')
    console.log(posts.length)
})()
```

### API

- **Strapi(baseURL, [requestConfig](https://github.com/axios/axios#request-config))**
- **register(username, email, password)**
- **login(identifier, password)**
- **forgotPassword(email, url)**
- **resetPassword(code, password, passwordConfirmation)**
- **setToken(token)**
- **request(method, url, requestConfig)**
- **getEntries(contentType, params)**
- **getEntry(contentType, id)**
- **createEntry(contentType, data)**
- **updateEntry(contentType, id, data)**
- **deleteEntry(contentType, id)**
- **searchFiles(query)**
- **getFiles(params)**
- **getFile(id)**
- **upload(data)**

## Resources

- [Documentation](https://strapi.github.io/strapi-sdk-javascript)
- [Changelog](https://github.com/strapi/strapi-sdk-javascript/blob/master/CHANGELOG.md)

## Credits

- [axios](https://github.com/axios/axios)
- [typescript-starter](https://github.com/bitjson/typescript-starter)

## License

MIT