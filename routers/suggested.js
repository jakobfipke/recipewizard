const express = require('express');
const con = require('../connection');
const dbFunc = require('../helpers/database');

const ROOT = '/';
const MAX_SUGGESTED = 10;
const variables = require('./variables')

const titleCase = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, word => {
        return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    });
};

const lowerCase = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, word => {
        return word.toLowerCase();
    });
};


const router = express.Router({
    mergeParams: true
});
// localhost:8888/users/:id/suggested/request

// gets suggested recipes 
router.get(ROOT, async (req, res) => {
    variables.variables['suggested_recipe_get'][0] += 1
    let valid = await dbFunc.checkUserToken(req.params.id, req.headers.authorization.split(' ')[1]);

    if (valid[0]) {
        // key of recipeId, value is set of attached ingredient ids
        let suggested = {};

        // Get all of the user's saved, on-hand ingredients
        let getUserIngredientsQuery = `SELECT Name FROM UserIngredient WHERE UserId = ${req.params.id};`;
        con.promise(getUserIngredientsQuery)
            .then(result => {
                if (result.length > 0) {
                    // Get an array of the names of a user's ingredients
                    let userIngredients = result.map(i => i.Name);
                    // Store unique matching ingredients by ingredient id
                    let ingredientMatches = {};
                    const p = new Promise(resolve => {
                        userIngredients.forEach((ingredient, index) => {
                            // Check if the title case or lower case or original version of the ingredient matches
                            let matchingIngredientsQuery = [
                                `SELECT * FROM RecipeIngredient`,
                                `WHERE Name LIKE '%${titleCase(ingredient)}%'`,
                                `OR Name LIKE '%${lowerCase(ingredient)}%'`,
                                `OR Name LIKE '%${ingredient}%';`
                            ].join(' ');
                            con.promise(matchingIngredientsQuery)
                                .then(result => {
                                    result.forEach(i => {
                                        ingredientMatches[i.Id] = i;
                                    });
                                    if (index === userIngredients.length - 1) resolve(ingredientMatches);
                                })
                                .catch(error => {
                                    res.send({
                                        "success": false,
                                        "message": error.message
                                    });
                                });
                        });
                    })
                    return p;
                } else {
                    res.send({
                        "success": false,
                        "message": "User has no ingredients"
                    });
                }
            })
            .then(result => {

                // Each entry is a RecipeIngredient that matched on one of the user's ingredients.
                // Here we reorganize this data and store it in the object 'suggested' which
                // has keys of unique RecipeId's and values of an array of RecipeIngredient Id's
                // which matched with the user's ingredients.
                Object.entries(result).forEach(entry => {
                    const [RIID, RIO] = entry;
                    if (!suggested[RIO.RecipeId]) {
                        suggested[RIO.RecipeId] = [];
                    }
                    if (!(RIID in suggested[RIO.RecipeId])) {
                        suggested[RIO.RecipeId].push(RIID);
                    }
                });

                // Here, we convert 'suggested' into an array of arrays like so [[RID, RIID[]], [RID, RIID[]]]
                // instead of the current structure of { RID: RIID[], RID: RIID[] } so that we can sort it
                // so that recipes that matched on more ingredients come first in the new 'sorted' array.
                let sorted = Object.entries(suggested).sort((first, second) => {
                    return second[1].length - first[1].length;
                });

                // Now we get all the data related to any recipes that had ingredients 
                // that matched with the user's ingredients, and store it in
                // 'outputSuggestions', an array of recipe suggestion objects.
                //
                // The promise 'p' promises to get all this data to fill 'outputSuggestions'.
                // It resolves with a copy of outputSuggestions once it has been filled with the necessary data.
                let outputSuggestions = [];
                const p = new Promise(resolve => {
                    sorted.forEach((entry, index) => {
                        const [RID, matchingIIDs] = entry;
                        // Get data for this recipe
                        let getRecipeQuery = `SELECT * FROM Recipe WHERE Id = ${RID};`;
                        con.promise(getRecipeQuery)
                            .then(result => {
                                if (result.length > 0) {
                                    let recipe = {
                                        ...result[0]
                                    };

                                    // Get all ingredients that matched on this recipe
                                    let p1 = new Promise(resolve => {
                                        let idsString = '(' + matchingIIDs.toString() + ')';
                                        let getMatchingIngredientsQuery = `SELECT * FROM RecipeIngredient WHERE Id IN ${idsString};`;
                                        con.promise(getMatchingIngredientsQuery)
                                            .then(result => {
                                                resolve(result);
                                            })
                                            .catch(error => {
                                                res.send({
                                                    "success": false,
                                                    "message": error.message
                                                });
                                            });
                                    });

                                    // Get all ingredients for this recipe
                                    let p2 = new Promise(resolve => {
                                        let getAllIngredientsQuery = `SELECT * FROM RecipeIngredient WHERE RecipeId = ${RID};`;
                                        con.promise(getAllIngredientsQuery)
                                            .then(result => {
                                                resolve(result);
                                            })
                                            .catch(error => {
                                                res.send({
                                                    "success": false,
                                                    "message": error.message
                                                });
                                            });
                                    });

                                    // Get all instructions for this recipe
                                    let p3 = new Promise(resolve => {
                                        let getAllInstructionsQuery = `SELECT * FROM Instruction WHERE RecipeId = ${entry[0]};`;
                                        con.promise(getAllInstructionsQuery)
                                            .then(result => {
                                                resolve(result);
                                            })
                                            .catch(error => {
                                                res.send({
                                                    "success": false,
                                                    "message": error.message
                                                });
                                            });
                                    });

                                    Promise.all([p1, p2, p3]).then(values => {
                                        const [matching, allIngredients, allInstructions] = values;
                                        recipe.matching = matching;
                                        recipe.ingredients = allIngredients;
                                        recipe.instructions = allInstructions;
                                        outputSuggestions.push(recipe);
                                        // ###########################################################
                                        // # This is where all remaining promises are being resolved
                                        // # with our completed outputSuggestions as our result.
                                        // ###########################################################
                                        if (index === MAX_SUGGESTED - 1 || index === sorted.length - 1) resolve(outputSuggestions);
                                    });
                                }
                            })
                            .catch(error => {
                                res.send({
                                    "success": false,
                                    "message": error.message
                                });
                            });
                    });
                })
                // Now that 'outputSuggestions' has been filled with all the necessary data
                // we send it to the client.
                p.then((result) => res.send(result));
            })
            .catch(error => {
                res.send({
                    "success": false,
                    "message": error.message
                });
            });
    } else {
        res.send({
            "success": false,
            "message": "Wrong user"
        });
    }


});

module.exports = router;