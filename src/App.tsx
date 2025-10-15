
import { Route, Routes } from 'react-router-dom'
import HomePage from './home'
import { Dashboard } from './components/dashboard'
import { ProtectedRoute } from './components/ProtectedRoute';
import { Profile } from './components/profile';

import { MedicineManagement } from './components/medicine-management';
import { POSSystem } from './components/pos-system';
import { UserManagement } from './components/user-management';
import { SoldMedicines } from './pos/sold-medicines';
import { AnalyticsDashboard } from './components/analytics-dashboard';
import InvoicePage from './components/invoice';
import NetworkStatus from './components/NetworkStatus';

function App() {

  return (
    <>
      <NetworkStatus/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pos" element={<POSSystem />} />
          <Route path="/sold-medicines" element={<SoldMedicines />} />
          <Route path="/medicines" element={<MedicineManagement />} />
          <Route path="/reports" element={<AnalyticsDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/invoice" element={<InvoicePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App
