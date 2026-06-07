import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import ScreenDetails from './pages/ScreenDetails';
import Player from './pages/Player';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Player Route */}
        <Route path="/player/:clientSlug/:screenSlug" element={<Player />} />
        <Route path="/player" element={<Player />} />

        {/* Admin Routes with Layout */}
        <Route path="/" element={<AdminLayout />}>
          {/* Redirect / to /clients by default */}
          <Route index element={<Navigate to="/clients" replace />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:clientId" element={<ClientDetails />} />
          <Route path="clients/:clientId/screens/:screenId" element={<ScreenDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
