const { Router } = require('express');
const controller = require('../controllers/turnoConfigController');

const router = Router();

router.get('/', controller.listar);
router.get('/por-objetivo/:id_objetivo', controller.listarPorObjetivo);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;
