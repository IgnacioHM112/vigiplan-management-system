const pool = require('../config/db');

exports.listar = async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, o.nombre AS objetivo_nombre
     FROM puestos p
     JOIN objetivos o ON o.id = p.id_objetivo
     ORDER BY p.id`
  );
  res.json(rows);
};

exports.listarPorObjetivo = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, o.nombre AS objetivo_nombre
     FROM puestos p
     JOIN objetivos o ON o.id = p.id_objetivo
     WHERE p.id_objetivo = ?
     ORDER BY p.id`,
    [req.params.id_objetivo]
  );
  res.json(rows);
};

exports.obtener = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, o.nombre AS objetivo_nombre
     FROM puestos p
     JOIN objetivos o ON o.id = p.id_objetivo
     WHERE p.id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Puesto no encontrado' });
  res.json(rows[0]);
};

exports.crear = async (req, res) => {
  const { id_objetivo, nombre } = req.body;
  if (!id_objetivo || !nombre) return res.status(400).json({ error: 'id_objetivo y nombre son requeridos' });
  const [result] = await pool.query('INSERT INTO puestos (id_objetivo, nombre) VALUES (?, ?)', [id_objetivo, nombre]);
  res.status(201).json({ id: result.insertId, id_objetivo, nombre });
};

exports.actualizar = async (req, res) => {
  const { id_objetivo, nombre } = req.body;
  if (!id_objetivo || !nombre) return res.status(400).json({ error: 'id_objetivo y nombre son requeridos' });
  const [result] = await pool.query('UPDATE puestos SET id_objetivo = ?, nombre = ? WHERE id = ?', [id_objetivo, nombre, req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Puesto no encontrado' });
  res.json({ id: parseInt(req.params.id), id_objetivo, nombre });
};

exports.eliminar = async (req, res) => {
  const [result] = await pool.query('DELETE FROM puestos WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Puesto no encontrado' });
  res.json({ mensaje: 'Puesto eliminado correctamente' });
};
