import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { useAuth } from '../../context/AuthContext'; // keep your existing context

export default function DashboardLayout({ roomId, isConnected, collaborators }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onLogout={logout} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          roomId={roomId}
          isConnected={isConnected}
          collaborators={collaborators}
          user={user}
        />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}