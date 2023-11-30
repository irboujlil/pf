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
    origin: '*' // or '*' for allowing all origins
}));
app.use(express.static('./dist/angular-heroku'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', {root: 'dist/angular-heroku/'}),
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
