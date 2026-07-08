import { useState, useEffect } from 'react';
import { objetivosAPI, puestosAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

export default function ObjetivosPuestos() {
  const [objetivos, setObjetivos] = useState([]);
  const [puestos, setPuestos] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(null);

  const [modalObj, setModalObj] = useState(false);
  const [editandoObj, setEditandoObj] = useState(null);
  const [formObj, setFormObj] = useState({ nombre: '', direccion: '' });

  const [modalPuesto, setModalPuesto] = useState(false);
  const [editandoPuesto, setEditandoPuesto] = useState(null);
  const [formPuesto, setFormPuesto] = useState({ nombre: '' });
  const [objetivoActual, setObjetivoActual] = useState(null);

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const objRes = await objetivosAPI.listar();
      const objs = objRes.data;
      setObjetivos(objs);

      const puestosRes = await puestosAPI.listar();
      const agrupados = {};
      for (const p of puestosRes.data) {
        if (!agrupados[p.id_objetivo]) agrupados[p.id_objetivo] = [];
        agrupados[p.id_objetivo].push(p);
      }
      setPuestos(agrupados);
    } catch {
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarTodo(); }, []);

  const cargarPuestosDe = async (idObj) => {
    try {
      const res = await puestosAPI.listarPorObjetivo(idObj);
      setPuestos((prev) => ({ ...prev, [idObj]: res.data }));
    } catch {}
  };

  const toggleExpandir = (id) => {
    if (expandido === id) {
      setExpandido(null);
    } else {
      setExpandido(id);
      if (!puestos[id]) cargarPuestosDe(id);
    }
  };

  const handleObjChange = (e) => {
    const { name, value } = e.target;
    setFormObj((prev) => ({ ...prev, [name]: value }));
  };

  const abrirCrearObj = () => {
    setEditandoObj(null);
    setFormObj({ nombre: '', direccion: '' });
    setModalObj(true);
  };

  const abrirEditarObj = (obj) => {
    setEditandoObj(obj);
    setFormObj({ nombre: obj.nombre, direccion: obj.direccion });
    setModalObj(true);
  };

  const guardarObj = async (e) => {
    e.preventDefault();
    try {
      if (editandoObj) {
        await objetivosAPI.actualizar(editandoObj.id, formObj);
      } else {
        await objetivosAPI.crear(formObj);
      }
      setModalObj(false);
      cargarTodo();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    }
  };

  const eliminarObj = async (obj) => {
    if (!window.confirm(`¿Eliminar objetivo "${obj.nombre}"? Se eliminarán también sus puestos.`)) return;
    try {
      await objetivosAPI.eliminar(obj.id);
      cargarTodo();
    } catch {
      alert('Error al eliminar');
    }
  };

  const abrirCrearPuesto = (idObj) => {
    setObjetivoActual(idObj);
    setEditandoPuesto(null);
    setFormPuesto({ nombre: '' });
    setModalPuesto(true);
  };

  const abrirEditarPuesto = (puesto) => {
    setObjetivoActual(puesto.id_objetivo);
    setEditandoPuesto(puesto);
    setFormPuesto({ nombre: puesto.nombre });
    setModalPuesto(true);
  };

  const guardarPuesto = async (e) => {
    e.preventDefault();
    try {
      const payload = { id_objetivo: objetivoActual, nombre: formPuesto.nombre };
      if (editandoPuesto) {
        await puestosAPI.actualizar(editandoPuesto.id, payload);
      } else {
        await puestosAPI.crear(payload);
      }
      setModalPuesto(false);
      await cargarPuestosDe(objetivoActual);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar puesto');
    }
  };

  const eliminarPuesto = async (puesto) => {
    if (!window.confirm(`¿Eliminar puesto "${puesto.nombre}"?`)) return;
    try {
      await puestosAPI.eliminar(puesto.id);
      await cargarPuestosDe(puesto.id_objetivo);
    } catch {
      alert('Error al eliminar puesto');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Objetivos y Puestos</h1>
        <Button onClick={abrirCrearObj}>+ Nuevo Objetivo</Button>
      </div>

      <div className="space-y-3">
        {objetivos.length === 0 && <p className="text-gray-400 text-center py-8">No hay objetivos registrados</p>}

        {objetivos.map((obj) => (
          <div key={obj.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpandir(obj.id)}
            >
              <div>
                <h3 className="font-semibold text-gray-800">{obj.nombre}</h3>
                <p className="text-sm text-gray-500">{obj.direccion}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); abrirEditarObj(obj); }}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); eliminarObj(obj); }}
                  className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
                >
                  Eliminar
                </button>
                <span className="text-gray-400 ml-2">{expandido === obj.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandido === obj.id && (
              <div className="border-t border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-600">Puestos</h4>
                  <Button size="sm" onClick={() => abrirCrearPuesto(obj.id)}>+ Añadir Puesto</Button>
                </div>

                {(!puestos[obj.id] || puestos[obj.id].length === 0) ? (
                  <p className="text-sm text-gray-400 py-2">Sin puestos asignados</p>
                ) : (
                  <div className="space-y-2">
                    {puestos[obj.id].map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5">
                        <span className="text-sm text-gray-700">{p.nombre}</span>
                        <div className="flex gap-2">
                          <button onClick={() => abrirEditarPuesto(p)} className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer">Editar</button>
                          <button onClick={() => eliminarPuesto(p)} className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer">Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={modalObj} onClose={() => setModalObj(false)} title={editandoObj ? 'Editar Objetivo' : 'Nuevo Objetivo'}>
        <form onSubmit={guardarObj} className="space-y-4">
          <Input label="Nombre" name="nombre" value={formObj.nombre} onChange={handleObjChange} required />
          <Input label="Dirección" name="direccion" value={formObj.direccion} onChange={handleObjChange} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalObj(false)}>Cancelar</Button>
            <Button type="submit">{editandoObj ? 'Guardar Cambios' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={modalPuesto} onClose={() => setModalPuesto(false)} title={editandoPuesto ? 'Editar Puesto' : 'Nuevo Puesto'}>
        <form onSubmit={guardarPuesto} className="space-y-4">
          <Input label="Nombre del Puesto" name="nombre" value={formPuesto.nombre} onChange={(e) => setFormPuesto({ nombre: e.target.value })} required placeholder="Ej: Entrada Principal" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalPuesto(false)}>Cancelar</Button>
            <Button type="submit">{editandoPuesto ? 'Guardar Cambios' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
