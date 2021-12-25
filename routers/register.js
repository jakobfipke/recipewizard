const express = require('express');
const router = express.Router();
const con = require('../connection');
const bcrypt = require('bcrypt');
const dbFunc = require('../helpers/database')
const v = require('../helpers/validate');
const SALTS = 10;
const ROOT = '/';
const variables = require('./variables')



// post create new user
router.post(ROOT, async (req, res) => {
  let json = req.body;
  variables.variables["create_new_user_post"][0] += 1

  let isValid = v.isValidAuthenticationRequest(json);
  if (!isValid[0]) {
    let output = {
      "success": false,
      "message": isValid[1]
    }
    res.send(output);
  } else {
    const user = await dbFunc.checkIfUserExists(json.email);

    if (user[0]) {
      let output = {
        "success": false,
        "message": "That email is already registered. Please choose a different email."
      }
      res.send(output);
    } else {
      // hash their password and create new user with email and hashed password
      bcrypt.hash(json.password, SALTS, (_, hash) => {
        const sqlCreateNewUser = [
          'INSERT INTO User (Email, Password)',
          `VALUES ('${json.email}', '${hash}');`,
        ].join(' ');

        con.promise(sqlCreateNewUser)
          .then(result => {
            console.log(JSON.stringify(result, null, 1));
            let output = {
              "success": true,
              "message": `User with email "${json.email}" was successfully created.`
            }
            res.send(output);
          })
          .catch(error => {
            console.log(JSON.stringify(error, null, 1));
            let output = {
              "success": false,
              "message": `Unexpected error occurred while trying to create user "${json.email}".`
            }
            res.send(output);
          });
      });
    }
  }
});



module.exports = router;