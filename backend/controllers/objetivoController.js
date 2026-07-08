const pool = require('../config/db');

exports.listar = async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM objetivos ORDER BY id');
  res.json(rows);
};

exports.obtener = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM objetivos WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Objetivo no encontrado' });
  res.json(rows[0]);
};

exports.crear = async (req, res) => {
  const { nombre, direccion } = req.body;
  if (!nombre || !direccion) return res.status(400).json({ error: 'nombre y direccion son requeridos' });
  const [result] = await pool.query('INSERT INTO objetivos (nombre, direccion) VALUES (?, ?)', [nombre, direccion]);
  res.status(201).json({ id: result.insertId, nombre, direccion });
};

exports.actualizar = async (req, res) => {
  const { nombre, direccion } = req.body;
  if (!nombre || !direccion) return res.status(400).json({ error: 'nombre y direccion son requeridos' });
  const [result] = await pool.query('UPDATE objetivos SET nombre = ?, direccion = ? WHERE id = ?', [nombre, direccion, req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Objetivo no encontrado' });
  res.json({ id: parseInt(req.params.id), nombre, direccion });
};

exports.eliminar = async (req, res) => {
  const [result] = await pool.query('DELETE FROM objetivos WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Objetivo no encontrado' });
  res.json({ mensaje: 'Objetivo eliminado correctamente' });
};
