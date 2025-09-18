import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from './contexts/AuthContext';

const AdminDashboard = lazy(() => import('./pages/admin-dashboard'));
const CompanySettings = lazy(() => import('./pages/admin-dashboard/CompanySettings'));
const ContractManagement = lazy(() => import('./pages/contract-management'));
const DJManagement = lazy(() => import('./pages/dj-management'));
const EventCalendar = lazy(() => import('./pages/event-calendar'));
const FinancialTracking = lazy(() => import('./pages/financial-tracking'));
const ProducerDashboard = lazy(() => import('./pages/producer-dashboard'));
const ProducerManagement = lazy(() => import('./pages/producer-management/index.jsx'));
const DJProfile = lazy(() => import('./pages/dj-profile'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const NotFound = lazy(() => import('./pages/NotFound'));
const SharedMedia = lazy(() => import('./pages/share/SharedMedia'));

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <ScrollToTop />
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <RouterRoutes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/share/:token" element={<SharedMedia />} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/producer-dashboard" element={<ProtectedRoute><ProducerDashboard /></ProtectedRoute>} />
              <Route path="/contract-management" element={<ProtectedRoute><ContractManagement /></ProtectedRoute>} />
              <Route path="/dj-management" element={<ProtectedRoute><DJManagement /></ProtectedRoute>} />
              <Route path="/dj-profile/:djId" element={<ProtectedRoute><DJProfile /></ProtectedRoute>} />
              <Route path="/event-calendar" element={<ProtectedRoute><EventCalendar /></ProtectedRoute>} />
              <Route path="/financial-tracking" element={<ProtectedRoute><FinancialTracking /></ProtectedRoute>} />
              <Route path="/company-settings" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
              <Route path="/producer-management" element={<ProtectedRoute><ProducerManagement /></ProtectedRoute>} />
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </RouterRoutes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
