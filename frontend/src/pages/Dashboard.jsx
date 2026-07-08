import { useState, useEffect } from 'react';
import { objetivosAPI, puestosAPI, turnosConfigAPI, vigiladoresAPI } from '../services/api';

const cards = [
  { label: 'Objetivos', key: 'objetivos', icon: '🏢', color: 'bg-blue-500' },
  { label: 'Vigiladores', key: 'vigiladores', icon: '👤', color: 'bg-green-500' },
  { label: 'Turnos Config.', key: 'turnos', icon: '🕒', color: 'bg-purple-500' },
  { label: 'Puestos', key: 'puestos', icon: '📍', color: 'bg-amber-500' },
];

export default function Dashboard() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    Promise.all([
      objetivosAPI.listar(),
      puestosAPI.listar(),
      turnosConfigAPI.listar(),
      vigiladoresAPI.listar(),
    ]).then(([obj, pue, tur, vig]) => {
      setCounts({
        objetivos: obj.data.length,
        puestos: pue.data.length,
        turnos: tur.data.length,
        vigiladores: vig.data.length,
      });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center text-2xl`}>
              {c.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{counts[c.key] ?? '...'}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-2">Bienvenido al Sistema de Gestión de Turnos</h2>
        <p className="text-sm text-gray-500">
          Usá el menú lateral para navegar entre las secciones y administrar los datos del sistema.
        </p>
      </div>
    </div>
  );
}
