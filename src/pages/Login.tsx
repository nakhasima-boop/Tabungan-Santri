import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Lock, User, GraduationCap, ShieldCheck } from 'lucide-react';
import { Button, Input, Label, Card, cn } from '../components/ui';
import { motion } from 'motion/react';
import { getSiswa } from '../lib/api';

export default function LoginPage() {
  const [role, setRole] = useState<'admin' | 'siswa'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nis, setNis] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (role === 'admin') {
        if (username === 'admin' && password === 'admin123') {
          const userData = { role: 'admin', name: 'Administrator', username: 'admin' };
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('user', JSON.stringify(userData));
          navigate('/');
        } else {
          setError('Username atau password salah');
        }
      } else {
        // Siswa Login logic
        const response = await getSiswa();
        
        // Safety check: ensure response is an array
        const studentList = Array.isArray(response) ? response : [];
        if (!Array.isArray(response) && response?.error) {
          throw new Error(response.error);
        }

        const found = studentList.find(s => String(s.nis).trim() === nis.trim());
        if (found) {
          const userData = { 
            role: 'siswa', 
            name: found.nama, 
            id_siswa: found.id_siswa,
            nis: found.nis,
            kelas: found.kelas
          };
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('user', JSON.stringify(userData));
          navigate('/');
        } else {
          setError('Nomor Induk Siswa (NIS) tidak ditemukan');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10 group">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
            <div className="bg-slate-900 text-emerald-400 p-6 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-emerald-500/30 relative z-10 transition-transform group-hover:scale-110">
              <Wallet size={40} fill="currentColor" fillOpacity={0.2} />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tighter">SANTRI<span className="text-emerald-600">CASH</span></h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-2">Future Finance Ecosystem</p>
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-xl mb-6">
          <button 
            onClick={() => { setRole('admin'); setError(''); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest",
              role === 'admin' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <ShieldCheck size={14} />
            Admin
          </button>
          <button 
            onClick={() => { setRole('siswa'); setError(''); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest",
              role === 'siswa' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <GraduationCap size={14} />
            Santri
          </button>
        </div>

        <Card className="p-8 border-slate-100 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {role === 'admin' ? (
              <>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-slate-300" size={16} />
                    <Input
                      className="pl-10 bg-slate-50 border-transparent focus:bg-white focus:border-sky-300"
                      placeholder="Input username admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-slate-300" size={16} />
                    <Input
                      type="password"
                      className="pl-10 bg-slate-50 border-transparent focus:bg-white focus:border-sky-300"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Nomor Induk Santri (NIS)</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-2.5 text-slate-300" size={16} />
                  <Input
                    className="pl-10 bg-slate-50 border-transparent focus:bg-white focus:border-sky-300"
                    placeholder="Masukkan NIS Anda"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mt-4">Login menggunakan NIS untuk melihat saldo & riwayat</p>
              </div>
            )}

            {error && (
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center">{error}</p>
            )}

            <Button disabled={loading} type="submit" className="w-full py-6 text-xs uppercase tracking-widest font-bold">
              {loading ? 'Memverifikasi...' : 'Login'}
            </Button>
          </form>
        </Card>
        
        <p className="mt-8 text-center text-xs text-slate-300 uppercase tracking-widest font-bold">
          © 2026 Sitabung Geometric v2.2
        </p>
      </motion.div>
    </div>
  );
}
