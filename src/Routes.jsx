import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import AdminDashboard from './pages/admin-dashboard';
import CompanySettings from './pages/admin-dashboard/CompanySettings';
import ContractManagement from './pages/contract-management';
import DJManagement from './pages/dj-management';
import EventCalendar from './pages/event-calendar';
import FinancialTracking from './pages/financial-tracking';
import ProducerDashboard from './pages/producer-dashboard';
import ProducerManagement from './pages/producer-management/index.jsx';
import DJProfile from './pages/dj-profile';
import { AuthProvider } from './contexts/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Dashboard Routes - Accessible in development mode */}
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/producer-dashboard" element={<ProducerDashboard />} />
            
            {/* Management Routes */}
            <Route path="/contract-management" element={<ContractManagement />} />
            <Route path="/dj-management" element={<DJManagement />} />
            <Route path="/dj-profile/:djId" element={<DJProfile />} />
            <Route path="/event-calendar" element={<EventCalendar />} />
            <Route path="/financial-tracking" element={<FinancialTracking />} />
            <Route path="/company-settings" element={<CompanySettings />} />
            <Route path="/producer-management" element={<ProducerManagement />} />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
