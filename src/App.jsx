import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import CheckedOut from './pages/CheckedOut';
import Scanner from './pages/Scanner';
import Transactions from './pages/Transactions';
import Users from './pages/Users';

// Smart redirect based on user role
function RoleBasedRedirect() {
  const { user } = useAuth();
  
  // Redirect user-admin to Users page, others to Dashboard
  if (user?.role === 'user-admin') {
    return <Navigate to="/users" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<RoleBasedRedirect />} />
            <Route 
              path="dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                  <Dashboard />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="items" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                  <Items />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="checked-out" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                  <CheckedOut />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="scanner" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                  <Scanner />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="transactions" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                  <Transactions />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="users" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'user-admin']}>
                  <Users />
                </RoleProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
