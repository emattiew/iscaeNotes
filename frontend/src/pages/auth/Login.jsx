import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import axios from 'axios'

import api from '../../services/api'


export default function Login() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }


  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      // LOGIN

      const response = await axios.post(
        'http://127.0.0.1:8000/api/token/',
        formData
      )

      localStorage.setItem(
        'access',
        response.data.access
      )

      localStorage.setItem(
        'refresh',
        response.data.refresh
      )


      // FETCH PROFILE

      const profileResponse = await api.get(
        'accounts/profile/'
      )

      const user = profileResponse.data

      console.log(user)


      // REDIRECT BASED ON ROLE

      if (user.role === 'student') {

        navigate('/student/dashboard')

      } else if (user.role === 'teacher') {

        navigate('/teacher/dashboard')

      } else if (user.role === 'admin_staff') {

        navigate('/admin/dashboard')
      }

    } catch (error) {

      console.log(error)

      alert('Invalid username or password')
    }
  }


  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">

        <h1 className="text-4xl font-bold text-center mb-8">
          ISCAE Platform
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <button
            className="w-full bg-black text-white p-3 rounded-lg"
          >
            Login
          </button>

        </form>

      </div>

    </div>
  )
}