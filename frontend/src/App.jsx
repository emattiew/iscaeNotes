import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/auth/Login'

import StudentDashboard from './pages/student/StudentDashboard'

import TeacherDashboard from './pages/teacher/TeacherDashboard'

import AdminDashboard from './pages/admin/AdminDashboard'

import UsersPage from './pages/admin/UsersPage'

import FilieresPage from './pages/admin/FilieresPage'

import CollectesPage from './pages/admin/CollectesPage'

import ModulesPage from './pages/admin/ModulesPage'

import MatieresPage from './pages/admin/MatieresPage'

import CollecteNotesPage from './pages/admin/CollecteNotesPage'

import TeacherCollectesPage from './pages/teacher/TeacherCollectesPage'

import TeacherCollecteNotesPage from './pages/teacher/TeacherCollecteNotesPage'

import TeacherReclamationsPage from './pages/teacher/TeacherReclamationsPage'
export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">

              <StudentDashboard />

            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute role="teacher">

              <TeacherDashboard />

            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/collectes"
          element={
            <ProtectedRoute role="teacher">

              <TeacherCollectesPage />

            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/collectes/:id/notes"
          element={
            <ProtectedRoute role="teacher">

              <TeacherCollecteNotesPage />

            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin_staff">

              <AdminDashboard />

            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/collectes"
          element={
            <ProtectedRoute role="admin_staff">

              <CollectesPage />

            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/collectes/:id/notes"
          element={
            <ProtectedRoute role="admin_staff">

              <CollecteNotesPage />

            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/reclamations"
          element={
            <ProtectedRoute role="teacher">

              <TeacherReclamationsPage />

            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin_staff">

              <UsersPage />

            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/filieres"
          element={
            <ProtectedRoute role="admin_staff">

              <FilieresPage />

            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/modules"
          element={
            <ProtectedRoute role="admin_staff">

              <ModulesPage />

            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/matieres"
          element={
            <ProtectedRoute role="admin_staff">

              <MatieresPage />

            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  )
}