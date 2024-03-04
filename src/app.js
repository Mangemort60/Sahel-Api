const express = require("express");
const app = express();
const authRoutes = require('./api/routes/authRoutes');
const quoteRoutes = require('./api/routes/quoteRoutes');
const reservationRoutes = require('./api/routes/reservationRoutes')

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes)
app.use('/', quoteRoutes)
app.use('/', reservationRoutes)


module.exports = app