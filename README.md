# Recipe Wizard API by Jakob Fipke

Hello! This is a fun project I worked on in my Internet Software Architecture course this last term.

My teammates did make a front-end React app to go along with this API I created, but it is
embarassingly bad, so here is the API that I created almost exclusively by myself, with some
additions by Jonathan Orfani and Chris Zhang.

The goal of this project was to create a user-based API that allows users to save ingredients that
they have on hand, and get back some suggested recipes that use those ingredients. From there, the
user can then save those recipes to view later. We also planned on users being able to add custom
recipes with ingredients and instructions to the database, but that still isn't fully implemented.

Anyways, the code for the main suggested recipes endpoint is under routers/suggested along with
all of the other express routers outside of app.js.

Follow the guide below to test it out on your local machine.


# Testing on your local machine

First, run an npm install to install all of the dependencies used in this project.

To test this API locally, you will need to have MySQL running on your local machine.

The way we recommend, which isn't too difficult, is to install XAMPP with MySQL and PHPMyAdmin.

Within PHPMyAdmin, create a new user for localhost called 'recipewizard'. Before creating the user, under 'Database for user account', check both boxes: 'Create database with same name and grant all privileges', and 'Grant all privileges on wildcard name (username\_%).'

This will create a database and user specific to that database to use for this API.

Now you will need to create a .env file at the project root with the following information:

DB_HOST=localhost
DB_USER=(Name of db user you created)
DB_PASSWORD=(Password for db user you created)
DB_DATABASE=(Name of db you created)
SECRET=(Any random string to be used as jwt secret)

To initialize the database with 3 sample recipes with ingredients and instructions, navigate to the /setup folder and run 'node initialSetup.js'.

Now you will need to run the API. To do this, run the command 'node app.js' from the root folder.

Now that it's running, the easiest way to test out the endpoints is to preview the swagger.json file with VSCode's Swagger Viewer extension. Once you have the preview open, you will have to first use the /register endpoint to register a new user. Once that user has been created, use that same email and password in the /login endpoint to get a JWT token. Now, you must use that JWT token to authorize your requests to other endpoints by entering 'Bearer <Your_User_Token>' (click Authorize at top right of page to do this). Now you can use any of the other endpoints!

The endpoint I am most proud of, and the main feature of this API is the /users/{userId}/suggested endpoint. This endpoint takes all of the ingredients saved to a specific user, and returns a list of recipes, along with which ingredients from each recipe it matched on, and a list of all ingredients and instructions related to each recipe.

Hope you enjoyed!
