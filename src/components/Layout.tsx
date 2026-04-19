import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  ArrowLeftRight, 
  LogOut, 
  Wallet,
  LayoutDashboard,
  GraduationCap,
  FileText,
  Settings
} from 'lucide-react';
import { cn } from './ui';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: GraduationCap, label: 'Santri', path: '/siswa' },
  { icon: ArrowLeftRight, label: 'Transaksi', path: '/transaksi' },
  { icon: FileText, label: 'Laporan', path: '/laporan' },
  { icon: Settings, label: 'Pengaturan', path: '/pengaturan', adminOnly: true },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { role: 'admin', name: 'Administrator' };
  const role = user.role;

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => {
    if (role === 'admin') return true;
    return item.path === '/' && !item.adminOnly;
  });

  return (
    <div className="w-60 h-screen border-r border-slate-200 bg-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8 pt-10 flex items-center gap-3 group">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
          <div className="bg-slate-900 text-emerald-400 p-3 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/30 relative z-10 transition-transform group-hover:scale-110">
            <Wallet size={20} fill="currentColor" fillOpacity={0.2} />
          </div>
        </div>
        <span className="font-display font-bold text-slate-800 text-xl tracking-tighter">SANTRI<span className="text-emerald-600">CASH</span></span>
      </div>
      
      <nav className="flex-1 px-4 mt-6">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all mb-1",
              isActive 
                ? "bg-sky-50 text-sky-700" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={cn("transition-opacity", isActive ? "opacity-100" : "opacity-70")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100 mt-auto">
        <div className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest px-1">
          {role === 'admin' ? 'Operator' : 'Santri'}
        </div>
        <div className="flex items-center gap-3 px-1 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
            {user.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-700 truncate">{user.name}</div>
            <div className="text-xs text-slate-500 truncate">{role === 'admin' ? 'Admin Utama' : user.nis || 'Pelajar'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-semibold text-slate-400 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans">
      <Sidebar />
      <main className="flex-1 ml-60 flex flex-col">
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Dashboard Utama</h1>
          </div>
          <div className="flex gap-4">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold font-display text-slate-800 leading-none">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Status Sistem Aktif</div>
            </div>
          </div>
        </header>
        <div className="p-10 pb-20">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
