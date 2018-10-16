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
# start the application in development
$ npm run dev
# start the application in production
$ npm start
```

PostgreSQL is supported out of the box as it is the default.

## API Routes

> All API requests have prefix `/api/v1`.

> Routes with prefix `/private` must be requested with header in form `Authorization: Bearer <token>`.

- POST `/register` - User registration; Params: `{"username":<Username (String)>, "password":<Password (String)>}`.
- POST `/login` - User login; Params: `{"username":<Username (String)>, "password":<Password (String)>}`.
- POST `/validate` - Validate JWT; Params: `{"token":<JWT (String)>`.
- PUT `/private/photos` - Upload photo; `{"latitude":<Location latitude (Real)>, "longitude":<Location longitude (Real)>}`.
- GET `/private/photos?last_photo_date=<Date of last fetched photo>` - Get feed of photos.
- POST `/private/photos/like` - Like specific photo; Params: `{"photoId":<Id of Photo (Int)>, "isLiked":<true or false (Bool)>}`.


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

## LICENSE

MIT © Mark Khramko, Roman (Spacecrio) Kurakin, Alexander (Daff) Sinyatkin
