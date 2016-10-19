# Goal Reminder App

Stack:
* Bootstrap + jQuery
* React.js + Redux + Babel ES6
* Express
* Node.js

Switch between build/run environments using the environment variable ```NODE_ENV```:
* ```NODE_ENV=production```
* ```NODE_ENV=development``` (default)
* ```NODE_ENV=test``` (forced for tests)

Here's the list of variables that should be set for each environment:
* ```DEBUG``` (optional)
* ```DATABASE_URL``` (example: postgres://my_role:my_role_pass@localhost:5432/my_database)
* ```GCM_API_KEY``` (the Google Cloud Messaging service API key)
* ```PORT``` (the API's HTTP server port; defaults to 3000)
* ```API_ROOT``` (the root URL, domain + port, used for API calls)
* ```MAIL_SENDER``` (the welcome email sender's address)
* ```MAIL_WEBSITE``` (the root URL, domain + port, used for emails)
* ```JWT_SECRET``` (the JWT generation secret)

```DEBUG``` is used to configure the debug log output:  
To see all debug logs, set ```DEBUG=*```  
To avoid storage logs, set ```DEBUG=*,-storage*```

```API_ROOT``` is used in front-end components to tell superagent where to find the API.
For testing, the modules will be run in Node so they can read process.env
directly. For production, webpack.config.js strips out process.env.API_ROOT, so
the browser will use the root it was loaded on. Set it to
"http://localhost:<PORT>" before running the integration tests, and ensure the app
is running on that port.

All variables can be set in a ```<NODE_ENV>.env``` file inside the ```../config``` folder (sibling of your git repo folder). Use:
* ```test.env``` for test environment variables
* ```development.env``` for development environment variables
* ```production.env``` for production environment variables

## Setting up the **development** environment

1. ```npm install```
2. Set ```DATABASE_URL=postgres://grdev_role:ht9PqWxKv5emthmubEErpJSg@localhost:5432/goalreminder_dev``` (use the ```development.env``` file)
3. Set all other required environment variables (use the ```development.env``` file)
4. Set up the database: ```npm run db-reset-dev```
5. ```npm run webpack``` (build the front-end)
6. ```npm start```

## Setting up the **test** environment

TODO

### Running Unit Tests

```npm test``` (TODO)

### Running Integration Tests

TODO


## API and Swagger

The API is available at ```/api/v1```

The Swagger docs are available at ```/api/v1/docs``` (TODO)

