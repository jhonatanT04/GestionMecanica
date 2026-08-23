import { useEffect, useState, type ReactNode } from 'react'
import { getSession, setSession, clearSession, subscribeSession, type Session } from './session'
import { login as loginRequest } from '../services/authService'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => getSession())

  useEffect(() => subscribeSession(setSessionState), [])

  async function login(email: string, password: string) {
    const { token, usuario } = await loginRequest(email, password)
    setSession({ token, usuario })
  }

  function logout() {
    clearSession()
  }

  return <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>
}
