const connection = require("../db/db_connection");
const createdAt = require("./functions/createdAt");
const express = require("express");
const bcrypt = require('bcrypt');
const axios = require('axios');
const HOSTNAME = 'localhost';
const PORT = 5000;
let app = express();
app.use(express.json());

// CREATE Admin User
app.post("/admin", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let hashedPassword = bcrypt.hashSync(password, 10);
    let stmt = `INSERT INTO admin(username, password, createdAt) VALUES(?, ?, ?);`;

    connection.query(stmt, [username, hashedPassword, createdAt], function (err, result) {
        if (err) {
            res.status(400).json({
                message: 'The admin user could not be created!',
                error: err.message
            });
            console.log(err);
        } else {
            console.log("A new admin user record inserted, ID: " + result.insertId );
            axios.get(`http://${HOSTNAME}:${PORT}/admin/${result.insertId}`).then(response =>{
                res.status(201).send(response.data);
            }).catch(err =>{
                if(err){
                    console.log(err);
                }
                res.status(400).json({
                    message: `There is no User with the id ${result.insertId}`
                });
            });
        }
    });
});

// Login Admin User
app.post("/admin/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let stmt = `SELECT * FROM admin`;

    connection.query(stmt, function (err, results) {
        if (err) {
            res.status(400).json({
                message: 'The admin users could not be showed!',
                error: err.message
            });
            console.log(err);
        } else {
            let isFound = false;
            results.forEach((result) => {
                if (username === result.username) {
                    isFound = true;
                    let passwordMatch = bcrypt.compareSync(password, result.password);
                    if (passwordMatch) {
                        res.status(200).json({
                            message: "Successful!",
                            adminUser: result
                        });
                    } else {
                        res.status(403).json({
                            message: "Wrong password!"
                        });
                    }
                }
            });
            if (!isFound) {
                res.status(404).json({
                    message: "No admin user found with that username!"
                });
            }
        }
    });
});

// READ All Admin Users
app.get("/admin", (req, res) => {
    let stmt = `SELECT * FROM admin`;
    connection.query(stmt, function (err, results) {
        if (err) {
            res.status(400).json({
                message: 'The admin users could not be showed!',
                error: err.message
            });
            console.log(err);
        } else {
            res.status(200).send(results);
        }
    });
});

// READ One Admin User
app.get("/admin/:id", (req, res) => {
    let stmt = `SELECT * FROM admin WHERE id = ?`;
    connection.query(stmt, [req.params.id], function (err, result) {
        if (err) {
            res.status(400).json({
                message: 'The admin user could not be showed!',
                error: err.message
            });
            console.log(err);
        } else {
            if(result.length) {
                res.status(200).send(result[0]);
            } else {
                res.status(404).json({
                    message: `No admin user found with the id ${req.params.id}!`
                });
            }
        }
    });
});

// Update Admin User
app.put("/admin/:id", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let hashedPassword = bcrypt.hashSync(password, 10);
    let getOneStmt = `SELECT * FROM admin WHERE id = ?`;
    let updateStmt = `UPDATE admin SET username = ?, password = ? WHERE id = ?`;
    connection.query(getOneStmt, [req.params.id], function (err, result) {
        if (err) {
            res.status(400).json({
                message: 'The admin user could not be showed!',
                error: err.message
            });
            console.log(err);
        } else {
            if(result.length) {
                connection.query(updateStmt, [username, hashedPassword, req.params.id], function (err, result) {
                    if (err) {
                        res.status(400).json({
                            message: 'The admin user could not be updated!',
                            error: err.message
                        });
                        console.log(err);
                    } else {
                        res.sendStatus(204);
                    }
                });
            } else {
                res.status(404).json({
                    message: `No admin user found with the id ${req.params.id}!`
                });
            }
        }
    });
});

// Delete Admin User
app.delete("/admin/:id", (req, res) => {
    let getOneStmt = `SELECT * FROM admin WHERE id = ?`;
    let deleteStmt = `DELETE FROM admin WHERE id = ?`;
    connection.query(getOneStmt, [req.params.id], function (err, result) {
        if (err) {
            res.status(400).json({
                message: 'The admin user could not be showed!',
                error: err.message
            });
            console.log(err);
        } else {
            if(result.length) {
                connection.query(deleteStmt, [req.params.id], function (err, result) {
                    if (err) {
                        res.status(400).json({
                            message: 'The admin user could not be updated!',
                            error: err.message
                        });
                        console.log(err);
                    } else {
                        res.sendStatus(204);
                    }
                });
            } else {
                res.status(404).json({
                    message: `No admin user found with the id ${req.params.id}!`
                });
            }
        }
    });
});

app.listen(PORT, HOSTNAME, (err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
    }
});
