import { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { vigiladoresAPI, requerimientosAPI, asignacionesAPI, objetivosAPI } from '../services/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

function getDiasEnRango(inicio, fin) {
  const dias = [];
  const d = new Date(inicio);
  while (d <= new Date(fin)) {
    dias.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dias;
}

function formatDate(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function mesActual() {
  const ahora = new Date();
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
  return { inicio: inicio.toISOString().slice(0, 10), fin: fin.toISOString().slice(0, 10) };
}

function abrevTurno(turnoNombre, horaInicio) {
  if (turnoNombre) return turnoNombre.slice(0, 1).toUpperCase();
  if (horaInicio) {
    const h = parseInt(horaInicio);
    if (h < 12) return 'M';
    if (h < 18) return 'T';
    return 'N';
  }
  return '?';
}

function formatearHora(h) {
  return h ? h.slice(0, 5) : '';
}

const coloresPuesto = {
  'Cajas':    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  'Playa':    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  'Entrada':  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
};
const colorPuestoDefault = { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
function colorPuesto(nombre) {
  return coloresPuesto[nombre] || colorPuestoDefault;
}

function nombreMes(d) {
  return new Date(d).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

export default function Planificacion() {
  const { inicio: mesInicio, fin: mesFin } = mesActual();
  const [fechaInicio, setFechaInicio] = useState(mesInicio);
  const [fechaFin, setFechaFin] = useState(mesFin);
  const [dias, setDias] = useState([]);
  const [vigiladores, setVigiladores] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [objetivoFiltro, setObjetivoFiltro] = useState('');
  const [vigiladorFiltro, setVigiladorFiltro] = useState('');
  const [asignaciones, setAsignaciones] = useState({});
  const [descubiertos, setDescubiertos] = useState({});
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);

  const [notificacion, setNotificacion] = useState(null);
  const notifTimer = useRef(null);

  const [celdaActiva, setCeldaActiva] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [vigiladorSeleccionado, setVigiladorSeleccionado] = useState('');
  const [validando, setValidando] = useState(false);
  const [resultadoValidacion, setResultadoValidacion] = useState(null);

  const mostrarNotificacion = (tipo, texto) => {
    setNotificacion({ tipo, texto });
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotificacion(null), 5000);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = { fecha_desde: fechaInicio, fecha_hasta: fechaFin };
      if (objetivoFiltro) params.id_objetivo = objetivoFiltro;

      const [vigRes, asigRes, reqRes, objRes] = await Promise.all([
        vigiladoresAPI.listar(),
        asignacionesAPI.listar(params),
        requerimientosAPI.listar(params),
        objetivosAPI.listar(),
      ]);

      setVigiladores(vigRes.data);
      setObjetivos(objRes.data);

      const normalizarFecha = (f) => f ? String(f).slice(0, 10) : f;
      const mapaAsignaciones = {};
      for (const a of asigRes.data) {
        const key = `${a.id_vigilador}|${normalizarFecha(a.fecha_asignacion)}`;
        if (!mapaAsignaciones[key]) mapaAsignaciones[key] = [];
        mapaAsignaciones[key].push(a);
      }
      setAsignaciones(mapaAsignaciones);

      const idsAsignados = new Set(asigRes.data.map((a) => a.id_requerimiento));
      const descubiertosMap = {};
      for (const r of reqRes.data) {
        if (!idsAsignados.has(r.id)) {
          const fechaKey = normalizarFecha(r.fecha);
          if (!descubiertosMap[fechaKey]) descubiertosMap[fechaKey] = [];
          descubiertosMap[fechaKey].push(r);
        }
      }
      setDescubiertos(descubiertosMap);

      setDias(getDiasEnRango(fechaInicio, fechaFin));
    } catch {
      mostrarNotificacion('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, objetivoFiltro]);

  useEffect(() => { cargar(); }, [cargar]);

  const generarProyectado = async () => {
    setGenerando(true);
    try {
      const res = await asignacionesAPI.generarProyectado({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
      await cargar();
      mostrarNotificacion(
        res.data.puestos_descubiertos > 0 ? 'warning' : 'success',
        `Proyectado generado: ${res.data.asignaciones_creadas} asignaciones creadas, ${res.data.puestos_descubiertos} puestos sin cubrir.`
      );
    } catch (err) {
      mostrarNotificacion('error', err.response?.data?.error || 'Error al generar el proyectado');
    } finally {
      setGenerando(false);
    }
  };

  const abrirEdicion = (vigiladorId, fecha) => {
    const key = `${vigiladorId}|${fecha}`;
    const actual = asignaciones[key]?.[0];
    setCeldaActiva({ vigiladorId, fecha, actual });
    setVigiladorSeleccionado(actual ? String(actual.id_vigilador) : '');
    setResultadoValidacion(null);
    setModoEdicion(true);
  };

  const cerrarEdicion = () => {
    setModoEdicion(false);
    setCeldaActiva(null);
    setResultadoValidacion(null);
  };

  const handleValidar = async () => {
    if (!vigiladorSeleccionado || !celdaActiva) return;
    setValidando(true);
    setResultadoValidacion(null);
    try {
      const res = await asignacionesAPI.validar({
        id_requerimiento: celdaActiva.actual?.id_requerimiento,
        id_vigilador: parseInt(vigiladorSeleccionado),
      });
      setResultadoValidacion(res.data);
    } catch (err) {
      mostrarNotificacion('error', err.response?.data?.error || 'Error al validar');
    } finally {
      setValidando(false);
    }
  };

  const guardarAsignacion = async (forzar = false) => {
    if (!celdaActiva) return;
    try {
      if (celdaActiva.actual) {
        await asignacionesAPI.eliminar(celdaActiva.actual.id);
      }
      if (vigiladorSeleccionado) {
        await asignacionesAPI.crear({
          id_requerimiento: celdaActiva.actual?.id_requerimiento,
          id_vigilador: parseInt(vigiladorSeleccionado),
          estado: forzar ? 'conflicto' : 'pendiente',
        });
      }
      cerrarEdicion();
      await cargar();
      mostrarNotificacion('success', 'Asignación actualizada');
    } catch (err) {
      mostrarNotificacion('error', err.response?.data?.error || 'Error al guardar');
    }
  };

  const contenidoCelda = (vigiladorId, fecha) => {
    const key = `${vigiladorId}|${fecha}`;
    const celdas = asignaciones[key];
    if (!celdas || celdas.length === 0) return null;
    return celdas[0];
  };

  const exportarExcel = () => {
    const titulo = `Cuadrante_${fechaInicio}_a_${fechaFin}`;

    const encabezados = ['Vigilador / Legajo', ...dias.map((d) => {
      const dt = new Date(d);
      return formatDate(dt);
    }), 'Total Hs'];

    const filas = vigiladores
      .filter((v) => v.activo)
      .map((vig) => {
        const totalHoras = dias.reduce((sum, d) => {
          const c = contenidoCelda(vig.id, d);
          return sum + (c ? Number(c.duracion_horas || 0) : 0);
        }, 0);
        return [
          `${vig.nombre} (${vig.legajo})`,
          ...dias.map((d) => {
            const c = contenidoCelda(vig.id, d);
            return c ? `${abrevTurno(c.turno_nombre, c.hora_inicio)} ${c.objetivo_nombre}` : '';
          }),
          totalHoras.toFixed(1),
        ];
      });

    const filaDescubiertos = [
      '🚨 PUESTOS SIN ASIGNAR',
      ...dias.map((d) => {
        const items = descubiertos[d] || [];
        return items.map((i) => `${i.turno_nombre} ${i.puesto_nombre} (${i.objetivo_nombre})`).join(', ');
      }),
      '',
    ];

    const ws = XLSX.utils.aoa_to_sheet([encabezados, ...filas, filaDescubiertos]);

    ws['!cols'] = [{ wch: 30 }, ...dias.map(() => ({ wch: 14 })), { wch: 10 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cuadrante');
    XLSX.writeFile(wb, `${titulo}.xlsx`);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Cargando cuadrante...</div>;
  }

  return (
    <div>
      {notificacion && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-fade-in ${
          notificacion.tipo === 'success' ? 'bg-green-600 text-white' :
          notificacion.tipo === 'warning' ? 'bg-amber-500 text-white' :
          'bg-red-600 text-white'
        }`}>
          {notificacion.tipo === 'success' ? '✓ ' : notificacion.tipo === 'warning' ? '⚠ ' : '✗ '}
          {notificacion.texto}
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Planificación de Turnos</h1>
          <p className="text-sm text-gray-500 mt-1">{nombreMes(fechaInicio)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Filtrar por objetivo</label>
            <select
              value={objetivoFiltro}
              onChange={(e) => setObjetivoFiltro(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[180px]"
            >
              <option value="">Todos los objetivos</option>
              {objetivos.map((o) => (
                <option key={o.id} value={o.id}>{o.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Vigilador</label>
            <select
              value={vigiladorFiltro}
              onChange={(e) => setVigiladorFiltro(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[200px]"
            >
              <option value="">Todos los vigiladores</option>
              {vigiladores.filter((v) => v.activo).map((v) => (
                <option key={v.id} value={v.id}>{v.nombre} ({v.legajo})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <span className="text-gray-400">a</span>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <Button onClick={generarProyectado} disabled={generando}>
            {generando ? 'Generando...' : '⚡ Generar Proyectado'}
          </Button>

          <Button onClick={exportarExcel} variant="secondary">
            📥 Exportar Excel
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 bg-gray-50 border-b border-r border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-600 min-w-[180px]">
                  Vigilador
                </th>
                {dias.map((d) => {
                  const dt = new Date(d);
                  const diaSem = dt.toLocaleDateString('es-AR', { weekday: 'short' }).slice(0, 3).toUpperCase();
                  const esFinde = dt.getDay() === 0 || dt.getDay() === 6;
                  return (
                    <th key={d} className={`border-b border-r border-gray-200 px-1.5 py-2.5 text-center font-semibold min-w-[68px] ${esFinde ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600'}`}>
                                      <div className="text-[10px]">{diaSem}</div>
                                      <div className="text-[10px]">{String(dt.getDate()).padStart(2, '0')}/{String(dt.getMonth() + 1).padStart(2, '0')}</div>
                    </th>
                  );
                })}
                <th className="sticky right-0 z-30 bg-gray-50 border-b border-l border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-600 min-w-[60px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {vigiladores.filter((v) => v.activo && (!vigiladorFiltro || String(v.id) === vigiladorFiltro)).map((vig) => {
                const totalHoras = dias.reduce((sum, d) => {
                  const c = contenidoCelda(vig.id, d);
                  return sum + (c ? Number(c.duracion_horas || 0) : 0);
                }, 0);

                return (
                  <tr key={vig.id}>
                    <td className="sticky left-0 z-10 bg-white border-b border-r border-gray-200 px-3 py-2 whitespace-nowrap">
                      <div className="font-medium text-gray-800 text-xs">{vig.nombre}</div>
                      <div className="text-[10px] text-gray-400">{vig.legajo}</div>
                    </td>
                    {dias.map((d) => {
                      const c = contenidoCelda(vig.id, d);
                      return (
                        <td key={d} onClick={() => abrirEdicion(vig.id, d)}
                          className={`border-b border-r border-gray-100 px-1 py-2 text-center cursor-pointer hover:opacity-80 transition-all ${c ? colorPuesto(c.puesto_nombre).bg : 'bg-gray-50/50'}`}>
                          {c ? (
                            <div className="flex flex-col items-center">
                              <span className={`font-bold text-xs ${c.estado === 'conflicto' ? 'text-amber-600' : colorPuesto(c.puesto_nombre).text}`}>
                                {abrevTurno(c.turno_nombre, c.hora_inicio)}
                              </span>
                              <span className={`text-[9px] font-medium leading-tight ${colorPuesto(c.puesto_nombre).text}`}>{c.puesto_nombre}</span>
                              <span className="text-[8px] text-gray-500">{formatearHora(c.hora_inicio)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-[10px] font-mono">FR</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="sticky right-0 z-10 bg-white border-b border-l border-gray-100 px-3 py-2 text-center text-xs text-gray-500 font-medium">
                      {totalHoras.toFixed(1)}
                    </td>
                  </tr>
                );
              })}

              <tr className="bg-red-50/50">
                <td className="sticky left-0 z-10 bg-red-50 border-b border-r border-gray-200 px-3 py-2.5">
                  <span className="font-semibold text-red-700 text-xs">🚨 Puestos Sin Asignar</span>
                </td>
                {dias.map((d) => {
                  const items = descubiertos[d] || [];
                  return (
                    <td key={d} className={`border-b border-r border-gray-100 px-1 py-2 text-center ${items.length > 0 ? 'bg-red-50' : 'bg-gray-50/30'}`}>
                      {items.length > 0 ? (
                        <div className="flex flex-col items-center gap-0.5">
                          {items.slice(0, 2).map((item, i) => (
                            <span key={i} className="text-[9px] text-red-600 font-medium leading-tight">
                              {abrevTurno(item.turno_nombre)} {item.puesto_nombre?.split(' ')[0]}
                            </span>
                          ))}
                          {items.length > 2 && <span className="text-[8px] text-red-400">+{items.length - 2}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-[10px]">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="sticky right-0 z-10 bg-red-50 border-b border-l border-gray-100 px-3 py-2 text-center" />
              </tr>

              <tr className="bg-gray-100 font-semibold">
                <td className="sticky left-0 z-10 bg-gray-100 border-b border-r border-gray-300 px-3 py-2.5">
                  <span className="text-xs text-gray-700">Hs Reales</span>
                </td>
                {dias.map((d) => {
                  const totalDia = vigiladores
                    .filter((v) => v.activo && (!vigiladorFiltro || String(v.id) === vigiladorFiltro))
                    .reduce((sum, vig) => {
                      const c = contenidoCelda(vig.id, d);
                      return sum + (c ? Number(c.duracion_horas || 0) : 0);
                    }, 0);
                  return (
                    <td key={d} className="border-b border-r border-gray-300 px-1 py-2 text-center">
                      <span className="text-xs text-gray-700">{totalDia > 0 ? totalDia.toFixed(1) : '—'}</span>
                    </td>
                  );
                })}
                <td className="sticky right-0 z-10 bg-gray-100 border-b border-l border-gray-300 px-3 py-2 text-center" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modoEdicion} onClose={cerrarEdicion} title="Editar Asignación">
        <div className="space-y-4">
          <div className="space-y-2">
            {celdaActiva?.actual && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-gray-500">Asignación actual:</p>
                <p className="font-semibold text-gray-800">{celdaActiva.actual.vigilador_nombre}</p>
                <p className="text-gray-500 text-xs">{celdaActiva.actual.turno_nombre} — {celdaActiva.actual.objetivo_nombre}</p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Asignar a:</label>
              <select
                value={vigiladorSeleccionado}
                onChange={(e) => { setVigiladorSeleccionado(e.target.value); setResultadoValidacion(null); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">— Sin asignar —</option>
                {vigiladores.filter((v) => v.activo).map((v) => (
                  <option key={v.id} value={v.id}>{v.nombre} ({v.legajo})</option>
                ))}
              </select>
            </div>
          </div>

          {vigiladorSeleccionado && (
            <Button onClick={handleValidar} disabled={validando} variant="secondary" className="w-full">
              {validando ? 'Validando...' : '✓ Validar Asignación'}
            </Button>
          )}

          {resultadoValidacion && (
            <div className={`rounded-lg p-3 text-sm ${resultadoValidacion.es_valido ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {resultadoValidacion.es_valido ? (
                <p>✓ Sin conflictos — puede asignarse</p>
              ) : (
                <div>
                  <p className="font-semibold mb-1">⚠️ Conflictos detectados:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {resultadoValidacion.conflictos.map((c, i) => (
                      <li key={i} className="text-xs">{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={cerrarEdicion} className="flex-1">Cancelar</Button>
            {resultadoValidacion?.es_valido && (
              <Button onClick={() => guardarAsignacion(false)} className="flex-1">Guardar</Button>
            )}
            {resultadoValidacion && !resultadoValidacion.es_valido && (
              <Button onClick={() => guardarAsignacion(true)} variant="warning" className="flex-1">
                Guardar de todas formas (Forzar)
              </Button>
            )}
            {!resultadoValidacion && vigiladorSeleccionado && (
              <Button onClick={() => guardarAsignacion(true)} variant="warning" className="flex-1">Guardar Directo</Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
