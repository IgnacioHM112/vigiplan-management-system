import { useState, useEffect } from 'react';
import { vigiladoresAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';

const emptyForm = { nombre: '', legajo: '', max_horas_mensuales: '', activo: 1 };

export default function Vigiladores() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const cargar = () => {
    setLoading(true);
    vigiladoresAPI.listar()
      .then((res) => setData(res.data))
      .catch(() => alert('Error al cargar vigiladores'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const abrirEditar = (row) => {
    setEditando(row);
    setForm({
      nombre: row.nombre,
      legajo: row.legajo,
      max_horas_mensuales: row.max_horas_mensuales,
      activo: row.activo,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await vigiladoresAPI.actualizar(editando.id, form);
      } else {
        await vigiladoresAPI.crear(form);
      }
      setModalOpen(false);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar');
    }
  };

  const eliminar = async (row) => {
    if (!window.confirm(`¿Eliminar a "${row.nombre}"?`)) return;
    try {
      await vigiladoresAPI.eliminar(row.id);
      cargar();
    } catch {
      alert('Error al eliminar');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'legajo', label: 'Legajo' },
    { key: 'max_horas_mensuales', label: 'Máx. Horas' },
    {
      key: 'activo',
      label: 'Estado',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {val ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Vigiladores</h1>
        <Button onClick={abrirCrear}>+ Nuevo</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Table columns={columns} data={data} onEdit={abrirEditar} onDelete={eliminar} loading={loading} emptyMessage="No hay vigiladores registrados" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar Vigilador' : 'Nuevo Vigilador'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          <Input label="Legajo" name="legajo" value={form.legajo} onChange={handleChange} required />
          <Input label="Máx. Horas Mensuales" name="max_horas_mensuales" type="number" step="0.5" value={form.max_horas_mensuales} onChange={handleChange} required />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Activo</label>
            <input type="checkbox" name="activo" checked={!!form.activo} onChange={(e) => setForm((prev) => ({ ...prev, activo: e.target.checked ? 1 : 0 }))} className="w-4 h-4" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">{editando ? 'Guardar Cambios' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
