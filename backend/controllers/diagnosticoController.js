const pool = require('../config/db');

exports.verificarGeneracion = async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  if (!fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: 'fecha_inicio y fecha_fin son requeridos (query params)' });
  }

  try {
    const [reqRows] = await pool.query(
      `SELECT rm.id, rm.fecha, rm.id_puesto, rm.id_turno_config,
              tc.nombre AS turno_nombre, tc.hora_inicio, tc.hora_fin, tc.duracion_horas,
              p.nombre AS puesto_nombre, o.nombre AS objetivo_nombre
       FROM requerimientos_mensuales rm
       JOIN turnos_config tc ON tc.id = rm.id_turno_config
       JOIN puestos p ON p.id = rm.id_puesto
       JOIN objetivos o ON o.id = p.id_objetivo
       WHERE rm.fecha BETWEEN ? AND ?
       ORDER BY rm.fecha, tc.hora_inicio`,
      [fecha_inicio, fecha_fin]
    );

    const [vigRows] = await pool.query(
      'SELECT id, nombre, legajo, max_horas_mensuales, activo FROM vigiladores'
    );

    const bufferInicio = new Date(fecha_inicio);
    bufferInicio.setDate(bufferInicio.getDate() - 7);
    const bufferFin = new Date(fecha_fin);
    bufferFin.setDate(bufferFin.getDate() + 7);
    const bufferInicioStr = bufferInicio.toISOString().slice(0, 10);
    const bufferFinStr = bufferFin.toISOString().slice(0, 10);

    const [asignacionesExistentes] = await pool.query(
      `SELECT ac.id, ac.id_vigilador, ac.id_requerimiento, ac.fecha_asignacion, ac.estado
       FROM asignaciones_cronograma ac
       WHERE ac.fecha_asignacion BETWEEN ? AND ?
         AND ac.estado IN ('pendiente', 'confirmado', 'propuesto')`,
      [bufferInicioStr, bufferFinStr]
    );

    const idsReqAsignados = new Set(asignacionesExistentes.map((a) => a.id_requerimiento));
    const pendientes = reqRows.filter((r) => !idsReqAsignados.has(r.id));

    res.json({
      rango: { desde: fecha_inicio, hasta: fecha_fin },
      buffer: { desde: bufferInicioStr, hasta: bufferFinStr },
      requerimientos_en_rango: reqRows.length,
      vigiladores_activos: vigRows.filter((v) => v.activo).length,
      vigiladores_totales: vigRows.length,
      asignaciones_existentes_en_buffer: asignacionesExistentes.length,
      ids_requerimiento_ya_asignados: idsReqAsignados.size,
      requerimientos_pendientes: pendientes.length,
      detalle_requerimientos: reqRows.map((r) => ({
        id: r.id,
        fecha: r.fecha,
        objetivo: r.objetivo_nombre,
        puesto: r.puesto_nombre,
        turno: r.turno_nombre,
        duracion: r.duracion_horas,
        ya_asignado: idsReqAsignados.has(r.id),
      })),
      detalle_vigiladores: vigRows.map((v) => ({
        id: v.id,
        nombre: v.nombre,
        legajo: v.legajo,
        activo: !!v.activo,
        max_horas: v.max_horas_mensuales,
      })),
    });
  } catch (err) {
    console.error('Error en diagnóstico:', err);
    res.status(500).json({ error: err.message });
  }
};
