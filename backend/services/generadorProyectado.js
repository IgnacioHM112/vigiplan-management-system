const pool = require('../config/db');

function combinarFechaHora(fecha, hora, sumarUnDia = false) {
  const dt = new Date(`${fecha}T${hora.slice(0, 5)}:00`);
  if (sumarUnDia) dt.setDate(dt.getDate() + 1);
  return dt;
}

function diffHoras(a, b) {
  return (a - b) / (1000 * 60 * 60);
}

function normalizarFecha(d) {
  if (typeof d === 'string') return d.slice(0, 10);
  return d;
}

function buildShift(item) {
  const cruzaMedianoche = item.hora_fin <= item.hora_inicio;
  return {
    ...item,
    fecha: normalizarFecha(item.fecha_asignacion || item.fecha),
    duracionHoras: Number(item.duracion_horas || 0),
    inicio: combinarFechaHora(
      item.fecha_asignacion || item.fecha,
      item.hora_inicio,
    ),
    fin: combinarFechaHora(
      item.fecha_asignacion || item.fecha,
      item.hora_fin,
      cruzaMedianoche,
    ),
    cruzaMedianoche,
  };
}

function validarEnMemoria({
  nuevoVigiladorId,
  nuevaFecha,
  turno,
  asignacionesExistentes,
  asignacionesPropuestas,
}) {
  const conflictos = [];

  const todas = [
    ...asignacionesExistentes
      .filter((a) => a.id_vigilador === nuevoVigiladorId && a.estado !== 'cancelado'),
    ...asignacionesPropuestas
      .filter((a) => a.id_vigilador === nuevoVigiladorId),
  ].map(buildShift);

  const nuevoShift = buildShift({
    fecha_asignacion: nuevaFecha,
    hora_inicio: turno.hora_inicio,
    hora_fin: turno.hora_fin,
    duracion_horas: turno.duracion_horas,
  });

  if (todas.length > 0) {
    const ordenadas = [...todas].sort((a, b) => a.inicio - b.inicio);

    const previa = ordenadas.filter((a) => a.fin <= nuevoShift.inicio).pop();
    if (previa) {
      const descanso = diffHoras(nuevoShift.inicio, previa.fin);
      if (descanso < 12) {
        conflictos.push(
          `No cumple 12 hs de descanso (${descanso.toFixed(1)} hs desde turno anterior)`
        );
      }
    }

    const siguiente = ordenadas.filter((a) => a.inicio >= nuevoShift.fin).shift();
    if (siguiente) {
      const descanso = diffHoras(siguiente.inicio, nuevoShift.fin);
      if (descanso < 12) {
        conflictos.push(
          `No cumple 12 hs de descanso (${descanso.toFixed(1)} hs hasta próximo turno)`
        );
      }
    }
  }

  const fechasUnicas = new Set(todas.map((a) => a.fecha));
  fechasUnicas.add(nuevaFecha);
  const fechasArray = Array.from(fechasUnicas).sort();

  const idxNueva = fechasArray.indexOf(nuevaFecha);
  let bloqueAtras = 0;
  for (let i = idxNueva - 1; i >= 0; i--) {
    const d1 = new Date(fechasArray[i]);
    const d2 = new Date(fechasArray[i + 1]);
    if ((d2 - d1) / (1000 * 60 * 60 * 24) === 1) {
      bloqueAtras++;
    } else break;
  }
  let bloqueAdelante = 0;
  for (let i = idxNueva + 1; i < fechasArray.length; i++) {
    const d1 = new Date(fechasArray[i]);
    const d2 = new Date(fechasArray[i - 1]);
    if ((d1 - d2) / (1000 * 60 * 60 * 24) === 1) {
      bloqueAdelante++;
    } else break;
  }
  const totalConsecutivos = 1 + bloqueAtras + bloqueAdelante;
  if (totalConsecutivos >= 7) {
    conflictos.push(`Supera los 6 días consecutivos de trabajo (${totalConsecutivos} días)`);
  }

  const mismoDia = todas.filter((a) => a.fecha === nuevaFecha);
  const horasMismoDia = mismoDia.reduce((sum, a) => sum + a.duracionHoras, 0);
  const totalHoras = horasMismoDia + turno.duracion_horas;
  if (totalHoras > 12) {
    conflictos.push(
      `Supera las 12 hs diarias (${horasMismoDia.toFixed(1)} + ${turno.duracion_horas.toFixed(1)} = ${totalHoras.toFixed(1)} hs)`
    );
  }

  for (const existente of mismoDia) {
    if (nuevoShift.inicio < existente.fin && existente.inicio < nuevoShift.fin) {
      conflictos.push(`Solapamiento horario con turno existente`);
    }
  }

  if (conflictos.length > 0) {
    console.log(`  [VALIDAR] Vig=${nuevoVigiladorId} Fecha=${nuevaFecha} -> ${conflictos.length} conflictos`);
    conflictos.forEach((c) => console.log(`    -> ${c}`));
  }
  return conflictos;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function generar({ fechaInicio, fechaFin }) {
  console.log(`\n[MOTOR] Generando proyectado de ${fechaInicio} a ${fechaFin}`);
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
    [fechaInicio, fechaFin]
  );

  if (reqRows.length === 0) {
    return {
      asignaciones_creadas: 0,
      puestos_descubiertos: 0,
      detalle: { asignaciones: [], puestos_sin_cubrir: [] },
    };
  }

  const [vigRows] = await pool.query(
    'SELECT id, nombre, legajo, max_horas_mensuales FROM vigiladores WHERE activo = 1'
  );

  if (vigRows.length === 0) {
    return {
      asignaciones_creadas: 0,
      puestos_descubiertos: reqRows.length,
      detalle: { asignaciones: [], puestos_sin_cubrir: reqRows.map((r) => ({
        id_requerimiento: r.id,
        fecha: r.fecha,
        puesto: `${r.objetivo_nombre} - ${r.puesto_nombre}`,
        turno: r.turno_nombre,
      })) },
    };
  }

  const bufferInicio = new Date(fechaInicio);
  bufferInicio.setDate(bufferInicio.getDate() - 7);
  const bufferFin = new Date(fechaFin);
  bufferFin.setDate(bufferFin.getDate() + 7);
  const bufferInicioStr = bufferInicio.toISOString().slice(0, 10);
  const bufferFinStr = bufferFin.toISOString().slice(0, 10);

  const [existentes] = await pool.query(
    `SELECT ac.id, ac.id_requerimiento, ac.id_vigilador, ac.fecha_asignacion, ac.estado,
            tc.hora_inicio, tc.hora_fin, tc.duracion_horas
     FROM asignaciones_cronograma ac
     JOIN requerimientos_mensuales rm ON rm.id = ac.id_requerimiento
     JOIN turnos_config tc ON tc.id = rm.id_turno_config
     WHERE ac.id_vigilador IN (?) AND ac.fecha_asignacion BETWEEN ? AND ?
       AND ac.estado IN ('pendiente', 'confirmado', 'propuesto')`,
    [vigRows.map((v) => v.id), bufferInicioStr, bufferFinStr]
  );

  const horasVigilador = {};
  const asignacionesExistentes = existentes.map((r) => ({
    ...r,
    fecha_asignacion: normalizarFecha(r.fecha_asignacion),
  }));

  for (const vig of vigRows) {
    const hsPrevias = asignacionesExistentes
      .filter((a) => a.id_vigilador === vig.id)
      .reduce((sum, a) => sum + Number(a.duracion_horas || 0), 0);
    horasVigilador[vig.id] = hsPrevias;
  }

  const idsRequerimientoAsignados = new Set(
    existentes
      .filter((a) =>
        reqRows.some((r) => r.id === a.id_requerimiento)
      )
      .map((a) => a.id_requerimiento)
  );

  const requerimientosPendientes = reqRows.filter(
    (r) => !idsRequerimientoAsignados.has(r.id)
  );

  const asignacionesPropuestas = [];
  const puestosSinCubrir = [];

  for (const req of requerimientosPendientes) {
    const vigsAleatorio = shuffle(vigRows);
    let asignado = false;
    const motivos = [];

    for (const vig of vigsAleatorio) {
      if (horasVigilador[vig.id] >= vig.max_horas_mensuales) {
        motivos.push(`${vig.nombre}: alcanzó max_horas (${horasVigilador[vig.id]}/${vig.max_horas_mensuales})`);
        continue;
      }

      const conflictos = validarEnMemoria({
        nuevoVigiladorId: vig.id,
        nuevaFecha: normalizarFecha(req.fecha),
        turno: req,
        asignacionesExistentes,
        asignacionesPropuestas,
      });

      if (conflictos.length === 0) {
        const entrada = {
          id_requerimiento: req.id,
          id_vigilador: vig.id,
          fecha_asignacion: req.fecha,
          estado: 'propuesto',
        };
        asignacionesPropuestas.push({
          ...entrada,
          hora_inicio: req.hora_inicio,
          hora_fin: req.hora_fin,
          duracion_horas: req.duracion_horas,
          id_vigilador: vig.id,
        });
        horasVigilador[vig.id] += Number(req.duracion_horas);
        asignado = true;
        break;
      } else {
        motivos.push(`${vig.nombre}: ${conflictos.join('; ')}`);
      }
    }

    if (!asignado) {
      console.log('===== PUESTO DESCUBIERTO =====');
      console.log(`Req #${req.id} | ${req.fecha} | ${req.objetivo_nombre} - ${req.puesto_nombre} | ${req.turno_nombre} (${req.hora_inicio}-${req.hora_fin}) ${req.duracion_horas}hs`);
      console.log('Vigiladores disponibles:');
      vigRows.forEach((v) => {
        console.log(`  - ${v.nombre} (leg.${v.legajo}) hs:${horasVigilador[v.id]}/${v.max_horas_mensuales}`);
      });
      console.log('Motivos de rechazo (primeros 10):');
      motivos.slice(0, 10).forEach((m) => console.log(`  ${m}`));
      console.log('==============================');

      puestosSinCubrir.push({
        id_requerimiento: req.id,
        fecha: req.fecha,
        objetivo: req.objetivo_nombre,
        puesto: req.puesto_nombre,
        turno: req.turno_nombre,
        hora_inicio: req.hora_inicio,
        hora_fin: req.hora_fin,
        motivos_rechazo: motivos.slice(0, 5),
      });
    }
  }

  if (asignacionesPropuestas.length > 0) {
    const values = asignacionesPropuestas.map((a) => [
      a.id_requerimiento,
      a.id_vigilador,
      a.fecha_asignacion,
      a.estado,
    ]);
    const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
    const flat = values.flat();
    await pool.query(
      `INSERT INTO asignaciones_cronograma (id_requerimiento, id_vigilador, fecha_asignacion, estado) VALUES ${placeholders}`,
      flat
    );
  }

  return {
    asignaciones_creadas: asignacionesPropuestas.length,
    puestos_descubiertos: puestosSinCubrir.length,
    detalle: {
      asignaciones: asignacionesPropuestas.map((a) => ({
        id_requerimiento: a.id_requerimiento,
        id_vigilador: a.id_vigilador,
        fecha: a.fecha_asignacion,
        estado: a.estado,
      })),
      puestos_sin_cubrir: puestosSinCubrir,
    },
  };
}

module.exports = { generar };
