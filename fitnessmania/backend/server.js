require('dotenv').config();

const http = require('http');

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.use((req, res, next) => {
    const username = "admin"; 
    const password = "password"; // hard coded password
    if (req.headers.authorization == `Basic ${btoa(username + ":" + password)}`) {
        return next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm="Everything"');
        res.status(401).send('Authentication required.');
    }

    // TODO: hash password instead of storing as text
});

app.get('/', (req, res) => {
    res.send('Hello World - the backend');
});

const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

