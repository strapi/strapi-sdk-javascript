⚠️ This package not up to date and maintained ⚠️

We recommend you not to use this package. We stopped to maintained it by lack of time and also because the features provided by this SDK are the same as a good HTTP client well configured.
So I suggest you use the best HTTP client for the technology you use. To configure it to target your Strapi API.
Here so usefull ressources to help you:
- [**API Endpoints**](https://strapi.io/documentation/3.0.0-beta.x/guides/api-endpoints.html#endpoints)
- [**URL parameters**](https://strapi.io/documentation/3.0.0-beta.x/guides/parameters.html)

---

<p align="center"><img src="https://cldup.com/7umchwdUBh.png" /></p>

<h3 align="center">The official Strapi SDK for JavaScript, available for browsers or Node.js backends.</h3>

---

<p align="center">
    <a href="https://travis-ci.org/strapi/strapi-sdk-javascript"><img src="https://img.shields.io/travis/strapi/strapi-sdk-javascript.svg?style=for-the-badge" /></a>
    <a href="https://github.com/strapi/strapi-sdk-javascript/releases"><img src="https://img.shields.io/github/release/strapi/strapi-sdk-javascript.svg?style=for-the-badge" /></a>
    <a href="https://codecov.io/gh/strapi/strapi-sdk-javascript"><img src="https://img.shields.io/codecov/c/github/strapi/strapi-sdk-javascript.svg?style=for-the-badge" /></a>
</p>

<br>

## Install

```sh
npm install strapi-sdk-javascript
```

## Start now

### New instance
```js
import Strapi from 'strapi-sdk-javascript';
const  options = {
    url:'', // by default : 'http://localhost:1337
    storeConfig:{
        cookie: {
        key: 'jwt',
        options: {
          path: '/'
        }
    },
    localStorage:{} // | boolean
    },
    requestConfig: '',
}
const strapi = new Strapi(options)
```



### Authentications

#### Local
```js
await strapi.login({identifier:'email', password:'password'});
```

```js
// Redirect your user to the provider's authentication page.
window.location = strapi.getProviderAuthenticationUrl('facebook');
```
Once authorized, the provider will redirects the user to your app with an access token in the URL.
```js
// Complete the authentication: (The SDK will store the access token for you)
await strapi.authenticateProvider('facebook');
```
You can now fetch private APIs
```js
const posts = await strapi.find('posts');
```

### Files management

#### Browser
```js
const form = new FormData();
form.append('files', fileInputElement.files[0], 'file-name.ext');
form.append('files', fileInputElement.files[1], 'file-2-name.ext');
const files = await strapi.upload(form);
```

#### Node.js
```js
const FormData = require('form-data');
const fs = require('fs');
const form = new FormData();
form.append('files', fs.createReadStream('./file-name.ext'), 'file-name.ext');
const files = await strapi.upload(form, {
  headers: form.getHeaders()
});
```


## API

### `Strapi({url, storeConfig, requestConfig})` ..url default: loclahost:1337
### `request(method, url, requestConfig)`
### `register(username:'usernme', email:'email', password:'password' )`
### `login({identifier:'email', password:'password'})`
### `forgotPassword({email:'email'})`
### `resetPassword({code:'code', password:'password', passwordConfirmation:'passwordConfirmation'})`
### `getProviderAuthenticationUrl(provider)`
### `authenticateProvider(provider, params)`
### `setToken(token, comesFromStorage)`
### `clearToken(token)`
### `me()` return data users/me :fea
### `find(entity, params)`
### `findByID(entity, id)`
### `count(entity, params)`
### `create(entity, data)`
### `update(entity, id, data)`
### `delete(entity, id)`
### `searchFiles(query)`
### `findFiles(params)`
### `findFile(id)`
### `upload(data)`
### `graphql(query)` :fea

#### requestConfig

Custom axios request configuration. [See documentation](https://github.com/axios/axios#request-config)

## Resources

* [Documentation](https://strapi.github.io/strapi-sdk-javascript)
* [Changelog](https://github.com/strapi/strapi-sdk-javascript/blob/master/CHANGELOG.md)
* [Medium story](https://medium.com/strapi/announcing-the-strapi-javascript-sdk-ac89f140a9d1)

## Roadmap

* GraphQL
* Attach/Detach entry relationship
* Real time with Socket.io

## Credits

* [axios](https://github.com/axios/axios)
* [typescript-starter](https://github.com/bitjson/typescript-starter)

## License

MIT
