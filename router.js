const express = require('express');
const router = express.Router();
const Potion = require('./potion.model');
const authMiddleware = require('./auth.middleware');
router.use(authMiddleware);

/**
 * @swagger
 * /potions:
 *   get:
 *     summary: Récupérer toutes les potions
 *     description: Renvoie la liste de toutes les potions disponibles dans la base de données.
 *     responses:
 *       200:
 *         description: Succès - Retourne la liste des potions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Identifiant unique de la potion.
 *                   name:
 *                     type: string
 *                     description: Nom de la potion.
 *                   effect:
 *                     type: string
 *                     description: Effet de la potion.
 *       400:
 *         description: Erreur lors de la récupération des potions.
 */
router.get('/', async (req, res) => {
    try {
        const potions = await Potion.find();
        res.status(200).json(potions);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions/{id}:
 *   get:
 *     summary: Récupérer une potion par son ID
 *     description: Retourne les détails d'une potion spécifique en fonction de son identifiant unique.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'identifiant unique de la potion.
 *     responses:
 *       200:
 *         description: Succès - Retourne la potion demandée.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Identifiant unique de la potion.
 *                 name:
 *                   type: string
 *                   description: Nom de la potion.
 *                 effect:
 *                   type: string
 *                   description: Effet de la potion.
 *       404:
 *         description: Potion non trouvée.
 *       400:
 *         description: Erreur lors de la récupération de la potion.
 */
router.get('/potions/:id', async (req, res) => {
    try {
        const potion = await Potion.findById(req.params.id);
        if (!potion) return res.status(404).json({ error: 'Potion non trouvée' });
        res.json(potion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


/**
 * @swagger
 * /names:
 *   get:
 *     summary: Récupérer les noms de toutes les potions
 *     description: Renvoie uniquement les noms des potions disponibles sous forme d'un tableau de chaînes de caractères.
 *     responses:
 *       200:
 *         description: Succès - Retourne la liste des noms des potions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 description: Nom de la potion.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/names', async (req, res) => {
    try {
        const names = await Potion.find({}, 'name'); 
        res.json(names.map(p => p.name)); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * @swagger
 * /vendors:
 *   get:
 *     summary: Récupérer les identifiants des vendeurs
 *     description: Renvoie uniquement les identifiants des vendeurs associés aux potions sous forme d'un tableau de chaînes de caractères.
 *     responses:
 *       200:
 *         description: Succès - Retourne la liste des identifiants des vendeurs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 description: Identifiant du vendeur.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/vendors', async (req, res) => {
    try {
        const names = await Potion.find({}, 'vendor_id'); // On ne sélectionne que le champ 'vendor_id'
        res.json(names.map(p => p.vendor_id)); // renvoyer juste un tableau de strings
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * @swagger
 * /potions/vendor/{vendor_id}:
 *   get:
 *     summary: Récupérer toutes les potions d'un vendeur
 *     description: Renvoie la liste des potions vendues par un vendeur spécifique.
 *     parameters:
 *       - in: path
 *         name: vendor_id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'identifiant unique du vendeur.
 *     responses:
 *       200:
 *         description: Succès - Retourne la liste des potions du vendeur.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Identifiant unique de la potion.
 *                   name:
 *                     type: string
 *                     description: Nom de la potion.
 *                   effect:
 *                     type: string
 *                     description: Effet de la potion.
 *                   vendor_id:
 *                     type: string
 *                     description: Identifiant du vendeur.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/vendor/:vendor_id', async (req, res) => {
    console.log(req.params.vendor_id);
    try {
        const potions = await Potion.find({ vendor_id: req.params.vendor_id });
        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /potions/price-range:
 *   get:
 *     summary: Récupérer les potions dans une fourchette de prix
 *     description: Renvoie la liste des potions dont le prix est compris entre un minimum et un maximum donnés.
 *     parameters:
 *       - in: query
 *         name: min
 *         required: true
 *         schema:
 *           type: number
 *         description: Prix minimum de la potion.
 *       - in: query
 *         name: max
 *         required: true
 *         schema:
 *           type: number
 *         description: Prix maximum de la potion.
 *     responses:
 *       200:
 *         description: Succès - Retourne la liste des potions dans la plage de prix demandée.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Identifiant unique de la potion.
 *                   name:
 *                     type: string
 *                     description: Nom de la potion.
 *                   price:
 *                     type: number
 *                     description: Prix de la potion.
 *       400:
 *         description: Paramètres min et max invalides ou manquants.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/price-range', async (req, res) => {
    const { min, max } = req.query;

    // Vérification des paramètres
    if (!min || !max || isNaN(min) || isNaN(max)) {
        return res.status(400).json({ error: "Les paramètres 'min' et 'max' doivent être des nombres valides." });
    }

    try {
        const potions = await Potion.find({ price: { $gte: Number(min), $lte: Number(max) } });
        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /analytics/distinct-categories:
 *   get:
 *     summary: Récupérer le nombre total de catégories distinctes
 *     description: Effectue une agrégation pour compter le nombre total de catégories différentes dans la collection des potions.
 *     responses:
 *       200:
 *         description: Succès - Retourne le nombre total de catégories distinctes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombreCategories:
 *                   type: number
 *                   description: Nombre total de catégories uniques trouvées.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/analytics/distinct-categories', async (req, res) => {
    try {
        const potions = await Potion.aggregate([
            { $unwind: "$categories" },  // Sépare les tableaux de catégories en éléments distincts
            { $group: { _id: "$categories" } },  // Regroupe par catégorie unique
            { $count: "nombreCategories" }  // Compte le nombre total de catégories distinctes
        ]);
        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /analytics/average-score-by-vendor:
 *   get:
 *     summary: Récupérer le score moyen des vendeurs
 *     description: Effectue une agrégation pour calculer le score moyen de chaque vendeur en fonction des potions qu'il vend.
 *     responses:
 *       200:
 *         description: Succès - Retourne un tableau des scores moyens des vendeurs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Identifiant du vendeur.
 *                   averageScore:
 *                     type: number
 *                     description: Score moyen des potions d'un vendeur.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/analytics/average-score-by-vendor', async (req, res) => {
    try {
        const potions = await Potion.aggregate([
            { $group: { _id: "$vendor_id", averageScore: { $avg: "$score" } } }  // Agrégation pour calculer le score moyen par vendeur
        ]);
        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /analytics/average-score-by-category:
 *   get:
 *     summary: Récupérer le score moyen par catégorie
 *     description: Effectue une agrégation pour calculer le score moyen des potions pour chaque catégorie.
 *     responses:
 *       200:
 *         description: Succès - Retourne un tableau des scores moyens par catégorie.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Nom de la catégorie.
 *                   averageScore:
 *                     type: number
 *                     description: Score moyen des potions dans la catégorie.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/analytics/average-score-by-category', async (req, res) => {
    try {
        const potions = await Potion.aggregate([
            { $unwind: "$categories" },  // Sépare les catégories de chaque potion
            { $group: { _id: "$categories", averageScore: { $avg: "$score" } } }  // Agrège par catégorie et calcule la moyenne du score
        ]);
        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /analytics/strength-flavor-ratio:
 *   get:
 *     summary: Récupérer le ratio entre force et parfum des potions
 *     description: Calcule le ratio entre la force (`strength`) et le parfum (`flavor`) des potions.
 *     responses:
 *       200:
 *         description: Succès - Retourne un tableau avec les ratios calculés.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ratio:
 *                     type: number
 *                     description: Le ratio entre la force et le parfum d'une potion.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/analytics/strength-flavor-ratio', async (req, res) => {
    try {
        const potions = await Potion.aggregate([
            { $project: { ratio: { $divide: ["$ratings.strength", "$ratings.flavor"] } } }  // Calcul du ratio entre force et parfum
        ]);
        res.json(potions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /analytics/search:
 *   get:
 *     summary: Effectuer une recherche agrégée avec des paramètres dynamiques
 *     description: Permet de regrouper les données par vendeur ou catégorie et de calculer différentes métriques (moyenne, somme, ou comptage) sur un champ spécifié (score, prix, etc.).
 *     parameters:
 *       - in: query
 *         name: group
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['vendor_id', 'categories']
 *         description: |
 *           Critère pour grouper les données. Peut être par vendeur ("vendor_id") ou par catégorie ("categories").
 *       - in: query
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['avg', 'sum', 'count']
 *         description: |
 *           Métrique à appliquer : "avg" pour la moyenne, "sum" pour la somme, ou "count" pour le comptage.
 *       - in: query
 *         name: champ
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['score', 'price']
 *         description: |
 *           Le champ sur lequel appliquer la métrique ("score", "price").
 *     responses:
 *       200:
 *         description: Succès - Retourne le résultat de l'agrégation selon les paramètres fournis.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Identifiant du groupe (par vendeur ou catégorie).
 *                   value:
 *                     type: number
 *                     description: Valeur de la métrique calculée (moyenne, somme, ou comptage).
 *       400:
 *         description: Paramètres invalides - Les paramètres de requête ne sont pas valides.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/analytics/search', async (req, res) => {
    try {
        let { group, metric, champ } = req.query;

        // Vérification des paramètres
        const validGroups = ['vendor_id', 'categories'];
        const validMetrics = ['avg', 'sum', 'count'];
        const validChamps = ['score', 'price'];

        if (!validGroups.includes(group) || !validMetrics.includes(metric) || !validChamps.includes(champ)) {
            return res.status(400).json({ error: 'Paramètres invalides' });
        }

        let aggregation = [];

        // Si on groupe par categories, il faut utiliser $unwind
        if (group === 'categories') {
            aggregation.push({ $unwind: `$${group}` });
        }

        if (metric === 'count') {
            aggregation.push({
                $group: {
                    _id: `$${group}`,
                    count: { $sum: 1 }
                }
            });
        } else if (metric === 'sum') {
            aggregation.push({
                $group: {
                    _id: `$${group}`,
                    total: { $sum: `$${champ}` }
                }
            });
        } else if (metric === 'avg') {
            aggregation.push({
                $group: {
                    _id: `$${group}`,
                    average: { $avg: `$${champ}` }
                }
            });
        }

        const result = await Potion.aggregate(aggregation);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;