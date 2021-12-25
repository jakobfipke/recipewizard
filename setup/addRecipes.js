const mysql = require('mysql');
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
            if (err) {
                reject(new Error());
            } else {
                resolve(result);
            }
        });
    });
}

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