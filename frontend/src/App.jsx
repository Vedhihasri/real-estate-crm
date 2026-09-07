import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetails from "./pages/LeadDetails";
import Properties from "./pages/Properties";
import Bookings from "./pages/Bookings";
import Employees from "./pages/Employees";

import DashboardLayout from "./layouts/DashboardLayout";


function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function AdminRoute({ children }) {
  const { user } = useAuth();

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


function AppRoutes() {
  return (
    <Routes>

      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />


      {/* Protected Application */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* Leads */}
        <Route
          path="/leads"
          element={<Leads />}
        />

        <Route
          path="/leads/:id"
          element={<LeadDetails />}
        />


        {/* Properties */}
        <Route
          path="/properties"
          element={<Properties />}
        />


        {/* Bookings */}
        <Route
          path="/bookings"
          element={<Bookings />}
        />


        {/* Employees - ADMIN ONLY */}
        <Route
          path="/employees"
          element={
            <AdminRoute>
              <Employees />
            </AdminRoute>
          }
        />

      </Route>


      {/* Default */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />

    </Routes>
  );
}


export default function App() {
  return (
    <BrowserRouter>

      <AuthProvider>
        <AppRoutes />
      </AuthProvider>

    </BrowserRouter>
  );
}