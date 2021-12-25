// keeps track of how many requests were made to each endpoint
// note: this resets every time the server is restarted

let variables = {
    "update_password_put": [0,"/users/:id", "PUT"],
    "all_users_get": [0, "/users", "GET"],
    "user_id_get": [0, "/users/:id", "GET"],
    "all_user_ingredients_get": [0, "/users/:id/ingredients", "GET"],
    "single_user_ingredient_get": [0, "/users/:id/ingredients/:id2", "GET"],
    "single_user_ingredient_post": [0, "/users/:id/ingredients", "POST"],
    "list_user_ingredients_post": [0, "/users/:id/batch", "POST"],
    "user_ingredient_by_id_delete": [0, "/users/:id/ingredients/:id2", "DELETE"],
    "user_saved_recipes_get": [0, "/users/:id/recipes", "GET"],
    "single_user_saved_recipe_get": [0, "/users/:id/recipes/:id2"," GET"],
    "save_recipe_by_id_post": [0, "/users/:id/recipes", "POST"],
    "saved_recipe_delete": [0, "/users/:id/recipes/:id2", "DELETE"],
    "suggested_recipe_get": [0, "/users/:id/suggested", "GET"],

    "create_new_user_post": [0, "/register", "POST"],

    "all_recipes_get": [0, "/recipes", "GET"],
    "one_recipe_get": [0, "/recipes/:id", "GET"],
    "recipe_post": [0,"/recipes", "POST"],
    "login_post": [0, "/login", "POST"]
}

exports.variables = variables;






