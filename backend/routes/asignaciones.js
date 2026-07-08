const { Router } = require('express');
const controller = require('../controllers/asignacionController');

const router = Router();

router.post('/generar-proyectado', controller.generarProyectado);
router.post('/validar', controller.validarAsignacion);
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id/estado', controller.actualizarEstado);
router.delete('/:id', controller.eliminar);

module.exports = router;
