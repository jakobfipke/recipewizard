const mysql = require('mysql');
const q = require('../constants/database');
const s = require('../constants/sampleData');
require('dotenv').config({path: '../.env'});

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

con.connect((err) => {
  if (err) console.log(err.message);
  console.log("Connected!");
});

con.promise = (sql) => {
  return new Promise((resolve, reject) => {
    con.query(sql, (err, result) => {
      if (err) { reject(new Error()); }
      else { resolve(result); }
    });
  });
}

Object.values(q.tables).forEach(table => {
  let sql = `DROP TABLE ${table};`;
  con.promise(sql)
  .then(result => {
    console.log(`${table} table dropped.`);
  })
  .catch(error => {
    console.log(error.message);
  })
});

//####################################################################
// Create User table.
//####################################################################
con.query(q.createUserTableQuery, (err, _) => {
  if (err) console.log(err.message);
  console.log('User table created.');
});

//####################################################################
// Create UserIngredient table.
//####################################################################
con.query(q.createUserIngredientTableQuery, (err, _) => {
  if (err) console.log(err.message);
  console.log('UserIngredient table created.');
});

//####################################################################
// Create Recipe table.
//####################################################################
con.query(q.createRecipeTableQuery, (err, _) => {
  if (err) console.log(err.message);
  console.log('Recipe table created.');
});

//####################################################################
// Create RecipeIngredient table.
//####################################################################
con.query(q.createRecipeIngredientTableQuery, (err, _) => {
  if (err) console.log(err.message);
  console.log('RecipeIngredient table created.');
});

//####################################################################
// Create Instruction table.
//####################################################################
con.query(q.createInstructionTableQuery, (err, _) => {
  if (err) console.log(err.message);
  console.log('Instruction table created.');
});

//####################################################################
// Create SavedRecipe table. 
//####################################################################
con.query(q.createSavedRecipeTableQuery, (err, _) => {
  if (err) console.log(err.message);
  console.log('SavedRecipe table created.');
});


s.forEach(r => {
  let sqlInsertRecipe = `INSERT INTO Recipe (Title, Description) VALUES ("${r.title}", "${r.description}");`;
  con.promise(sqlInsertRecipe)
  .then(result => {
    console.log(`${r.title} added.`);
    const id = result.insertId;
    r.ingredients.forEach(i => {
      let sqlInsertIngredient = [
        'INSERT INTO RecipeIngredient (Name, Optional, Amount, Description, RecipeId)',
        `VALUES ("${i.name}",${i.optional},"${i.amount}","${i.description}",${id})`
      ].join(' ');
      con.promise(sqlInsertIngredient)
      .then(result => {
        console.log(`${i.name} added.`);
      })
      .catch(error => {
        console.log(error.message);
      });
    });
    r.instructions.forEach(i => {
      let sqlInsertInstruction = [
        'INSERT INTO Instruction (Step, Title, Details, RecipeId)',
        `VALUES (${i.step},"${i.title}","${i.details}",${id})`
      ].join(' ');
      con.promise(sqlInsertInstruction)
      .then(result => {
        console.log(`Instruction ${i.step} added.`);
      })
      .catch(error => {
        console.log(error.message);
      });
    });
  })
  .catch(error => {
    console.log(JSON.stringify(error, null, 1));
  })
});

