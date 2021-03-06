### Project Running with docker-compose
Once you clone or download project go into you folder

```
>docker-compose up
```

### Project Running without docker-compose
>copy **.env.local** file to **.env** file
>edit .env
```
> npm install or yarn install  (this will install all dependent libraries)
> npm start or yarn start
```
But this will not work without media server

### Migration run
After creating database and updating .env file run below commands
```
> node_modules/.bin/sequelize db:migrate
```
Migration will create table users and seed some default users
* **users** - this is normal user table with some required fields like (firstName, lastName, email, password)
* **images** - this is image table with some required fields like (link)

### Routing files
> Currently we have added 2 routing files 
```
> pub.js   # public routing access everyone can access this APIs
> api.js   # only logged in user/ with vaild token user can access this routes

```

### Endpoints
1. /public/register - register and get token (POST)
2. /public/login - login and get token (POST, AUTHORIZED)
3. /protected/images - get user images (GET, AUTHORIZED)
4. /protected/images - Saves the image and stores link in db. (POST images, AUTHORIZED)
5. /protected/images/:id - get the image by id. (GET, AUTHORIZED)

JWT Token should be in header with prefix **x-token**