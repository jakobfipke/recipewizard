const express = require('express');
const router = express.Router();
const con = require('../connection');
const q = require('../constants/database');
const dbFunc = require('../helpers/database');
const suggestedRouter = require('./suggested');

const ROOT = '/';
const ID = '/:id';
const ID2 = '/:id2';
const SAVED_RECIPES = '/recipes';
const SUGGESTED = '/suggested';
const INGREDIENTS = '/ingredients';
const BATCH = '/batch';
const REQUEST = '/request'
const variables = require('./variables')

router.get(REQUEST, (_, res) => {
  res.send(variables.variables);
});

//updates users password
router.put(ID, async (req, res) => {
  variables.variables['update_password_put'][0] += 1
  let valid = await dbFunc.checkUserToken(req.params.id, req.headers.authorization.split(' ')[1]);


  if (valid[0]) {
    let json = req.body;
    const msg = await dbFunc.updateUser(req.params.id, json.password, q.tables.USER);
    let output;
    if (msg[0]) {
      output = {
        "success": true,
        "msg": msg[1]
      }
    } else {
      output = {
        "success": false,
        "msg": msg[1]
      }
    }
    res.send(output);

  } else {
    res.send("Not a valid token");
  }
});

//goes to suggested router
router.use(ID + SUGGESTED, suggestedRouter);

// gets all users
router.get(ROOT, (req, res) => {
  let query = 'SELECT * FROM User;';
  variables.variables['all_users_get'][0] += 1;

  con.promise(query)
    .then((result) => {
      let output = result;
      output.forEach(user => {
        delete user.Password;
        delete user.Token;
      })
      res.send({ "success": true, "users": output });
    })
    .catch((error) => {
      console.log(error.message);
      res.send({ "success": false, "message": error.message });
    });

});

// gets a single user
router.get(ID, async (req, res) => {
  const msg = await dbFunc.checkIfIdExistsInTable(req.params.id, q.tables.USER);
  variables.variables['user_id_get'][0] += 1;
  let output;
  if (msg[0]) {
    let { Password, Token, ...userWithoutPassword } = msg[1];
    output = {
      "success": true,
      "user": userWithoutPassword
    }
  } else {
    output = {
      "success": false,
      "message": "No user exists by that ID."
    }
  }
  res.send(output);
});

//gets all users ingredients
router.get(ID + INGREDIENTS, async (req, res) => {
  let id = req.params.id;
  variables.variables['all_user_ingredients_get'][0] += 1

  const userExists = await dbFunc.checkIfIdExistsInTable(id, q.tables.USER);
  const table = q.tables.USER_INGREDIENT;
  if (userExists[0]) {
    let userIngredientsQuery = `SELECT * FROM ${table} WHERE UserId = ${id};`;
    con.promise(userIngredientsQuery)
      .then(result => {
        res.send(result);
      })
      .catch(error => {
        res.send(error.message);
      });
  }
});

//gets a single user ingredient
router.get(ID + INGREDIENTS + ID2, async (req, res) => {
  
  let id = req.params.id;
  let id2 = req.params.id2;
  variables.variables['single_user_ingredient_get'][0] += 1
  const userExists = await dbFunc.checkIfIdExistsInTable(id, q.tables.USER);
  const table = q.tables.USER_INGREDIENT;
  if (userExists[0]) {
    let userIngredientQuery = `SELECT * FROM ${table} WHERE UserId = ${id} AND Id = ${id2};`;
    con.promise(userIngredientQuery)
      .then(result => {
        if (result.length) {
          res.send(result[0]);
        } else {
          res.send("No such ingredient");
        }
      })
      .catch(error => {
        res.send(error.message);
      });
  }
});

// post single user ingredient
router.post(ID + INGREDIENTS, async (req, res) => {
  let valid = await dbFunc.checkUserToken(req.params.id, req.headers.authorization.split(' ')[1]);
  variables.variables['single_user_ingredient_post'][0] += 1

  if (valid[0]) {
    let id = req.params.id;

    if (req.body.name === undefined) {
      res.send("Must specify 'name'");
    } else {
      const userExists = await dbFunc.checkIfIdExistsInTable(id, q.tables.USER);

      console.log(userExists);

      if (userExists[0]) {
        const sqlAddIngredient = [
          'INSERT INTO UserIngredient (Name, UserId)',
          `VALUES ("${req.body.name}", ${id});`,
        ].join(' ');
        con.promise(sqlAddIngredient)
          .then(result => {
            res.send("Ingredient saved.");
          })
          .catch(error => {
            console.log(error.message);
            res.send(error.message);
          });
      } else {
        res.send("Error occured adding ingredient.");
      }
    }
  } else {
    res.send("Not a valid token");
  }

});

// post list of ingredients as list
router.post(ID + BATCH, async (req, res) => {
  let valid = await dbFunc.checkUserToken(req.params.id, req.headers.authorization.split(' ')[1]);
  variables.variables['list_user_ingredients_post'][0] += 1
  if (valid[0]) {
    const id = req.params.id;
    const list = req.body.list;

    if (list === undefined) {
      res.send("Must specify 'list'");
    } else if (!Array.isArray(list) || !list.every(i => (typeof i === "string"))) {
      res.send("'list' must be an array of strings");
    } else {
      const userExists = await dbFunc.checkIfIdExistsInTable(id, q.tables.USER);

      console.log(userExists);

      if (userExists[0]) {
        list.forEach((i, index) => {
          let sqlAddIngredient = [
            'INSERT INTO UserIngredient (Name, UserId)',
            `VALUES ("${i}", ${id});`,
          ].join(' ');
          con.promise(sqlAddIngredient)
            .then(result => {
              if (index === list.length - 1) res.send("Ingredients successfully added");
            })
            .catch(error => {
              console.log(error.message);
              res.send(error.message);
            });
        })

      } else {
        res.send("Error occured adding ingredient.");
      }
    }
  } else {
    res.send("Not a valid token");
  }

});

