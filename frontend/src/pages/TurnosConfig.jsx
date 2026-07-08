import { useState, useEffect } from 'react';
import { turnosConfigAPI, objetivosAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';

const emptyForm = { id_objetivo: '', nombre: '', hora_inicio: '', hora_fin: '', duracion_horas: '' };

export default function TurnosConfig() {
  const [data, setData] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const cargar = async () => {
    setLoading(true);
    try {
      const [turRes, objRes] = await Promise.all([
        turnosConfigAPI.listar(),
        objetivosAPI.listar(),
      ]);
      setData(turRes.data);
      setObjetivos(objRes.data);
    } catch {
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'duracion_horas' ? Number(value) : value }));
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const abrirEditar = (row) => {
    setEditando(row);
    setForm({
      id_objetivo: row.id_objetivo,
      nombre: row.nombre,
      hora_inicio: row.hora_inicio.slice(0, 5),
      hora_fin: row.hora_fin.slice(0, 5),
      duracion_horas: row.duracion_horas,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await turnosConfigAPI.actualizar(editando.id, form);
      } else {
        await turnosConfigAPI.crear(form);
      }
      setModalOpen(false);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    }
  };

  const eliminar = async (row) => {
    if (!window.confirm(`¿Eliminar turno "${row.nombre}"?`)) return;
    try {
      await turnosConfigAPI.eliminar(row.id);
      cargar();
    } catch {
      alert('Error al eliminar');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'objetivo_nombre',
      label: 'Objetivo',
      render: (_, row) => row.objetivo_nombre || `ID ${row.id_objetivo}`,
    },
    { key: 'nombre', label: 'Nombre' },
    { key: 'hora_inicio', label: 'Inicio', render: (v) => v?.slice(0, 5) },
    { key: 'hora_fin', label: 'Fin', render: (v) => v?.slice(0, 5) },
    { key: 'duracion_horas', label: 'Duración (hs)' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Configuración de Turnos</h1>
        <Button onClick={abrirCrear}>+ Nuevo Turno</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Table columns={columns} data={data} onEdit={abrirEditar} onDelete={eliminar} loading={loading} emptyMessage="No hay turnos configurados" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar Turno' : 'Nuevo Turno'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Objetivo <span className="text-red-500">*</span>
            </label>
            <select
              name="id_objetivo"
              value={form.id_objetivo}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar objetivo</option>
              {objetivos.map((o) => (
                <option key={o.id} value={o.id}>{o.nombre}</option>
              ))}
            </select>
          </div>

          <Input label="Nombre del Turno" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: Turno Mañana" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hora Inicio" name="hora_inicio" type="time" value={form.hora_inicio} onChange={handleChange} required />
            <Input label="Hora Fin" name="hora_fin" type="time" value={form.hora_fin} onChange={handleChange} required />
          </div>
          <div className="bg-blue-50 text-blue-700 text-xs rounded-lg px-3 py-2">
            Duración calculada automáticamente según hora inicio y fin
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
