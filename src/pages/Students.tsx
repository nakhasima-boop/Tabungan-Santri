import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, Input, Label } from '../components/ui';
import { getSiswa, addSiswa, updateSiswa, deleteSiswa } from '../lib/api';
import { Plus, Edit2, Trash2, Search, X, Contact2, Camera, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MemberCard } from '../components/MemberCard';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({ nis: '', nama: '', kelas: '', foto: '' });
  const [search, setSearch] = useState('');
  const [viewingCard, setViewingCard] = useState<any>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getSiswa({ q: search });
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingStudent) {
        await updateSiswa({ id_siswa: editingStudent.id_siswa, ...formData });
      } else {
        await addSiswa(formData);
      }
      setShowModal(false);
      fetchStudents();
      setFormData({ nis: '', nama: '', kelas: '', foto: '' });
      setEditingStudent(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data ke Google Sheets');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('⚠️ PERINGATAN: Menghapus data santri juga akan menghapus seluruh riwayat tabungan yang berkaitan. Lanjutkan?')) {
      try {
        setLoading(true);
        await deleteSiswa(id);
        fetchStudents();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus data dari Google Sheets');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('Foto terlalu besar (maksimal 1MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="space-y-10">
        {/* Elegant Hero Header */}
        <div className="relative p-10 rounded-[2.5rem] bg-slate-900 overflow-hidden text-white shadow-2xl">
          <div className="gradient-blur opacity-50" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 w-fit rounded-full backdrop-blur-sm border border-white/10">
                <Contact2 size={12} className="text-sky-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">Database Ledger v2.1</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Manajemen Santri</h1>
              <p className="text-slate-400 max-w-lg text-sm leading-relaxed">Kelola profil santri, verifikasi identitas, dan pantau status keaktifan penabung pada ekosistem asrama.</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => { setEditingStudent(null); setFormData({ nis: '', nama: '', kelas: '', foto: '' }); setShowModal(true); }} className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-8 py-6 h-auto font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all gap-2">
                <Plus size={18} />
                Tambah Santri
              </Button>
            </div>
          </div>
        </div>

        <Card className="p-0 border-slate-100 rounded-[2rem] shadow-sm overflow-hidden bg-white">
          <div className="p-8 border-b border-slate-50 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900 text-xl">Daftar Santri Aktif</h3>
              <p className="text-xs text-slate-400 font-medium tracking-wide">Menampilkan seluruh santri yang terdaftar dalam sistem</p>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input
                placeholder="Cari santri..."
                className="pl-12 h-12 text-sm border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 rounded-xl transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIS ID</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Santri</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grup Kelas</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Kas</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Opsi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6 h-20 bg-slate-50/10"></td>
                    </tr>
                  ))
                ) : students.length > 0 ? (
                  students.map((siswa) => (
                    <tr key={siswa.id_siswa} className="hover:bg-slate-50 transition-colors group border-b border-slate-50/50">
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-slate-500 font-mono tracking-tighter bg-slate-100 px-2 py-1 rounded">
                          {siswa.nis}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          {siswa.foto ? (
                            <img src={siswa.foto} alt="" className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-white shadow-md">
                              <UserIcon size={20} />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-slate-800 leading-tight">{siswa.nama}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aktif</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-wider">{siswa.kelas}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-900 font-display">Rp {Number(siswa.saldo).toLocaleString('id-ID')}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            className="h-10 w-10 p-0 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all flex items-center justify-center shrink-0"
                            onClick={() => setViewingCard(siswa)}
                            title="Lihat Kartu"
                          >
                            <Contact2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-10 w-10 p-0 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all flex items-center justify-center shrink-0"
                            onClick={() => {
                              setEditingStudent(siswa);
                              setFormData({ nis: siswa.nis, nama: siswa.nama, kelas: siswa.kelas, foto: siswa.foto || '' });
                              setShowModal(true);
                            }}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-10 w-10 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center shrink-0"
                            onClick={() => handleDelete(siswa.id_siswa)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-24 text-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                           <UserIcon size={32} className="text-slate-300" />
                        </div>
                        <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Santri belum terdaftar</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <AnimatePresence>
          {viewingCard && (
            <MemberCard 
              siswa={viewingCard} 
              onClose={() => setViewingCard(null)} 
            />
          )}
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md"
              >
                <Card className="p-10 relative rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                     <UserIcon size={120} />
                  </div>
                  <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                  <h2 className="text-2xl font-display font-bold mb-10 text-slate-900 border-b border-slate-100 pb-4">{editingStudent ? 'Edit Profil Santri' : 'Registrasi Santri Baru'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-6 mb-10">
                       <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Identitas Visual</Label>
                       <div className="relative group">
                          <div className="w-28 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden flex items-center justify-center text-slate-300 shadow-inner group-hover:border-sky-300 transition-colors">
                            {formData.foto ? (
                               <img src={formData.foto} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                            ) : (
                               <UserIcon size={48} className="group-hover:scale-110 transition-transform duration-500" />
                            )}
                          </div>
                          <label className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[2rem] cursor-pointer backdrop-blur-sm">
                             <Camera size={24} />
                             <span className="text-[9px] font-bold mt-2 uppercase tracking-widest">Update</span>
                             <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          </label>
                          {formData.foto && (
                            <button 
                              type="button"
                              onClick={() => setFormData({ ...formData, foto: '' })}
                              className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white hover:scale-110 transition-transform"
                            >
                              <X size={14} />
                            </button>
                          )}
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nomor Induk Santri (NIS)</Label>
                        <Input
                          required
                          value={formData.nis}
                          onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                          placeholder="Masukkan NIS unik"
                          className="h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-sky-500 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nama Lengkap Santri</Label>
                        <Input
                          required
                          value={formData.nama}
                          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                          placeholder="Masukkan nama sesuai KTP/AktA"
                          className="h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-sky-500 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Penempatan Kelas</Label>
                        <Input
                          required
                          value={formData.kelas}
                          onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                          placeholder="Contoh: XII TKR 2"
                          className="h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-sky-500 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="pt-8 flex gap-4">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        disabled={submitting}
                        className="flex-1 py-6 bg-slate-100 border-none text-slate-500 font-bold uppercase tracking-widest text-xs rounded-2xl" 
                        onClick={() => setShowModal(false)}
                      >
                        Batal
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submitting}
                        className="flex-1 py-6 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-slate-200 disabled:opacity-70"
                      >
                        {submitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : 'Simpan Data'}
                      </Button>
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
