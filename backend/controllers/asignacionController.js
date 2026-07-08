const pool = require('../config/db');
const { validar } = require('../services/validadorTurnos');
const { generar } = require('../services/generadorProyectado');

exports.listar = async (req, res) => {
  let sql = `
    SELECT ac.*, v.nombre AS vigilador_nombre, v.legajo,
           p.nombre AS puesto_nombre, o.nombre AS objetivo_nombre,
           tc.nombre AS turno_nombre, tc.hora_inicio, tc.hora_fin, tc.duracion_horas
    FROM asignaciones_cronograma ac
    JOIN vigiladores v ON v.id = ac.id_vigilador
    JOIN requerimientos_mensuales rm ON rm.id = ac.id_requerimiento
    JOIN puestos p ON p.id = rm.id_puesto
    JOIN objetivos o ON o.id = p.id_objetivo
    JOIN turnos_config tc ON tc.id = rm.id_turno_config
  `;
  const params = [];
  const condiciones = [];

  if (req.query.fecha_desde) {
    condiciones.push('ac.fecha_asignacion >= ?');
    params.push(req.query.fecha_desde);
  }
  if (req.query.fecha_hasta) {
    condiciones.push('ac.fecha_asignacion <= ?');
    params.push(req.query.fecha_hasta);
  }
  if (req.query.id_objetivo) {
    condiciones.push('o.id = ?');
    params.push(req.query.id_objetivo);
  }

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }

  sql += ' ORDER BY ac.fecha_asignacion DESC, ac.id';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
};

exports.obtener = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ac.*, v.nombre AS vigilador_nombre, v.legajo,
            p.nombre AS puesto_nombre, o.nombre AS objetivo_nombre,
            tc.nombre AS turno_nombre, tc.hora_inicio, tc.hora_fin
     FROM asignaciones_cronograma ac
     JOIN vigiladores v ON v.id = ac.id_vigilador
     JOIN requerimientos_mensuales rm ON rm.id = ac.id_requerimiento
     JOIN puestos p ON p.id = rm.id_puesto
     JOIN objetivos o ON o.id = p.id_objetivo
     JOIN turnos_config tc ON tc.id = rm.id_turno_config
     WHERE ac.id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Asignación no encontrada' });
  res.json(rows[0]);
};

exports.validarAsignacion = async (req, res) => {
  const { id_requerimiento, id_vigilador } = req.body;
  if (!id_requerimiento || !id_vigilador) {
    return res.status(400).json({ error: 'id_requerimiento y id_vigilador son requeridos' });
  }

  try {
    const [reqRow] = await pool.query('SELECT * FROM requerimientos_mensuales WHERE id = ?', [id_requerimiento]);
    if (reqRow.length === 0) return res.status(404).json({ error: 'Requerimiento no encontrado' });

    const [vigRow] = await pool.query('SELECT * FROM vigiladores WHERE id = ?', [id_vigilador]);
    if (vigRow.length === 0) return res.status(404).json({ error: 'Vigilador no encontrado' });

    const requerimiento = reqRow[0];
    const resultado = await validar({
      idVigilador: id_vigilador,
      fechaAsignacion: requerimiento.fecha,
      idTurnoConfig: requerimiento.id_turno_config,
    });

    res.json({
      es_valido: resultado.es_valido,
      conflictos: resultado.conflictos,
      requerimiento: {
        id: requerimiento.id,
        fecha: requerimiento.fecha,
        id_puesto: requerimiento.id_puesto,
        id_turno_config: requerimiento.id_turno_config,
      },
      vigilador: {
        id: id_vigilador,
        nombre: vigRow[0].nombre,
        legajo: vigRow[0].legajo,
      },
    });
  } catch (err) {
    console.error('Error en validación:', err);
    res.status(500).json({ error: 'Error interno al validar la asignación' });
  }
};

exports.crear = async (req, res) => {
  const { id_requerimiento, id_vigilador, estado } = req.body;
  if (!id_requerimiento || !id_vigilador) {
    return res.status(400).json({ error: 'id_requerimiento y id_vigilador son requeridos' });
  }

  try {
    const [reqRow] = await pool.query('SELECT * FROM requerimientos_mensuales WHERE id = ?', [id_requerimiento]);
    if (reqRow.length === 0) return res.status(404).json({ error: 'Requerimiento no encontrado' });

    const requerimiento = reqRow[0];

    const resultado = await validar({
      idVigilador: id_vigilador,
      fechaAsignacion: requerimiento.fecha,
      idTurnoConfig: requerimiento.id_turno_config,
    });

    const estadoFinal = estado || (resultado.es_valido ? 'pendiente' : 'conflicto');

    const [result] = await pool.query(
      'INSERT INTO asignaciones_cronograma (id_requerimiento, id_vigilador, fecha_asignacion, estado) VALUES (?, ?, ?, ?)',
      [id_requerimiento, id_vigilador, requerimiento.fecha, estadoFinal]
    );

    res.status(201).json({
      id: result.insertId,
      id_requerimiento,
      id_vigilador,
      fecha_asignacion: requerimiento.fecha,
      estado: estadoFinal,
      validacion: resultado,
    });
  } catch (err) {
    console.error('Error al crear asignación:', err);
    res.status(500).json({ error: 'Error interno al crear la asignación' });
  }
};

exports.actualizarEstado = async (req, res) => {
  const { estado } = req.body;
  if (!estado) return res.status(400).json({ error: 'estado es requerido' });

  const estadosValidos = ['pendiente', 'confirmado', 'conflicto', 'cancelado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Use: ${estadosValidos.join(', ')}` });
  }

  const [result] = await pool.query('UPDATE asignaciones_cronograma SET estado = ? WHERE id = ?', [estado, req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Asignación no encontrada' });
  res.json({ id: parseInt(req.params.id), estado });
};

exports.generarProyectado = async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.body;

  if (!fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: 'fecha_inicio y fecha_fin son requeridos' });
  }

  try {
    const resultado = await generar({ fechaInicio: fecha_inicio, fechaFin: fecha_fin });

    res.json({
      mensaje: `Generación completada. ${resultado.asignaciones_creadas} asignaciones creadas, ${resultado.puestos_descubiertos} puestos sin cubrir.`,
      ...resultado,
    });
  } catch (err) {
    console.error('Error en generación proyectada:', err);
    res.status(500).json({ error: 'Error interno al generar el proyectado' });
  }
};

exports.eliminar = async (req, res) => {
  const [result] = await pool.query('DELETE FROM asignaciones_cronograma WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Asignación no encontrada' });
  res.json({ mensaje: 'Asignación eliminada correctamente' });
};
