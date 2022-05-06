// Module Imports
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    cors = require('cors'),
    { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

// Connecting Mongoose to DB
// mongoose.connect('mongodb://localhost:27017/EMDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


// Middleware functions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(express.static('public'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})
app.use(cors()); // Allows requests from all origins

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// READ movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ movie information by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ genre information by name
app.get('/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name })
        .then((movie) => {
            res.json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ director information by name
app.get('/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ user info
app.get('/userdata/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// CREATE user
app.post('/users', 
     // Validation logic here for request
    [
        check('Username', 'Username is required and must be at least 5 characters').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {

        // Check validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
    
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Check if user exists
        .then((user) => {
            if (user) {
                // If found, send response that user already exists
                return res.status(400).send(req.body.Username + ' already exists.');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {res.status(201).json(user) })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

//UPDATE user name
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), 
    [
        check('Username', 'Username is required and must be at least 5 characters').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail(),
    ],(req, res) => {
    
        // Check validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
    
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
        {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
        }
    },
    { new: true },
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });    
});

// CREATE new movie in favorites list
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true },
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

// DELETE movie from favorites list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true },
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
})

// DELETE User
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});