import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

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
          element={<StudentDashboard />}
        />

        <Route
          path="/teacher/dashboard"
          element={<TeacherDashboard />}
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="/admin/collectes"
          element={<CollectesPage />}
        />
        <Route
          path="/admin/users"
          element={<UsersPage />}
        />
        <Route
          path="/admin/collectes/:id/notes"
          element={<CollecteNotesPage />}
        />
        <Route
          path="/admin/filieres"
          element={<FilieresPage />}
        />
        <Route
          path="/admin/modules"
          element={<ModulesPage />}
        />
        <Route
          path="/admin/matieres"
          element={<MatieresPage />}
        />
        <Route
            path="/teacher/collectes"
            element={<TeacherCollectesPage />}
        />

        <Route
            path="/teacher/collectes/:id/notes"
            element={<TeacherCollecteNotesPage />}
        />
      </Routes>

    </BrowserRouter>
  )
}