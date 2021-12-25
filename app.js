const express = require('express');
const jwt = require('./jwt/jwt');
const PORT = 8888;
const app = express();
const cors = require('cors');
const RECIPES = '/recipes';
const USER = '/users';
const LOGIN = '/login';
const REGISTER = '/register';
const recipeRouter = require('./routers/recipes');
const userRouter = require('./routers/users');
const loginRouter = require('./routers/login');
const registerRouter = require('./routers/register');

// ######################################################################
// # Set this to the root of your node js application on hosted server. #
// ######################################################################
// const ROOT = '/COMP4537/TermProject';
const ROOT = '';

app.use(cors());
app.use(jwt());
app.use(express.json());

app.use(ROOT + LOGIN, loginRouter);
app.use(ROOT + REGISTER, registerRouter);
app.use(ROOT + RECIPES, recipeRouter);
app.use(ROOT + USER, userRouter);

app.get(ROOT + "*", (_, res) => {
    res.send("Server up and running.");
});

app.listen(PORT, (err) => {
    if (err) console.log(err.message);
    console.log("Listening to port", PORT);
});