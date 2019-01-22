const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = 3000;

const staticPath = path.join(__dirname, './build/')

app.use(express.static(staticPath));

app.get('/test', (req, res) => {
  return res.send(`App listening...`);
});

app.use((err, req, res, next) => {
  console.error(err);
  const text = `
    ${Date.now().toString}: Request from ${req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown client'} encountered an error. Details:\n\t${err}
  `;
  fs.writeFile('./temp.txt', text, (err, data) => {
    if (err) console.log('writeFile error: ', err);
});
  return res.status(500).send(err);
});

app.listen(PORT, console.log(`Listening on internal port ${PORT}. Static directory: ${staticPath}`));