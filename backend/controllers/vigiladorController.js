const pool = require('../config/db');

exports.listar = async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM vigiladores ORDER BY id');
  res.json(rows);
};

exports.obtener = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM vigiladores WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Vigilador no encontrado' });
  res.json(rows[0]);
};

exports.crear = async (req, res) => {
  const { nombre, legajo, max_horas_mensuales, activo } = req.body;
  if (!nombre || !legajo || max_horas_mensuales == null) {
    return res.status(400).json({ error: 'nombre, legajo y max_horas_mensuales son requeridos' });
  }
  const [result] = await pool.query(
    'INSERT INTO vigiladores (nombre, legajo, max_horas_mensuales, activo) VALUES (?, ?, ?, ?)',
    [nombre, legajo, max_horas_mensuales, activo ?? 1]
  );
  res.status(201).json({ id: result.insertId, nombre, legajo, max_horas_mensuales, activo: activo ?? 1 });
};

exports.actualizar = async (req, res) => {
  const { nombre, legajo, max_horas_mensuales, activo } = req.body;
  if (!nombre || !legajo || max_horas_mensuales == null) {
    return res.status(400).json({ error: 'nombre, legajo y max_horas_mensuales son requeridos' });
  }
  const [result] = await pool.query(
    'UPDATE vigiladores SET nombre = ?, legajo = ?, max_horas_mensuales = ?, activo = ? WHERE id = ?',
    [nombre, legajo, max_horas_mensuales, activo ?? 1, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Vigilador no encontrado' });
  res.json({ id: parseInt(req.params.id), nombre, legajo, max_horas_mensuales, activo: activo ?? 1 });
};

exports.eliminar = async (req, res) => {
  const [result] = await pool.query('DELETE FROM vigiladores WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Vigilador no encontrado' });
  res.json({ mensaje: 'Vigilador eliminado correctamente' });
};
