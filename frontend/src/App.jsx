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

import CollectesPage from './pages/admin/CollectesPage'

import CollecteNotesPage from './pages/admin/CollecteNotesPage'
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
          path="/teacher/collectes/:id/notes"
          element={<CollecteNotesPage />}
        />
      </Routes>

    </BrowserRouter>
  )
}