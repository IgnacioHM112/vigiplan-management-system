import { useState, useEffect, useCallback } from 'react';
import { requerimientosAPI, puestosAPI, turnosConfigAPI, objetivosAPI } from '../services/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatDate(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function Requerimientos() {
  const ahora = new Date();
  const [mes, setMes] = useState(ahora.getMonth() + 1);
  const [anio, setAnio] = useState(ahora.getFullYear());
  const [data, setData] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [objetivoFiltro, setObjetivoFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [notif, setNotif] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ id_puesto: '', fecha: '', id_turno_config: '' });

  const notificar = (tipo, texto) => {
    setNotif({ tipo, texto });
    setTimeout(() => setNotif(null), 4000);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const desde = `${anio}-${String(mes).padStart(2, '0')}-01`;
      const hasta = `${anio}-${String(mes).padStart(2, '0')}-${new Date(anio, mes, 0).getDate()}`;

      const params = { fecha_desde: desde, fecha_hasta: hasta };
      if (objetivoFiltro) params.id_objetivo = objetivoFiltro;

      const [reqRes, objRes, pueRes, turRes] = await Promise.all([
        requerimientosAPI.listar(params),
        objetivosAPI.listar(),
        puestosAPI.listar(),
        turnosConfigAPI.listar(),
      ]);

      setData(reqRes.data);
      setObjetivos(objRes.data);
      setPuestos(pueRes.data);
      setTurnos(turRes.data);
    } catch {
      notificar('error', 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, [mes, anio, objetivoFiltro]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ id_puesto: '', fecha: `${anio}-${String(mes).padStart(2, '0')}-01`, id_turno_config: '' });
    setModalOpen(true);
  };

  const abrirEditar = (row) => {
    setEditando(row);
    setForm({ id_puesto: row.id_puesto, fecha: row.fecha, id_turno_config: row.id_turno_config });
    setModalOpen(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await requerimientosAPI.actualizar(editando.id, form);
      } else {
        await requerimientosAPI.crear(form);
      }
      setModalOpen(false);
      notificar('success', editando ? 'Requerimiento actualizado' : 'Requerimiento creado');
      cargar();
    } catch (err) {
      notificar('error', err.response?.data?.error || 'Error al guardar');
    }
  };

  const eliminar = async (row) => {
    if (!window.confirm(`¿Eliminar requerimiento del ${row.fecha} (${row.puesto_nombre} - ${row.turno_nombre})?`)) return;
    try {
      await requerimientosAPI.eliminar(row.id);
      notificar('success', 'Requerimiento eliminado');
      cargar();
    } catch {
      notificar('error', 'Error al eliminar');
    }
  };

  const generarMes = async () => {
    const primerDia = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const idsPuestos = objetivoFiltro
      ? puestos.filter((p) => p.id_objetivo === parseInt(objetivoFiltro)).map((p) => p.id)
      : puestos.map((p) => p.id);

    if (idsPuestos.length === 0) {
      notificar('warning', 'No hay puestos para generar');
      return;
    }

    setGenerando(true);
    let total = 0;
    for (const idPuesto of idsPuestos) {
      try {
        await requerimientosAPI.generarMensual({ id_puesto: idPuesto, mes, anio });
        total++;
      } catch {}
    }
    setGenerando(false);
    notificar('success', `Mes generado para ${total} puesto${total !== 1 ? 's' : ''}`);
    cargar();
  };

  const puestosFiltrados = objetivoFiltro
    ? puestos.filter((p) => p.id_objetivo === parseInt(objetivoFiltro))
    : puestos;

  const turnosFiltrados = editando
    ? turnos
    : form.id_puesto
      ? turnos.filter((t) => {
          const puesto = puestos.find((p) => p.id === parseInt(form.id_puesto));
          return puesto && t.id_objetivo === puesto.id_objetivo;
        })
      : turnos;

  const agrupados = {};
  for (const r of data) {
    const key = r.objetivo_nombre || 'Sin objetivo';
    if (!agrupados[key]) agrupados[key] = [];
    agrupados[key].push(r);
  }

  return (
    <div>
      {notif && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          notif.tipo === 'success' ? 'bg-green-600 text-white' :
          notif.tipo === 'warning' ? 'bg-amber-500 text-white' :
          'bg-red-600 text-white'
        }`}>
          {notif.tipo === 'success' ? '✓ ' : notif.tipo === 'warning' ? '⚠ ' : '✗ '}
          {notif.texto}
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Requerimientos Mensuales</h1>
          <p className="text-sm text-gray-500 mt-1">Creá o editá los huecos del mes manualmente</p>
        </div>
        <div className="flex-1" />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Objetivo</label>
            <select value={objetivoFiltro} onChange={(e) => setObjetivoFiltro(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Todos</option>
              {objetivos.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={anio} onChange={(e) => setAnio(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-20" />
          </div>
          <Button onClick={generarMes} disabled={generando} variant="secondary">
            {generando ? 'Generando...' : '⚡ Generar Mes Completo'}
          </Button>
          <Button onClick={abrirCrear}>+ Nuevo</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : Object.keys(agrupados).length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>No hay requerimientos para {MESES[mes - 1]} {anio}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(agrupados).map(([objetivo, items]) => (
            <div key={objetivo} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700 text-sm">{objetivo}</h3>
                <p className="text-xs text-gray-400">{items.length} requerimientos</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs">Fecha</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs">Puesto</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs">Turno</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs">Horario</th>
                      <th className="text-right px-4 py-2.5 font-semibold text-gray-500 text-xs">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-700">
                          {formatDate(new Date(r.fecha))}
                        </td>
                        <td className="px-4 py-2.5 text-gray-700">{r.puesto_nombre}</td>
                        <td className="px-4 py-2.5">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {r.turno_nombre}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs">
                          {r.hora_inicio?.slice(0, 5)} - {r.hora_fin?.slice(0, 5)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => abrirEditar(r)} className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer mr-3">Editar</button>
                          <button onClick={() => eliminar(r)} className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar Requerimiento' : 'Nuevo Requerimiento'}>
        <form onSubmit={guardar} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Puesto <span className="text-red-500">*</span></label>
            <select name="id_puesto" value={form.id_puesto} onChange={(e) => setForm({ ...form, id_puesto: e.target.value })}
              required className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar puesto</option>
              {puestosFiltrados.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <Input label="Fecha" name="fecha" type="date" value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Turno <span className="text-red-500">*</span></label>
            <select name="id_turno_config" value={form.id_turno_config} onChange={(e) => setForm({ ...form, id_turno_config: e.target.value })}
              required className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar turno</option>
              {turnos.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre} ({t.hora_inicio?.slice(0, 5)}-{t.hora_fin?.slice(0, 5)})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">{editando ? 'Guardar Cambios' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
