// Requiring express and morgan
const express = require('express'),
    morgan = require('morgan');

const app = express();

// Create an array of top movies
let topMovies = [
    {
        title: 'Big Hero 6',
        director: 'Don Hall & Chris Williams',
        release_date: '2014'
    },
    {
        title: 'Easy A',
        director: 'Will Gluck',
        release_date: '2010'
    },
    {
        title: 'JoJo Rabbit',
        director: 'Taika Waititi',
        release_date: '2019'
    },
    {
        title: 'Brave',
        director: 'Mark Andrews, Brenda Chapman, & Steve Purcell',
        release_date: '2012'
    },
    {
        title: 'Matilda',
        director: 'Danny DeVito',
        release_date: '1996'
    },
    {
        title: 'Martian Child',
        director: 'Menno Meyjes',
        release_date: '2007'
    },
    {
        title: '10 Things I Hate About You',
        director: 'Gil Junger',
        release_date: '1999'
    },
    {
        title: 'The Sixth Sense',
        director: 'M. Night Shyamalan',
        release_date: '1999'
    },
    {
        title: 'My Girl',
        director: 'Howard Zieff',
        release_date: '1991'
    },
    {
        title: 'Elf',
        director: 'Jon Favreau',
        release_date: '2003'
    },
];

// Middleware function to use morgan for loggin
app.use(morgan('common'));
// Middleware function for using public folder for routing to static files
app.use(express.static('public'));
// Error handling function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})

// HTTP GET Requests
app.get('/', (req, res) => {
    res.send('Welcome to my Movie Database!');
});

// Return documetantion page when navigating to the /documentation URL
// app.get('/documentation.html', (req, res) => {
    
// });

// Return my list of top ten movies when navigating to the /movies URL
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

// Listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});