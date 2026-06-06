import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          {/* Redirect / to /clients by default */}
          <Route index element={<Navigate to="/clients" replace />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:clientId" element={<ClientDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
