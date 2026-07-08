const pool = require('../config/db');

exports.listar = async (req, res) => {
  let sql = `
    SELECT rm.*, p.nombre AS puesto_nombre, o.nombre AS objetivo_nombre,
           tc.nombre AS turno_nombre, tc.hora_inicio, tc.hora_fin, tc.duracion_horas
    FROM requerimientos_mensuales rm
    JOIN puestos p ON p.id = rm.id_puesto
    JOIN objetivos o ON o.id = p.id_objetivo
    JOIN turnos_config tc ON tc.id = rm.id_turno_config
  `;
  const params = [];
  const condiciones = [];

  if (req.query.fecha_desde) {
    condiciones.push('rm.fecha >= ?');
    params.push(req.query.fecha_desde);
  }
  if (req.query.fecha_hasta) {
    condiciones.push('rm.fecha <= ?');
    params.push(req.query.fecha_hasta);
  }
  if (req.query.id_objetivo) {
    condiciones.push('o.id = ?');
    params.push(req.query.id_objetivo);
  }

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }

  sql += ' ORDER BY rm.fecha DESC, rm.id';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
};

exports.listarPorPuesto = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT rm.*, p.nombre AS puesto_nombre, o.nombre AS objetivo_nombre,
            tc.nombre AS turno_nombre, tc.hora_inicio, tc.hora_fin, tc.duracion_horas
     FROM requerimientos_mensuales rm
     JOIN puestos p ON p.id = rm.id_puesto
     JOIN objetivos o ON o.id = p.id_objetivo
     JOIN turnos_config tc ON tc.id = rm.id_turno_config
     WHERE rm.id_puesto = ?
     ORDER BY rm.fecha DESC`,
    [req.params.id_puesto]
  );
  res.json(rows);
};

exports.obtener = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT rm.*, p.nombre AS puesto_nombre, o.nombre AS objetivo_nombre,
            tc.nombre AS turno_nombre, tc.hora_inicio, tc.hora_fin, tc.duracion_horas
     FROM requerimientos_mensuales rm
     JOIN puestos p ON p.id = rm.id_puesto
     JOIN objetivos o ON o.id = p.id_objetivo
     JOIN turnos_config tc ON tc.id = rm.id_turno_config
     WHERE rm.id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Requerimiento no encontrado' });
  res.json(rows[0]);
};

exports.crear = async (req, res) => {
  const { id_puesto, fecha, id_turno_config } = req.body;
  if (!id_puesto || !fecha || !id_turno_config) {
    return res.status(400).json({ error: 'id_puesto, fecha y id_turno_config son requeridos' });
  }
  const [result] = await pool.query(
    'INSERT INTO requerimientos_mensuales (id_puesto, fecha, id_turno_config) VALUES (?, ?, ?)',
    [id_puesto, fecha, id_turno_config]
  );
  res.status(201).json({ id: result.insertId, id_puesto, fecha, id_turno_config });
};

exports.actualizar = async (req, res) => {
  const { id_puesto, fecha, id_turno_config } = req.body;
  if (!id_puesto || !fecha || !id_turno_config) {
    return res.status(400).json({ error: 'id_puesto, fecha y id_turno_config son requeridos' });
  }
  const [result] = await pool.query(
    'UPDATE requerimientos_mensuales SET id_puesto = ?, fecha = ?, id_turno_config = ? WHERE id = ?',
    [id_puesto, fecha, id_turno_config, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Requerimiento no encontrado' });
  res.json({ id: parseInt(req.params.id), id_puesto, fecha, id_turno_config });
};

exports.generarMensual = async (req, res) => {
  const { id_puesto, mes, anio } = req.body;

  if (!id_puesto || !mes || !anio) {
    return res.status(400).json({ error: 'id_puesto, mes y anio son requeridos' });
  }

  try {
    const [puestoRows] = await pool.query(
      'SELECT p.id, p.id_objetivo FROM puestos p WHERE p.id = ?',
      [id_puesto]
    );
    if (puestoRows.length === 0) return res.status(404).json({ error: 'Puesto no encontrado' });

    const idObjetivo = puestoRows[0].id_objetivo;

    const [turnos] = await pool.query(
      'SELECT id, nombre FROM turnos_config WHERE id_objetivo = ?',
      [idObjetivo]
    );
    if (turnos.length === 0) {
      return res.status(400).json({ error: 'El objetivo del puesto no tiene turnos configurados' });
    }

    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0);
    const totalDias = ultimoDia.getDate();

    const existentes = await pool.query(
      `SELECT fecha, id_turno_config FROM requerimientos_mensuales
       WHERE id_puesto = ? AND fecha BETWEEN ? AND ?`,
      [id_puesto, `${anio}-${String(mes).padStart(2, '0')}-01`, `${anio}-${String(mes).padStart(2, '0')}-${totalDias}`]
    );

    const setExistentes = new Set(
      existentes[0].map((r) => {
        const d = r.fecha;
        const fechaStr = typeof d === 'string'
          ? d.slice(0, 10)
          : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return `${fechaStr}|${r.id_turno_config}`;
      })
    );

    const values = [];
    const yaExisten = [];

    for (let dia = 1; dia <= totalDias; dia++) {
      const fecha = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      for (const turno of turnos) {
        const key = `${fecha}|${turno.id}`;
        if (setExistentes.has(key)) {
          yaExisten.push(key);
        } else {
          values.push([id_puesto, fecha, turno.id]);
        }
      }
    }

    let insertados = 0;
    if (values.length > 0) {
      const placeholders = values.map(() => '(?, ?, ?)').join(', ');
      const [result] = await pool.query(
        `INSERT INTO requerimientos_mensuales (id_puesto, fecha, id_turno_config) VALUES ${placeholders}`,
        values.flat()
      );
      insertados = result.affectedRows;
    }

    res.status(201).json({
      mensaje: `Generados ${insertados} requerimientos para ${totalDias} días (${turnos.length} turnos)`,
      total_posibles: totalDias * turnos.length,
      insertados,
      ya_existentes: yaExisten.length,
      puesto: id_puesto,
      mes: `${mes}/${anio}`,
    });
  } catch (err) {
    console.error('Error al generar requerimientos:', err);
    res.status(500).json({ error: 'Error interno al generar requerimientos' });
  }
};

exports.eliminar = async (req, res) => {
  const [result] = await pool.query('DELETE FROM requerimientos_mensuales WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Requerimiento no encontrado' });
  res.json({ mensaje: 'Requerimiento eliminado correctamente' });
};
