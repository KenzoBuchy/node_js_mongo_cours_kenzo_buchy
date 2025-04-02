const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = process.env.COOKIE_NAME || 'demo_node+mongo_token';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Enregistrement d'un utilisateur
 *     description: Crée un nouvel utilisateur après validation et nettoyage des entrées.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur de l'utilisateur.
 *                 example: 'john_doe'
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur.
 *                 example: 'password123'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès.
 *       400:
 *         description: Erreurs de validation des entrées, les champs ne sont pas valides.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Le message d'erreur de validation.
 *       500:
 *         description: Erreur interne du serveur, par exemple si le nom d'utilisateur est déjà pris.
 */
router.post('/register', [
    body('username').trim().escape()
      .notEmpty().withMessage('Le nom d’utilisateur est requis.')
      .isLength({ min: 3, max: 30 }).withMessage('Doit faire entre 3 et 30 caractères.'),
    body('password').trim().escape()
      .notEmpty().withMessage('Le mot de passe est requis.')
      .isLength({ min: 6 }).withMessage('Minimum 6 caractères.')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, password } = req.body;
  
    try {
        const user = await User.create({ username, password });
      console.log(user);
      res.status(201).json({ message: 'Utilisateur créé' });
    } catch (err) {
      if (err.code === 11000) return res.status(500).json({ error: err.message });
      res.status(400).json({ error: err.message });
    }
  });

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion de l'utilisateur
 *     description: Permet à l'utilisateur de se connecter avec un nom d'utilisateur et un mot de passe, et retourne un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur de l'utilisateur.
 *                 example: 'john_doe'
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur.
 *                 example: 'password123'
 *     responses:
 *       200:
 *         description: Connexion réussie, renvoie un message et un cookie avec le token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Connecté avec succès'
 *                 COOKIE_NAME:
 *                   type: string
 *                   example: 'auth_token'
 *       401:
 *         description: Identifiants invalides.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Identifiants invalides'
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Erreur du serveur'
 */
router.post('/login', async (req, res) => {
    // toujours passer les inputs user au sanitize()
    const { username, password } = req.body;
    console.log(username, password);

    const user = await User.findOne({ username });
    console.log(user);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
  
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // à mettre sur true en prod (https)
      maxAge: 24 * 60 * 60 * 1000 // durée de vie 24h
    });
  
    res.json({ message: 'Connecté avec succès', COOKIE_NAME : COOKIE_NAME });
  });
  
  /**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Déconnexion de l'utilisateur
 *     description: Permet à l'utilisateur de se déconnecter en supprimant le cookie contenant le token JWT.
 *     responses:
 *       200:
 *         description: Déconnexion réussie, le cookie est supprimé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Déconnecté'
 */
  router.get('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ message: 'Déconnecté' });
  });
  
  module.exports = router;