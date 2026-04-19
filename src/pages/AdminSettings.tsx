import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, Input, Label } from '../components/ui';
import { getAdmins, updateAdmin, addAdmin } from '../lib/api';
import { ShieldCheck, User, Lock, Plus, UserPlus, Save, Key, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : { username: 'admin', name: 'Administrator' };

  // Profile Edit State
  const [profileData, setProfileData] = useState({ name: currentUser.name || '' });
  // Password Edit State
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  // New Admin State
  const [newAdmin, setNewAdmin] = useState({ username: '', name: '', password: '' });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAdmins();
      setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updateAdmin({ username: currentUser.username || 'admin', newNama: profileData.name });
      
      // Update local storage
      const newUser = { ...currentUser, name: profileData.name };
      localStorage.setItem('user', JSON.stringify(newUser));
      
      alert('Nama administrator berhasil diperbarui');
      window.location.reload(); // Refresh to update layout names
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui nama');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Konfirmasi sandi tidak cocok');
      return;
    }
    try {
      setSubmitting(true);
      await updateAdmin({ username: currentUser.username || 'admin', newPassword: passwordData.newPassword });
      alert('Kata sandi berhasil diperbarui');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui kata sandi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await addAdmin(newAdmin);
      setShowAddModal(false);
      fetchAdmins();
      setNewAdmin({ username: '', name: '', password: '' });
      alert('Administrator baru berhasil ditambahkan');
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan administrator');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="relative p-10 rounded-[2.5rem] bg-slate-900 overflow-hidden text-white shadow-2xl">
          <div className="gradient-blur opacity-50 bg-emerald-500/20" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 w-fit rounded-full backdrop-blur-sm border border-white/10">
                <ShieldCheck size={12} className="text-emerald-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">System Governance v3.2</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Pengaturan Administrator</h1>
              <p className="text-slate-400 max-w-lg text-sm leading-relaxed">Kelola identitas operator, amankan akses akun, dan tambahkan administrator baru ke dalam ekosistem sistem.</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setShowAddModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 py-6 h-auto font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all gap-2">
                <Plus size={18} />
                Tambah Admin
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Edit Profile Section */}
          <Card className="p-10 border-slate-100 rounded-[2.5rem] shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
              <User size={120} />
            </div>
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                  <User size={22} />
               </div>
               <div>
                  <h3 className="text-xl font-display font-bold text-slate-900 leading-none">Profil Operator</h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Ubah identitas tampilan Anda</p>
               </div>
            </div>
            
            <form onSubmit={handleUpdateName} className="space-y-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Username (ID Akun)</Label>
                  <Input 
                    disabled 
                    value={currentUser.username || 'admin'} 
                    className="h-12 bg-slate-50 border-transparent text-slate-400 font-mono italic"
                  />
                  <p className="text-[9px] text-slate-400 font-medium">Username bersifat permanen dan tidak dapat diubah oleh sistem.</p>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nama Lengkap Administrator</Label>
                  <Input 
                    required 
                    value={profileData.name}
                    onChange={(e) => setProfileData({ name: e.target.value })}
                    placeholder="Contoh: Super Admin"
                    className="h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-sky-500 rounded-xl"
                  />
               </div>
               <Button 
                 type="submit" 
                 disabled={submitting}
                 className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] flex gap-2 justify-center"
               >
                 <Save size={14} />
                 Simpan Perubahan Nama
               </Button>
            </form>
          </Card>

          {/* Change Password Section */}
          <Card className="p-10 border-slate-100 rounded-[2.5rem] shadow-sm bg-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                <Lock size={120} />
             </div>
             <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Key size={22} />
               </div>
               <div>
                  <h3 className="text-xl font-display font-bold text-slate-900 leading-none">Koneksi Keamanan</h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Perkuat akses login akun Anda</p>
               </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kata Sandi Baru</Label>
                  <Input 
                    type="password"
                    required 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-emerald-500 rounded-xl"
                  />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Konfirmasi Kata Sandi</Label>
                  <Input 
                    type="password"
                    required 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-emerald-500 rounded-xl"
                  />
               </div>
               <Button 
                 type="submit" 
                 disabled={submitting}
                 className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] flex gap-2 justify-center shadow-lg shadow-emerald-100"
               >
                 <Lock size={14} />
                 Perbarui Kata Sandi
               </Button>
            </form>
          </Card>
        </div>

        {/* Admin List Section */}
        <Card className="p-0 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden bg-white">
           <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <div className="space-y-1">
                 <h3 className="text-xl font-display font-bold text-slate-900">Daftar Administrator Sistem</h3>
                 <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Memiliki akses penuh ke manajemen keuangan</p>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                 <ShieldCheck size={20} />
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identitas Akun</th>
                       <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Operator</th>
                       <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hak Akses</th>
                       <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                 </thead>
                 <tbody>
                    {loading ? (
                       Array(3).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                             <td colSpan={4} className="px-10 py-8"><div className="h-4 bg-slate-100 rounded w-1/2"></div></td>
                          </tr>
                       ))
                    ) : (
                       admins.map((adm) => (
                          <tr key={adm.username} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs">
                                      {adm.name?.charAt(0)}
                                   </div>
                                   <div className="font-bold text-slate-800 text-sm">{adm.name}</div>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded italic">@{adm.username}</span>
                             </td>
                             <td className="px-10 py-8">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-3 py-1 rounded-full">{adm.role} Access</span>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <div className="flex items-center justify-end gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                   <CheckCircle2 size={12} />
                                   Koneksi Aktif
                                </div>
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </Card>

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md"
              >
                <Card className="p-10 relative rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                     <UserPlus size={120} />
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                  <h2 className="text-2xl font-display font-bold mb-10 text-slate-900 border-b border-slate-100 pb-4">Registrasi Administrator</h2>
                  <form onSubmit={handleAddAdmin} className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Username ID</Label>
                       <Input 
                         required 
                         value={newAdmin.username}
                         onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                         placeholder="Contoh: admin2"
                         className="h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-sky-500 rounded-xl"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nama Lengkap</Label>
                       <Input 
                         required 
                         value={newAdmin.name}
                         onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                         placeholder="Contoh: Al-Amin"
                         className="h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-sky-500 rounded-xl"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Setup Kata Sandi</Label>
                       <Input 
                         type="password"
                         required 
                         value={newAdmin.password}
                         onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                         placeholder="••••••••"
                         className="h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-sky-500 rounded-xl"
                       />
                    </div>
                    <div className="pt-8 flex gap-4">
                      <Button type="button" variant="secondary" className="flex-1 py-6 bg-slate-100 border-none text-slate-500 font-bold uppercase tracking-widest text-xs rounded-2xl" onClick={() => setShowAddModal(false)}>Batal</Button>
                      <Button type="submit" disabled={submitting} className="flex-1 py-6 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl">Konfirmasi Admin</Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
