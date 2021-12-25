const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
require('dotenv').config({path: '../.env'});
const jwt = require('jsonwebtoken');
const dbFunc = require('../helpers/database');
const v = require('../helpers/validate');
const con = require('../connection');
let variables = require('./variables')

const ROOT = '/';
const tokenDuration = '7d';

// signs a jwt token for the user to use
const getToken = (email) => {
  return jwt.sign({ sub: email }, process.env.SECRET, { expiresIn: tokenDuration });
}

// returns user object without password
const omitPassword = (user)=> {
  const { Password, Token, ...userWithoutPassword } = user;
  return userWithoutPassword;
}


// post logs user in
router.post(ROOT, async (req, res) => {

  let json = req.body;
  variables.variables['login_post'][0] += 1;

  // check if password and email is acceptable
  let isValid = v.isValidAuthenticationRequest(json);
  if (!isValid[0]) {
    let output = {
      "success": false,
      "message": isValid[1]
    }
    res.send(output);
  } else {
    // check if user exists before attempting to login
    const user = await dbFunc.checkIfUserExists(json.email);

    if (user[0]) {
      // compare their password against the hashed password stored in the db
      bcrypt.compare(json.password, user[1].Password, (_, result) => {
        if (result) {
          let token = getToken(json.email);
          let output = {
            "success": true,
            "message": `You are now logged in as ${json.email}`,
            ...omitPassword(user[1]),
            token
          }
          let updateTokenSql = `UPDATE User SET Token = '${token}' WHERE Id = ${user[1].Id};`;
          con.promise(updateTokenSql)
          .finally(() => {
            res.send(output);
          });          
        } else {
          let output = {
            "success": false,
            "message": "The email or password you entered is incorrect."
          }
          res.send(output);
        }
      });
    } else {
      let output = {
        "success": false,
        "message": `There is no user with email "${json.email}".`
      }
      res.send(output);
    }
  }
});



module.exports = router;