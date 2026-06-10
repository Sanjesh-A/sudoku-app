import { useAuth0 } from '@auth0/auth0-react'
import './UserMenu.css'

export function UserMenu() {
  const { user, logout } = useAuth0()

  if (!user) return null

  return (
    <div className="user-menu">
      <span className="user-name">{user.name ?? user.email ?? 'Signed in'}</span>
      <button
        type="button"
        className="logout-btn"
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      >
        Sign out
      </button>
    </div>
  )
}