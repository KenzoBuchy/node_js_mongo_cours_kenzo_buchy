const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de gestion des potions',
            version: '1.0.0',
            description: 'Documentation de l’API pour la gestion des potions',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./router.js', './auth.routes.js'], // Fichier contenant les routes avec les commentaires Swagger
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };