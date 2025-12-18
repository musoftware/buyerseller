
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import GigDetail from './pages/GigDetail';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';
import GigCreation from './pages/GigCreation';
import { UserRole } from './types';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('BUYER');

  return (
    <Router>
      <Layout userRole={role} onSwitchRole={setRole}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/gig/:id" element={<GigDetail />} />
          <Route path="/dashboard" element={<Dashboard role={role} />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/create-gig" element={<GigCreation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
