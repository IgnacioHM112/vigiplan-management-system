import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Planificacion from './pages/Planificacion';
import ObjetivosPuestos from './pages/ObjetivosPuestos';
import TurnosConfig from './pages/TurnosConfig';
import Vigiladores from './pages/Vigiladores';
import Requerimientos from './pages/Requerimientos';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/planificacion" element={<Planificacion />} />
          <Route path="/objetivos-puestos" element={<ObjetivosPuestos />} />
          <Route path="/turnos" element={<TurnosConfig />} />
          <Route path="/vigiladores" element={<Vigiladores />} />
          <Route path="/requerimientos" element={<Requerimientos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
