function requireHTTPS(req, res, next) {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

const express = require('express');
const cors = require('cors');
const app = express();

app.use(requireHTTPS);
app.use(cors({
    origin: 'https://pocket-pf-test-3c2c45652b6a.herokuapp.com' // or '*' for allowing all origins
}));
app.use(express.static('./dist/angular-heroku'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', {root: 'dist/angular-heroku/'}),
);

app.listen(process.env.PORT || 8080);
