require('dotenv').config();
const express = require("express");
const cors = require('cors');
const app = express();
const authRoutes = require('./api/routes/authRoutes');
const quoteRoutes = require('./api/routes/quoteRoutes');
const paymentRoutes = require('./api/routes/paymentRoutes')
const reservationRoutes = require('./api/routes/reservationRoutes');
const chatRoutes = require('./api/routes/chatRoutes')

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:4173','http://localhost:5173', 'https://sahel-back-286afc7b2555.herokuapp.com', 'https://sahel-26e16.web.app' ], // Ajoutez vos domaines frontend ici
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes)
app.use('/', quoteRoutes)
app.use('/', reservationRoutes)
app.use('/', paymentRoutes)
app.use('/auth', authRoutes)
app.use('/', chatRoutes)


module.exports = app