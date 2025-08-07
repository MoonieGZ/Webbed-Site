import { useState } from "react"

export function useLogout() {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleCancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  const handleConfirmLogout = async () => {
    setLogoutDialogOpen(false);
    await handleLogout();
  };

  return {
    logoutDialogOpen,
    setLogoutDialogOpen,
    handleLogoutClick,
    handleCancelLogout,
    handleConfirmLogout,
  }
}
