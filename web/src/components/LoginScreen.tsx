import { useAuth0 } from '@auth0/auth0-react'
import './LoginScreen.css'

export function LoginScreen() {
  const { loginWithRedirect } = useAuth0()

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Sudoku</h1>
        <p>Sign in to save your progress and view your history across devices.</p>
        <button
          type="button"
          className="login-btn"
          onClick={() => loginWithRedirect()}
        >
          Sign in
        </button>
      </div>
    </div>
  )
}