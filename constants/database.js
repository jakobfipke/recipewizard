const tables = {
  USER_INGREDIENT: "UserIngredient",
  RECIPE_INGREDIENT: "RecipeIngredient",
  INSTRUCTION: "Instruction",
  SAVED_RECIPE: "SavedRecipe",
  USER: "User",
  RECIPE: "Recipe",
}

exports.tables = tables;

// Create User table query
exports.createUserTableQuery = [
  `CREATE TABLE IF NOT EXISTS ${tables.USER}`,
  '(Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,',
  'Email VARCHAR(80) NOT NULL,',
  'Token VARCHAR(250) NULL,',
  'Password VARCHAR(100) NOT NULL);'
].join(' ');

// Create UserIngredient table query
exports.createUserIngredientTableQuery = [
  `CREATE TABLE IF NOT EXISTS ${tables.USER_INGREDIENT}`,
  '(Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,',
  'Name VARCHAR(50) NOT NULL,',
  'UserId INT NOT NULL,',
  'FOREIGN KEY (UserId) REFERENCES User(Id));'
].join(' ');

// Create Recipe table query
exports.createRecipeTableQuery = [
  `CREATE TABLE IF NOT EXISTS ${tables.RECIPE}`,
  '(Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,',
  'Title VARCHAR(100) NOT NULL,',
  'Description VARCHAR(500) NULL DEFAULT "");'
].join(' ');

// Create RecipeIngredient table query
exports.createRecipeIngredientTableQuery = [
  `CREATE TABLE IF NOT EXISTS ${tables.RECIPE_INGREDIENT}`,
  '(Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,',
  'Name VARCHAR(100) NOT NULL,',
  'Optional BOOLEAN NOT NULL DEFAULT FALSE,',
  'Amount VARCHAR(20) DEFAULT "",',
  'Description VARCHAR(200) NULL DEFAULT "",',
  'RecipeId INT NOT NULL,',
  'FOREIGN KEY (RecipeId) REFERENCES Recipe(Id));'
].join(' ');

// Create Instruction table query
exports.createInstructionTableQuery = [
  `CREATE TABLE IF NOT EXISTS ${tables.INSTRUCTION}`,
  '(Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,',
  'Step INT NOT NULL,',
  'Title VARCHAR(200) NOT NULL,',
  'Details VARCHAR(500) NOT NULL,',
  'RecipeId INT NOT NULL,',
  'FOREIGN KEY (RecipeId) REFERENCES Recipe(Id));'
].join(' ');

// Create SavedRecipe table query
exports.createSavedRecipeTableQuery = [
  `CREATE TABLE IF NOT EXISTS ${tables.SAVED_RECIPE}`,
  '(Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,',
  'RecipeId INT NOT NULL,',
  'UserId INT NOT NULL,',
  'FOREIGN KEY (RecipeId) REFERENCES Recipe(Id),',
  'FOREIGN KEY (UserId) REFERENCES User(Id));'
].join(' ');
