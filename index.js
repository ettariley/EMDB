// Requiring express and morgan
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

const app = express();

// Middleware functions
app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})

// Example user and movie objects for testing
let users = [
    {
        id: 1,
        name: "Etta",
        favoriteMovies: ["Big Hero 6"]
    },
    {
        id: 2,
        name: "Andrew",
        favoriteMovies: []
    },
]

let movies = [
    {
        "Title":"Big Hero 6",
        "Description":"A special bond develops between plus-sized inflatable robot Baymax and prodigy Hiro Hamada, who together team up with a group of friends to form a band of high-tech heroes.",
        "Genre": {
            "Name":"Animation",
            "Description":"An entirely digitally produced movie, instead of filmed with real people."
        },
        "Director": {
            "Name":"Don Hall",
            "Bio":"This is his bio.",
            "Birth Year":1969
        },
        "ImageURL":"this is an image URL",
        "Featured":true
    },
    {
        "Title":"JoJo Rabbit",
        "Description":"A young German boy in the Hitler Youth whose hero and imaginary friend is the country's dictator is shocked to discover that his mother is hiding a Jewish girl in their home.",
        "Genre": {
            "Name":"Comedy",
            "Description":"Funny, humorous, satirical, or lighthearted fiction or non-fiction movies."
        },
        "Director": {
            "Name":"Taika Watiti",
            "Bio":"Taika hails from the Raukokore region of the East Coast of New Zealand. He has been in the film industry for several years as an actor, writer, and director. He is most known for his work directing Thor: Ragnarok (2017) and JoJo Rabbit (2019), for which he won an Oscar for Best Adapted Screenplay.",
            "Birth Year":1975
        },
        "ImageURL":"this is an image URL",
        "Featured":false
    }
]

// READ movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

// READ movie information by title
app.get('/movies/:title', (req, res) => {
    res.status(200).json(movies.find((movie) =>
    { return movie.Title === req.params.title }));
});

// READ genre information by name
app.get('/movies/genre/:genreName', (req, res) => {
    res.status(200).json(movies.find((movie) =>
    { return movie.Genre.Name === req.params.genreName }).Genre);
});

// READ director information by name
app.get('/movies/director/:directorName', (req, res) => {
    res.status(200).json(movies.find((movie) =>
    { return movie.Director.Name === req.params.directorName }).Director);
});

// CREATE user
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (!newUser.name) {
        const message = 'Missing username in request body';
        res.status(400).send(message);
    } else {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    }
});

//UPDATE user name
app.put('/users/:id', (req, res) => {
    const updatedUser = req.body;

    let user = users.find(user => user.id == req.params.id);

    if (!user) {
        res.status(400).send('User does not exists.');
    } else {
        user.name = updatedUser.name;
        res.status(201).send('User name was updated to ' + user.name +'.');
    }
    
});

// CREATE new movie in favorites list
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == req.params.id);

    if (!movieTitle) {
        res.status(400).send('Movie does not exists.');
    } else {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(movieTitle + ' has been added to ' + user.name + '\'s favorites.');
    }
});

// DELETE movie from favorites list
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == req.params.id);

    if (!movieTitle) {
        res.status(400).send('Movie is not in the list.');
    } else {
        user.favoriteMovies = user.favoriteMovies.filter(({ movieTitle }) => movieTitle !== movieTitle);
        res.status(200).send(movieTitle + ' has been removed from ' + user.name + '\'s favorites.');
    }
})

// DELETE User
app.delete('/users/:id', (req, res) => {
    let user = users.find(user => user.id == req.params.id);

    if (!user.id) {
        res.status(400).send('User not found.');
    } else {
        users = users.filter(({ id }) => id !== id);
        res.status(200).send(user.name + ' has been deregistered.');
    }
});

// Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});