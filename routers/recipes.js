const express = require('express');
const router = express.Router();
const con = require('../connection');
const v = require('../helpers/validate');
const variables = require('./variables');
const dbFunc = require('../helpers/database');
const q = require('../constants/database');

const ROOT = '/';
const ID = '/:id';

// gets all recipes
router.get(ROOT, (_, res) => {
    const getRecipesQuery = 'SELECT * FROM Recipe;';
    variables.variables['all_recipes_get'][0] += 1;

    con.promise(getRecipesQuery)
        .then(result => {
            let output = {
                "success": true,
                "recipes": result
            }
            res.send(output);
        })
        .catch(err => {
            console.log(err.message);
            let output = {
                "success": false,
                "message": "Unable to retrieve recipes."
            }
            res.send(output);
        });
});

// gets one recipe by id
router.get(ID, (req, res) => {
    const getRecipeQuery = `SELECT * FROM Recipe WHERE Id = ${req.params.id};`;
    variables.variables['one_recipe_get'][0] += 1;

    con.promise(getRecipeQuery)
        .then(result => {
            if (result.length === 0) {
                let output = {
                    "success": false,
                    "message": "There is no recipe by that id."
                }
                res.send(output);
            } else {
                let output = {
                    "success": true,
                    "message": "Success.",
                    "recipe": result[0]
                }
                res.send(output);
            }
        })
        .catch(err => {
            console.log(err.message);
            let output = {
                "success": false,
                "message": "Unable to retrieve recipe."
            }
            res.send(output);
        })
});

// post a new recipe
router.post(ROOT, (req, res) => {
    const json = req.body;
    variables.variables['recipe_post'][0] += 1

    const isValid = v.isValidRecipe(json);
    if (!isValid[0]) {
        let output = {
            "success": false,
            "message": isValid[1]
        }
        res.send(output);
    } else {
        const queryAddRecipe = [
            'INSERT INTO Recipe (Title, Description)',
            `VALUES ('${json.title}', '${json.description}');`,
        ].join(' ');

        con.promise(queryAddRecipe)
            .then(result => {
                let output = {
                    "success": true,
                    "entry": {
                        "id": result.insertId,
                        "title": json.title,
                        "description": json.description,
                    }
                }
                res.send(output);
            })
            .catch(err => {
                console.log(err.message);
                let output = {
                    "success": false,
                    "message": "Could not add recipe."
                }
                res.send(output);
            })
    }

});

// delete a recipe and all if its related instructions and ingredients
router.delete(ID, async (req, res) => {
    const id = req.params.id;
    const exists = await dbFunc.checkIfIdExistsInTable(id, q.tables.RECIPE);

    if (exists[0]) {
        const getInstructionsQuery = `SELECT Id FROM Instruction WHERE RecipeId = ${id};`;
        const pInstructions = con.promise(getInstructionsQuery);
        const getIngredientsQuery = `SELECT Id FROM RecipeIngredient WHERE RecipeId = ${id};`;
        const pIngredients = con.promise(getIngredientsQuery);
        new Promise((resolve, reject) => {
            Promise.all([pInstructions, pIngredients]).then(info => {
                const [instructions, ingredients] = info;
                const ISIDs = instructions.map(i => i.Id);
                const IGIDs = ingredients.map(i => i.Id);
                let ISIDsString;
                let IGIDsString;
                if (ISIDs) {
                    ISIDsString = '(' + ISIDs.toString() + ')';
                } else {
                    ISIDsString = '()';
                }
                if (IGIDs) {
                    IGIDsString = '(' + IGIDs.toString() + ')';
                } else {
                    IGIDsString = '()';
                }
                const deleteInstructionsQuery = `DELETE FROM Instruction WHERE Id IN ${ISIDsString};`;
                const pDeleteIns = con.promise(deleteInstructionsQuery);
                const deleteIngredientsQuery = `DELETE FROM RecipeIngredient WHERE Id IN ${IGIDsString};`;
                const pDeleteIng = con.promise(deleteIngredientsQuery);
                Promise.all([pDeleteIns, pDeleteIng]).then(delResult => {
                    resolve(delResult);
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        }).then(() => {
            const deleteRecipeQuery = `DELETE FROM Recipe WHERE Id = ${id}`;
            return con.promise(deleteRecipeQuery);
        }).then(() => {
            const output = {
                "success": true,
                "message": "Successfully deleted recipe"
            }
            res.send(output);
        }).catch((err) => {
            res.send(err);
        });

    } else {
        const output = {
            "success": false,
            "message": "Recipe does not exist."
        }
        res.send(output);
    }
});

module.exports = router;