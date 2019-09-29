const express = require('express');
const router = express.Router();
const auth = require('../controllers/AuthController');
const proyect = require('../controllers/ProyectoController');

// Login routes
router.get('/singUp', auth.singUp);
router.post('/logIn', auth.logIn);
router.get('/logOut', auth.logOut);
router.get('/verify', auth.verify);

// Proyecto routes
// router.get('/crear', proyect.crear);

module.exports = router;