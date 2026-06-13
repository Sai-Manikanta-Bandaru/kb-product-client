import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import ScreenDetails from './pages/ScreenDetails';
import Player from './pages/Player';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Player Route */}
        <Route path="/player/:clientSlug/:screenSlug" element={<Player />} />
        <Route path="/player" element={<Player />} />

        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes with Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
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