// deletes a single user ingredient
router.delete(ID + INGREDIENTS + ID2, async (req, res) => {

  let valid = await dbFunc.checkUserToken(req.params.id, req.headers.authorization.split(' ')[1]);
  variables.variables['user_ingredient_by_id_delete'][0] += 1
  if (valid[0]) {
    let id = req.params.id;
    let id2 = req.params.id2;

    const userExists = await dbFunc.checkIfIdExistsInTable(id, q.tables.USER);
    const valid = await dbFunc.checkUserToken(id, req.headers.authorization.split(' ')[1]);
    const saved = await dbFunc.checkIfIdExistsInTable(id2, q.tables.USER_INGREDIENT);

    if (!valid[0]) {
      res.send('Invalid token.');
    } else if (!userExists[0]) {
      res.send('User does not exist.');
    } else if (!saved[0]) {
      res.send('That ingredient does not exist');
    } else {
      const sqlDeleteSavedRecipe = `DELETE FROM UserIngredient WHERE Id = ${id2}`;
      con.promise(sqlDeleteSavedRecipe)
        .then(result => {
          res.send("Ingredient deleted.");
        })
        .catch(error => {
          console.log(error.message);
          res.send(error.message);
        });
    }
  } else {
    res.send("Not a valid token");
  }

});

// gets all users saved recipes
router.get(ID + SAVED_RECIPES, async (req, res) => {
  variables.variables['user_saved_recipes_get'][0] += 1
  let id = req.params.id;
  const userExists = await dbFunc.checkIfIdExistsInTable(id, q.tables.USER);
  const table = q.tables.SAVED_RECIPE;
  if (userExists[0]) {
    let userSavedRecipesQuery = `SELECT * FROM ${table} WHERE UserId = ${id};`;
    con.promise(userSavedRecipesQuery)
      .then(result => {
        res.send(result);
      })
      .catch(error => {
        res.send(error.message);
      });
  }
});

// gets a single user saved recipe
router.get(ID + SAVED_RECIPES + ID2, async (req, res) => {
  variables.variables['single_user_saved_recipe_get'][0] += 1
  let id = req.params.id;
  let id2 = req.params.id2;
  const userExists = await dbFunc.checkIfIdExistsInTable(id, q.tables.USER);
  const table = q.tables.SAVED_RECIPE;
  if (userExists[0]) {
    let userSavedRecipeQuery = `SELECT * FROM ${table} WHERE UserId = ${id} AND Id = ${id2};`;
    con.promise(userSavedRecipeQuery)
      .then(result => {
        if (result.length) {
          res.send(result[0]);
        } else {
          res.send("No such saved recipe");
        }
      })
      .catch(error => {
        res.send(error.message);
      });
  }
});
// post saves recipe by id
router.post(ID + SAVED_RECIPES, async (req, res) => {
  let valid = await dbFunc.checkUserToken(req.params.id, req.headers.authorization.split(' ')[1]);
  variables.variables['save_recipe_by_id_post'][0] += 1
  if (valid[0]) {
    let id = req.params.id;
    let recipeId = req.body.recipeId
    if (req.body.recipeId === undefined) {
      res.send("Must specify 'recipeId'");
    } else {
      const userExists = await dbFunc.checkIfIdExistsInTable(id, q.tables.USER);
      const recipeExists = await dbFunc.checkIfIdExistsInTable(recipeId, q.tables.RECIPE);
      const saved = await dbFunc.checkIfRecipeAlreadySaved(id, recipeId);

      if (userExists[0] && recipeExists[0] && !saved[0]) {
        const sqlAddSavedRecipe = [
          'INSERT INTO SavedRecipe (RecipeId, UserId)',
          `VALUES ("${recipeId}", ${id});`,
        ].join(' ');
        con.promise(sqlAddSavedRecipe)
          .then(result => {
            res.send("Recipe saved.");
          })
          .catch(error => {
            console.log(error.message);
            res.send(error.message);
          });
      } else {
        res.send("Error occured adding recipe.");
      }
    }
  } else {
    res.send("Not a valid token");
  }

});
// deletes a saved recipe 
router.delete(ID + SAVED_RECIPES + ID2, async (req, res) => {
  variables.variables['saved_recipe_delete'][0] += 1
  let valid = await dbFunc.checkUserToken(req.params.id, req.headers.authorization.split(' ')[1]);

  if (valid[0]) {
    let id = req.params.id;
    let id2 = req.params.id2;

    const userExists = await dbFunc.checkIfIdExistsInTable(id, q.tables.USER);
    const valid = await dbFunc.checkUserToken(id, req.headers.authorization.split(' ')[1]);
    // const saved = await dbFunc.checkIfIdExistsInTable(id2, q.tables.SAVED_RECIPE);

    if (!valid[0]) {
      res.send('Invalid token.');
    } else if (!userExists[0]) {
      res.send('User does not exist.');
    } else {
      const sqlDeleteSavedRecipe = `DELETE FROM SavedRecipe WHERE RecipeId = ${id2} AND UserId = ${id}`;
      con.promise(sqlDeleteSavedRecipe)
        .then(result => {
          res.send("Recipe deleted.");
        })
        .catch(error => {
          console.log(error.message);
          res.send(error.message);
        });
    }
  } else {
    res.send("Not a valid token");
  }

});

module.exports = router;