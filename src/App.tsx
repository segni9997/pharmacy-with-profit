
import { Route, Routes } from 'react-router-dom'
import HomePage from './home'
import { Dashboard } from './components/dashboard'
import { ProtectedRoute } from './components/ProtectedRoute';
import { Profile } from './components/profile';

import { MedicineManagement } from './components/medicine-management';
import { POSSystem } from "./components/pos-system";
import { UserManagement } from './components/user-management';
import { AnalyticsDashboard } from './components/analytics-dashboard';
import NetworkStatus from './components/NetworkStatus';
import SalesDetailPage from './pos/sold-medicines';
import InvoiceDisplay from './components/Invoice2';
import NotFound from './components/pageNotfoun404';
import AlertsPage from './components/alertPage';

function App() {

  return (
    <>
      <NetworkStatus />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pos" element={<POSSystem />} />
          <Route path="/sold-medicines" element={<SalesDetailPage />} />
          <Route path="/medicines" element={<MedicineManagement />} />
          <Route path="/reports" element={<AnalyticsDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/invoice" element={<InvoiceDisplay />} />
          <Route path='/alert' element={<AlertsPage/>}/>
          <Route path= "*" element= {<NotFound/>} />
        </Route>
      </Routes>
      {/* <FloatingSettingsWidget /> */}
    
    </>
  );
}

export default App
