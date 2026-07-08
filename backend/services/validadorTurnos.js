const pool = require('../config/db');

function combinarFechaHora(fecha, hora, sumarUnDia = false) {
  const dt = new Date(`${fecha}T${hora.slice(0, 5)}:00`);
  if (sumarUnDia) dt.setDate(dt.getDate() + 1);
  return dt;
}

function diffHoras(a, b) {
  return (a - b) / (1000 * 60 * 60);
}

function formatearHora(d) {
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

async function obtenerAsignacionesVigilador(idVigilador, excluirIdRequerimiento = null) {
  let query = `
    SELECT ac.id, ac.fecha_asignacion, ac.estado,
           tc.nombre AS turno_nombre, tc.hora_inicio, tc.hora_fin, tc.duracion_horas
    FROM asignaciones_cronograma ac
    JOIN requerimientos_mensuales rm ON rm.id = ac.id_requerimiento
    JOIN turnos_config tc ON tc.id = rm.id_turno_config
    WHERE ac.id_vigilador = ? AND ac.estado IN ('pendiente', 'confirmado')
  `;
  const params = [idVigilador];
  if (excluirIdRequerimiento) {
    query += ' AND ac.id_requerimiento != ?';
    params.push(excluirIdRequerimiento);
  }
  const [rows] = await pool.query(query, params);

  return rows.map((r) => {
    const cruzaMedianoche = r.hora_fin <= r.hora_inicio;
    return {
      id: r.id,
      fecha: r.fecha_asignacion,
      turnoNombre: r.turno_nombre,
      horaInicio: r.hora_inicio,
      horaFin: r.hora_fin,
      duracionHoras: Number(r.duracion_horas),
      estado: r.estado,
      inicio: combinarFechaHora(r.fecha_asignacion, r.hora_inicio),
      fin: combinarFechaHora(r.fecha_asignacion, r.hora_fin, cruzaMedianoche),
      cruzaMedianoche,
    };
  });
}

async function validar({ idVigilador, fechaAsignacion, idTurnoConfig, excluirIdRequerimiento = null }) {
  const conflictos = [];

  const [turnoRows] = await pool.query('SELECT * FROM turnos_config WHERE id = ?', [idTurnoConfig]);
  if (turnoRows.length === 0) {
    return { es_valido: false, conflictos: ['Configuración de turno no encontrada'] };
  }

  const turno = turnoRows[0];
  const nuevoCruzaMedianoche = turno.hora_fin <= turno.hora_inicio;

  const nuevoTurno = {
    inicio: combinarFechaHora(fechaAsignacion, turno.hora_inicio),
    fin: combinarFechaHora(fechaAsignacion, turno.hora_fin, nuevoCruzaMedianoche),
    duracionHoras: Number(turno.duracion_horas),
    cruzaMedianoche: nuevoCruzaMedianoche,
  };

  const asignaciones = await obtenerAsignacionesVigilador(idVigilador, excluirIdRequerimiento);

  if (asignaciones.length > 0) {
    const fechasAsc = [...asignaciones].sort((a, b) => a.inicio - b.inicio);

    const previa = fechasAsc
      .filter((a) => a.fin <= nuevoTurno.inicio)
      .pop();

    if (previa) {
      const descanso = diffHoras(nuevoTurno.inicio, previa.fin);
      if (descanso < 12) {
        conflictos.push(
          `El vigilador no cumple con las 12 horas de descanso obligatorias ` +
          `(Tiene ${descanso.toFixed(1)} horas desde su último turno ` +
          `"${previa.turnoNombre}" del ${previa.fecha} ${formatearHora(previa.fin)})`
        );
      }
    }

    const siguiente = fechasAsc
      .filter((a) => a.inicio >= nuevoTurno.fin)
      .shift();

    if (siguiente) {
      const descanso = diffHoras(siguiente.inicio, nuevoTurno.fin);
      if (descanso < 12) {
        conflictos.push(
          `El vigilador no cumple con las 12 horas de descanso obligatorias ` +
          `antes de su próximo turno (Tiene ${descanso.toFixed(1)} horas hasta ` +
          `"${siguiente.turnoNombre}" del ${siguiente.fecha} ${formatearHora(siguiente.inicio)})`
        );
      }
    }
  }

  const fechasUnicas = new Set(asignaciones.map((a) => a.fecha));
  fechasUnicas.add(fechaAsignacion);
  const fechasArray = Array.from(fechasUnicas).sort();

  const idxNueva = fechasArray.indexOf(fechaAsignacion);

  let bloqueAtras = 0;
  for (let i = idxNueva - 1; i >= 0; i--) {
    const actual = new Date(fechasArray[i]);
    const siguienteDia = new Date(fechasArray[i + 1]);
    const diff = (siguienteDia - actual) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      bloqueAtras++;
    } else {
      break;
    }
  }

  let bloqueAdelante = 0;
  for (let i = idxNueva + 1; i < fechasArray.length; i++) {
    const actual = new Date(fechasArray[i]);
    const anteriorDia = new Date(fechasArray[i - 1]);
    const diff = (actual - anteriorDia) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      bloqueAdelante++;
    } else {
      break;
    }
  }

  const totalConsecutivos = 1 + bloqueAtras + bloqueAdelante;
  if (totalConsecutivos >= 7) {
    conflictos.push(
      `El vigilador supera los 6 días consecutivos de trabajo ` +
      `(lleva ${totalConsecutivos} días seguidos incluyendo esta asignación)`
    );
  }

  const mismoDia = asignaciones.filter(
    (a) => a.fecha === fechaAsignacion
  );

  const horasMismoDia = mismoDia.reduce((sum, a) => sum + a.duracionHoras, 0);
  const totalHorasDia = horasMismoDia + nuevoTurno.duracionHoras;
  if (totalHorasDia > 12) {
    conflictos.push(
      `El vigilador supera las 12 horas diarias permitidas ` +
      `(tiene ${horasMismoDia.toFixed(1)} hs asignadas + ${nuevoTurno.duracionHoras.toFixed(1)} hs del nuevo turno = ${totalHorasDia.toFixed(1)} hs)`
    );
  }

  for (const existente of mismoDia) {
    if (nuevoTurno.inicio < existente.fin && existente.inicio < nuevoTurno.fin) {
      conflictos.push(
        `El horario del nuevo turno (${formatearHora(nuevoTurno.inicio)} - ${formatearHora(nuevoTurno.fin)}) ` +
        `se superpone con "${existente.turnoNombre}" (${formatearHora(existente.inicio)} - ${formatearHora(existente.fin)})`
      );
    }
  }

  return {
    es_valido: conflictos.length === 0,
    conflictos,
  };
}

module.exports = { validar };
