require('dotenv').config();
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose');
const routes = require('./router');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cors())
app.use(cookieParser());
app.use(require('sanitize').middleware);
app.use('/auth', require('./auth.routes'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur MongoDB :', err));

app.use('/potions', routes);

const { swaggerUi, swaggerSpec } = require('./swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});