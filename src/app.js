const express = require("express");
const app = express();
const authRoutes = require('./api/routes/authRoutes');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes)

module.exports = app