
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
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!errorMessage) return

    const timer = setTimeout(() => {
      setErrorMessage('')
    }, 4000)

    return () => clearTimeout(timer)
  }, [errorMessage])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (errorMessage) {
      setErrorMessage('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isLoading) return

    const username = formData.username.trim()

    if (!username || !formData.password) {
      setErrorMessage('Veuillez remplir tous les champs.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/token/',
        {
          username,
          password: formData.password,
        }
      )

      localStorage.setItem('access', response.data.access)
      localStorage.setItem('refresh', response.data.refresh)

      const profileResponse = await api.get(
        'accounts/profile/'
      )

      const user = profileResponse.data

      localStorage.setItem('role', user.role)

      if (user.role === 'student') {
        navigate('/student/dashboard')
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard')
      } else if (user.role === 'admin_staff') {
        navigate('/admin/dashboard')
      } else {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('role')

        setErrorMessage(
          'Votre rôle ne permet pas d’accéder à cette application.'
        )
      }
    } catch (error) {
      console.error('Login error:', error)

      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('role')

      if (!error.response) {
        setErrorMessage(
          'Serveur inaccessible. Veuillez réessayer.'
        )
      } else if (
        error.response.status === 401 ||
        error.response.status === 400
      ) {
        setErrorMessage(
          'Nom d’utilisateur ou mot de passe invalide.'
        )
      } else {
        setErrorMessage(
          'Une erreur est survenue. Veuillez réessayer.'
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7f4] px-4 py-8 sm:px-8 lg:p-10">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-teal-200/40 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(#064e3b 1px, transparent 1px)',
            backgroundSize: '25px 25px',
          }}
        />
      </div>

      <main className="relative z-10 w-full max-w-6xl">
        <div className="grid overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl shadow-emerald-950/10 lg:min-h-[620px] lg:grid-cols-2">

          {/* Branding panel */}
          <section className="relative flex min-h-[230px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#08634b] to-[#0d7660] p-7 text-white sm:p-10 lg:p-12">

            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/[0.04]" />

            <div className="relative">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1.5">
                  <img
                    src={logo}
                    alt="Logo ISCAE"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold tracking-wide">
                    ISCAE
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-100">
                    Espace universitaire
                  </p>
                </div>
              </div>
            </div>

            <div className="relative my-10 lg:my-0">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M3 9.5 12 4l9 5.5-9 5.5-9-5.5Z" />
                  <path d="M7 12v5c3 2.5 7 2.5 10 0v-5" />
                  <path d="M21 10v6" />
                </svg>
              </div>

              <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.7rem]">
                Votre espace
                <span className="mt-1 block text-emerald-200">
                  universitaire.
                </span>
              </h2>

              <p className="mt-4 text-sm text-emerald-50/80">
                Résultats et évaluations, au même endroit.
              </p>

              <div className="mt-7 flex items-center gap-3">
                <span className="h-1.5 w-8 rounded-full bg-white" />
                <span className="h-1.5 w-3 rounded-full bg-white/35" />
                <span className="h-1.5 w-3 rounded-full bg-white/35" />
              </div>
            </div>

            <div className="relative hidden border-t border-white/15 pt-5 lg:block">
              <p className="text-xs text-emerald-100/75">
                Institut Supérieur de Comptabilité et
                d’Administration des Entreprises
              </p>
            </div>
          </section>

          {/* Login panel */}
          <section className="flex items-center justify-center bg-gradient-to-b from-white to-slate-50/70 px-6 py-10 sm:px-10 sm:py-12 lg:px-14">

            <div className="w-full max-w-md">

              <div className="mb-9">
                <div className="mb-5 h-1 w-12 rounded-full bg-emerald-700" />

                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                  Espace sécurisé
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.15rem]">
                  Connexion
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Accédez à votre espace personnel.
                </p>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
                >
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4m0 4h.01" />
                  </svg>

                  <p className="flex-1">{errorMessage}</p>

                  <button
                    type="button"
                    onClick={() => setErrorMessage('')}
                    aria-label="Fermer le message d'erreur"
                    className="rounded-md px-1 font-semibold hover:bg-red-100"
                  >
                    ×
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Nom d’utilisateur
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                      </svg>
                    </div>

                    <input
                      id="username"
                      type="text"
                      name="username"
                      placeholder="Nom d’utilisateur"
                      value={formData.username}
                      onChange={handleChange}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      disabled={isLoading}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Mot de passe
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        aria-hidden="true"
                      >
                        <rect x="4" y="10" width="16" height="11" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                        <path d="M12 14v3" />
                      </svg>
                    </div>

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                      disabled={isLoading}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword
                          ? 'Masquer le mot de passe'
                          : 'Afficher le mot de passe'
                      }
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3.5 text-slate-400 transition hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700"
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          aria-hidden="true"
                        >
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.9 5.2A11 11 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.3 3.3" />
                          <path d="M6.2 6.2C3.9 7.8 2.7 10 2.5 12c1 2.5 4.5 7 9.5 7 1.3 0 2.5-.3 3.5-.8" />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          aria-hidden="true"
                        >
                          <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-4 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-lg hover:shadow-emerald-900/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-25"
                        />
                        <path
                          d="M21 12a9 9 0 0 0-9-9"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Security note */}
              <div className="mt-7 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    aria-hidden="true"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>

                <p className="text-xs text-slate-500">
                  Accès réservé aux utilisateurs autorisés.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
