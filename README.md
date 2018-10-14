# Phoster Backend

> Express REST API with JWT Authentication and support for PostgreSQL

- authentication via [JWT](https://jwt.io/)
- routes mapping via [express-routes-mapper](https://github.com/aichbauer/express-routes-mapper)
- environments for `development`, `testing`, and `production`
- integration tests running with [Jest](https://github.com/facebook/jest)

## Use

```sh
# cd into project root
$ npm install
# copy environment file 
$ cp .env.example .env
# fill .env file
# ...
# to use MySQL
$ npm install -S mysql2
# start the application
$ npm start
```

PostgreSQL is supported out of the box as it is the default.

## Folder Structure

App has 3 main directories:

- app - for controllers, models, services, etc.
- config - for routes, database, etc.
- test - using [Jest](https://github.com/facebook/jest)

## auth.policy

The `auth.policy` checks wether a `JSON Web Token` ([further information](https://jwt.io/)) is send in the header of an request as `Authorization: Bearer [JSON Web Token]` or inside of the body of an request as `token: [JSON Web Token]`.
The policy runs default on all api routes that are are prefixed with `/private`. To map multiple routes read the [docs](https://github.com/aichbauer/express-routes-mapper/blob/master/README.md) from `express-routes-mapper`.

To use this policy on all routes of a specific prefix:

app.js

```js
app.use('/prefix', yourRoutes);
app.all('/prefix', (req, res, next) => auth(req, res, next));
```

or to use this policy on one specific route:

app.js

```js
app.get('/specificRoute',
  (req, res, next) => auth(req, res, next),
  (req, res) => {
  // do some fancy stuff
});
```

## Services

Services are little useful snippets, or calls to another API that are not the main focus of your API.

Example service:

Get comments from another API:

```js
module.exports = {
  getComments: () => (
    fetch('https://jsonplaceholder.typicode.com/comments', {
      method: 'get'
    }).then(function(res) {
      // do some fancy stuff with the response
    }).catch(function(err) {
      // Error :(
    })
  );
};
```

## Config

Holds all the server configurations.

## Connection and Database

> Note: if you use msql make sure mysql server is running on the machine

> Note: if you use postgres make sure postgres server is running on the machine

This two files are the way to establish a connaction to a database.

You only need to touch connection.js, default for `development` is PostgreSQL, but it is easy as typing `mysql` to switch to another db.

> Note: to run a postgres db run these package with: `yarn add pg pg-hstore` or `npm i -S pg pg-hstore`

Now simple configure the keys with your credentials in `.env` file.

```
  DB_DIALECT=postgres
  DB_HOST=
  DB_NAME=
  DB_USER=
  DB_PASSWORD=
  DB_PORT=3306
```

## Test

All test for this boilerplate uses [Jest](https://github.com/facebook/jest) and [supertest](https://github.com/visionmedia/superagent) for integration testing. So read their docs on further information.

### npm start

This is the entry for a developer. This command:

- runs **nodemon watch task** for the all files conected to `.app/app.js`
- sets the **environment variable** `NODE_ENV` to `development`
- opens the db connection for `development`
- starts the server on 127.0.0.1:2017

### npm test

This command:

- runs `npm run lint` ([eslint](http://eslint.org/)) with the [airbnb styleguide](https://github.com/airbnb/javascript) without arrow-parens rule for **better readability**
- sets the **environment variable** `NODE_ENV` to `testing`
- runs `jest --coverage` for testing with [Jest](https://github.com/facebook/jest) and the coverage

## npm run production

This command:

- sets the **environment variable** to `production`
- opens the db connection for `production`
- starts the server on 127.0.0.1:2017 or on 127.0.0.1:PORT_ENV

Before running on production you have to set the **environment vaiables**:

- DB_NAME - database name for production
- DB_USER - database username for production
- DB_PASS - database password for production
- DB_HOST - database host for production
- JWT_SECERT - secret for json web token

Optional:

- PORT - the port your api on 127.0.0.1 or localhot, default to 2018

### other commands

- `npm run dev` - simply start the server withou a watcher
- `npm run nodemon` - same as `npm start```
- `pretest` - runs linting before `npm test`
- `test-ci` - only runs tests, nothing in pretest, nothing in posttest, for better use with ci tools

## LICENSE

MIT © Mark Khramko
