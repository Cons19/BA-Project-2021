/**
* Movie_Language class
*
* @author Paul Panaitescu
* @version 1.0 27 APR 2020
*/

const connection = require("../db/db_connection");
const express = require("express");
const axios = require('axios');
const HOSTNAME = 'localhost';
const PORT = 3006;
let app = express();
app.use(express.json());

// ******************************************************
// ***                                                ***
// ***        Movie_Language CRUD Functionality       ***
// ***                                                ***
// ******************************************************

// TODO: Add if else statements to prevent stoping the server after request failure
// TODO: return the object after it was created

/**
* CREATE new Movie_Language (Attach a Language to a Movie)
*               
* Input:    movieId, languageId
* Output:   the Id of the new Movie_Language
* Errors:   Movie with this ID does not exist!
*           Language with this ID does not exist!
*           Language is already attached to this Movie!
*           The Movie_Language could not be created!
*           Movie_Language with this ID does not exist!
*/
app.post("/movie_language", (req, res) => {
    let movieId = req.body.movieId;
    let languageId = req.body.languageId;
    let sqlGetMovie = `SELECT * FROM movie WHERE id = ?`;
    let sqlGetLanguage = `SELECT * FROM language WHERE id = ?`;
    let sqlAddMovie_Language = `INSERT INTO movie_language(movieId, languageId) VALUES(?, ?)`;

    // Check if there is a Movie with this id
    connection.query(sqlGetMovie, [movieId], function (err, movie) {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!movie.length) {
                res.status(404).json({
                    message: `Movie with this ID (${movieId}) does not exist!`
                });
            }
        }
    });

    // Check if there is a Language with this id
    connection.query(sqlGetLanguage, [languageId], function(err, language) {
        if (err) {
            res.status(400).json({
                error: err
            });
            console.log(err);
        } else {
            if(!language.length) {
                res.status(404).json({
                    message: `Language with this ID (${languageId}) does not exist!`
                });
            }
        }
    });

    // Check if Language is already attached to this Movie
    connection.query(`SELECT COUNT(*) AS total FROM movie_language WHERE movieId = ? AND languageId = ?;` , 
                    [movieId, languageId], function (err, result) {
        console.log('total: ', result[0].total);
        if (result[0].total > 0) {
            res.status(409).json({
                message: 'Language is already attached to this Movie!',
            });
        } else {
            // Add Movie_Language
            connection.query(sqlAddMovie_Language, [movieId, languageId], function (err, result) {
                if (err) {
                    res.status(400).json({
                        message: 'The Movie_Language could not be created!',
                        error: err.message
                    });
                    console.log(err.message);
                } else {
                    console.log(`A new row has been inserted!`);
                    // Get the last inserted Movie_Language
                    axios.get(`http://${HOSTNAME}:${PORT}/movie_language/${result.insertId}`).then(response =>{
                        console.log(response);
                        res.status(201).send(response.data[0]);
                    }).catch(err =>{
                        if(err){
                            console.log(err);
                        }
                        res.status(400).json({
                            message: `Movie_Language with this ID (${result.insertId}) does not exist!`
                        });
                    });
                }
            });
        }
    });
});

/**
* READ all Movie_Languages
*
* Output:   an array with all Movie_Languages and their information,
* Errors:   There are no Movie_Languages in the DB!
*/
app.get("/movie_language", (req, res) => {
    let sql = `SELECT * FROM movie_language`;
    connection.query(sql, function(err, movie_languages) {
        if (err) {
            res.status(400).json({
                message: 'There are no Movie_Languages in the DB!',
                error: err.message
            });
            console.log(err);
        } else {
            res.status(200).send(movie_languages);
        }
    });
});
// ******************************************************
// ***                                                ***
// ***       Movie_Language Extra Functionality       ***
// ***                                                ***
// ******************************************************

// Server connection
app.listen(PORT, HOSTNAME, (err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
    }
});