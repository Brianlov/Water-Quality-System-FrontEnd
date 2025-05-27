// index.js
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT|| 3000;
const Approuter = require('./application');
app.use(express.json());
app.use(Approuter);

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});





