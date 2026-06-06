import { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import axios from 'axios'

import api from '../../services/api'
import logo from '../../assets/logo-iscae.png'

export default function Login() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [errorMessage, setErrorMessage] = useState('')


  useEffect(() => {

    if (errorMessage) {

      const timer = setTimeout(() => {

        setErrorMessage('')

      }, 1500)

      return () => clearTimeout(timer)
    }

  }, [errorMessage])


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }


  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      setErrorMessage('')


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


      const profileResponse = await api.get(
        'accounts/profile/'
      )

      const user = profileResponse.data

      console.log(user)


      localStorage.setItem(
        'role',
        user.role
      )


      if (user.role === 'student') {

        navigate('/student/dashboard')

      } else if (user.role === 'teacher') {

        navigate('/teacher/dashboard')

      } else if (user.role === 'admin_staff') {

        navigate('/admin/dashboard')
      }

    } catch (error) {

      console.log(error)

      setErrorMessage(
        'Nom d’utilisateur ou mot de passe invalide'
      )
    }
  }


  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
        <img
            src={logo}
            alt="Logo ISCAE"
            className="w-24 h-24 mx-auto mb-4 object-contain"
        />

        <h1 className="text-4xl font-bold text-center mb-8">
        Connexion
        </h1>

        {errorMessage && (

          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">

            {errorMessage}

          </div>
        )}


        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="text"
            name="username"
            placeholder="Nom d’utilisateur"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <button
            className="w-full bg-black text-white p-3 rounded-lg"
          >
            Se connecter
          </button>

        </form>

      </div>

    </div>
  )
}