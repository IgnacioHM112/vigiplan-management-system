const pool = require('../config/db');

function calcularDuracion(horaInicio, horaFin) {
  const [hI, mI] = horaInicio.split(':').map(Number);
  const [hF, mF] = horaFin.split(':').map(Number);
  const inicioMin = hI * 60 + mI;
  let finMin = hF * 60 + mF;
  if (finMin <= inicioMin) finMin += 24 * 60;
  return Number(((finMin - inicioMin) / 60).toFixed(2));
}

exports.listar = async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT t.*, o.nombre AS objetivo_nombre
     FROM turnos_config t
     JOIN objetivos o ON o.id = t.id_objetivo
     ORDER BY t.id`
  );
  res.json(rows);
};

exports.listarPorObjetivo = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.*, o.nombre AS objetivo_nombre
     FROM turnos_config t
     JOIN objetivos o ON o.id = t.id_objetivo
     WHERE t.id_objetivo = ?
     ORDER BY t.id`,
    [req.params.id_objetivo]
  );
  res.json(rows);
};

exports.obtener = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.*, o.nombre AS objetivo_nombre
     FROM turnos_config t
     JOIN objetivos o ON o.id = t.id_objetivo
     WHERE t.id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Turno no encontrado' });
  res.json(rows[0]);
};

exports.crear = async (req, res) => {
  const { id_objetivo, nombre, hora_inicio, hora_fin, duracion_horas } = req.body;
  if (!id_objetivo || !nombre || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'id_objetivo, nombre, hora_inicio y hora_fin son requeridos' });
  }
  const horas = (duracion_horas != null && duracion_horas !== '') ? Number(duracion_horas) : calcularDuracion(hora_inicio, hora_fin);
  const [result] = await pool.query(
    'INSERT INTO turnos_config (id_objetivo, nombre, hora_inicio, hora_fin, duracion_horas) VALUES (?, ?, ?, ?, ?)',
    [id_objetivo, nombre, hora_inicio, hora_fin, horas]
  );
  res.status(201).json({ id: result.insertId, id_objetivo, nombre, hora_inicio, hora_fin, duracion_horas: horas });
};

exports.actualizar = async (req, res) => {
  const { id_objetivo, nombre, hora_inicio, hora_fin, duracion_horas } = req.body;
  if (!id_objetivo || !nombre || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'id_objetivo, nombre, hora_inicio y hora_fin son requeridos' });
  }
  const horas = (duracion_horas != null && duracion_horas !== '') ? Number(duracion_horas) : calcularDuracion(hora_inicio, hora_fin);
  const [result] = await pool.query(
    'UPDATE turnos_config SET id_objetivo = ?, nombre = ?, hora_inicio = ?, hora_fin = ?, duracion_horas = ? WHERE id = ?',
    [id_objetivo, nombre, hora_inicio, hora_fin, horas, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Turno no encontrado' });
  res.json({ id: parseInt(req.params.id), id_objetivo, nombre, hora_inicio, hora_fin, duracion_horas: Number(horas) });
};

exports.eliminar = async (req, res) => {
  const [result] = await pool.query('DELETE FROM turnos_config WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Turno no encontrado' });
  res.json({ mensaje: 'Turno eliminado correctamente' });
};
