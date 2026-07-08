const { Router } = require('express');
const controller = require('../controllers/diagnosticoController');

const router = Router();

router.get('/generacion', controller.verificarGeneracion);

module.exports = router;
