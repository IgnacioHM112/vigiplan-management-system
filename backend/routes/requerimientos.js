const { Router } = require('express');
const controller = require('../controllers/requerimientoController');

const router = Router();

router.post('/generar-mensual', controller.generarMensual);
router.get('/', controller.listar);
router.get('/por-puesto/:id_puesto', controller.listarPorPuesto);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;
