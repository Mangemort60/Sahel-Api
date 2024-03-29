require('dotenv').config();
const express = require("express");
const cors = require('cors');
const app = express();
const authRoutes = require('./api/routes/authRoutes');
const quoteRoutes = require('./api/routes/quoteRoutes');
const paymentRoutes = require('./api/routes/paymentRoutes')
const reservationRoutes = require('./api/routes/reservationRoutes')

app.use(express.json());
app.use(cors());

console.log(process.env.STRIPE_SECRET_KEY)

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes)
app.use('/', quoteRoutes)
app.use('/', reservationRoutes)
app.use('/', paymentRoutes)
app.use('/auth', authRoutes)


module.exports = app