import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import {Card, Button, Input, Label, cn} from '../components/ui';
import { getTransaksi, getSiswa, addTransaksi } from '../lib/api';
import { Plus, ArrowDownLeft, ArrowUpRight, Search, Filter, X, QrCode, ArrowLeftRight, Calendar, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Scanner } from '../components/Scanner';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    studentId: '',
    q: '',
  });
  const [formData, setFormData] = useState({ id_siswa: '', jenis: 'setoran', nominal: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters(prev => ({ ...prev, q: search }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txs, s] = await Promise.all([getTransaksi(filters), getSiswa()]);
      setTransactions(txs.sort((a: any, b: any) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()));
      setStudents(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_siswa) return alert('Pilih siswa terlebih dahulu');
    
    try {
      const siswa = students.find(s => s.id_siswa === formData.id_siswa);
      if (formData.jenis === 'penarikan' && Number(siswa.saldo) < Number(formData.nominal)) {
        return alert('Saldo tidak mencukupi');
      }

      await addTransaksi(formData);
      setShowModal(false);
      fetchData();
      setFormData({ id_siswa: '', jenis: 'setoran', nominal: '' });
    } catch (err) {
      alert('Gagal memproses transaksi');
    }
  };

  const getStudentName = (id: string) => {
    return students.find(s => s.id_siswa === id)?.nama || 'Santri tidak dikenal';
  };

  const handleScan = (decodedText: string) => {
    // Try to find student by NIS or Name
    const found = students.find(s => 
      String(s.nis).trim() === decodedText.trim() || 
      String(s.id_siswa).trim() === decodedText.trim() || 
      s.nama.toLowerCase().trim() === decodedText.toLowerCase().trim()
    );
    
    if (found) {
      setFormData({ ...formData, id_siswa: found.id_siswa });
      setShowScanner(false);
      setShowModal(true);
    } else {
      alert(`Data tidak ditemukan: ${decodedText}`);
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
                <ArrowLeftRight size={12} className="text-sky-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">Transaction Registry v3.0</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Riwayat Transaksi</h1>
              <p className="text-slate-400 max-w-lg text-sm leading-relaxed">Pantau arus kas tabungan santri secara real-time. Seluruh mutasi divalidasi dengan sistem pencatatan ganda.</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setShowScanner(true)} variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/10 backdrop-blur-md rounded-xl px-8 py-6 h-auto font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all gap-3">
                 <QrCode size={18} />
                 Scan Barcode
              </Button>
              <Button onClick={() => setShowModal(true)} className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-8 py-6 h-auto font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all gap-3">
                <Plus size={18} />
                Transaksi Baru
              </Button>
            </div>
          </div>
        </div>

        <Card className="p-0 border-slate-100 rounded-[2rem] shadow-sm overflow-hidden bg-white">
          <div className="p-8 border-b border-slate-50 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900 text-xl">Daftar Mutasi Keuangan</h3>
              <p className="text-xs text-slate-400 font-medium tracking-wide">Menampilkan riwayat transaksi kredit dan debit terbaru</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <Input
                  placeholder="Cari transaksi..."
                  className="pl-12 h-12 text-sm border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 rounded-xl transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button 
                variant="secondary" 
                className={cn(
                  "h-12 text-xs px-6 font-bold uppercase tracking-widest border-none rounded-xl transition-all", 
                  showFilters ? "bg-sky-50 text-sky-700 ring-2 ring-sky-500/20" : "bg-slate-50 text-slate-500"
                )}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} className="mr-2" />
                Filter Data
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-slate-50 border-b border-slate-100"
              >
                <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Jenis Mutasi</Label>
                    <select 
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none bg-white transition-all shadow-sm"
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                      <option value="">Semua Transaksi</option>
                      <option value="setoran">Setoran (Kredit)</option>
                      <option value="penarikan">Penarikan (Debit)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pilih Santri</Label>
                    <select 
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none bg-white transition-all shadow-sm"
                      value={filters.studentId}
                      onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                    >
                      <option value="">Semua Santri</option>
                      {students.map(s => <option key={s.id_siswa} value={s.id_siswa}>{s.nama}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tanggal Mulai</Label>
                    <Input 
                      type="date" 
                      className="h-11 text-xs px-4 border-slate-200 rounded-xl bg-white shadow-sm"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tanggal Selesai</Label>
                    <Input 
                      type="date" 
                      className="h-11 text-xs px-4 border-slate-200 rounded-xl bg-white shadow-sm"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu & Tanggal</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Santri</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Transaksi</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Nominal Mutasi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6 h-20 bg-slate-50/10"></td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.slice(0, 50).map((tx) => (
                    <tr key={tx.id_transaksi} className="hover:bg-slate-50 transition-colors border-b border-slate-50/50">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                              <Calendar size={14} />
                           </div>
                           <div>
                              <div className="text-xs font-bold text-slate-700 font-mono leading-tight">
                                {new Date(tx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </div>
                              <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-0.5">
                                {new Date(tx.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-800 leading-tight">{getStudentName(tx.id_siswa)}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Verified Transaction</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                          tx.jenis === 'setoran' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-red-50 text-red-500 border-red-100'
                        )}>
                          {tx.jenis === 'setoran' ? 'Setoran' : 'Penarikan'}
                        </span>
                      </td>
                      <td className={cn(
                        "px-8 py-6 text-right font-bold text-sm font-display tracking-tight",
                        tx.jenis === 'setoran' ? 'text-emerald-600' : 'text-red-500'
                      )}>
                        {tx.jenis === 'setoran' ? '+' : '-'} Rp{Number(tx.nominal).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-24 text-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                          <Activity size={32} className="text-slate-300" />
                       </div>
                       <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Belum ada mutasi transaksi</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <AnimatePresence>
          {showScanner && (
            <Scanner 
              onScan={handleScan}
              onClose={() => setShowScanner(false)}
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
                     <ArrowLeftRight size={120} />
                  </div>
                  <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                  <h2 className="text-2xl font-display font-bold mb-10 text-slate-900 border-b border-slate-100 pb-4">Registrasi Transaksi Baru</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pilih Santri Penabung</Label>
                      <select
                        required
                        className="flex h-12 w-full rounded-xl border-none bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        value={formData.id_siswa}
                        onChange={(e) => setFormData({ ...formData, id_siswa: e.target.value })}
                      >
                        <option value="">-- Cari Nama atau NIS Santri --</option>
                        {students.map(s => (
                          <option key={s.id_siswa} value={s.id_siswa}>{s.nis} - {s.nama} (Saldo: Rp {Number(s.saldo).toLocaleString('id-ID')})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pilih Aksi Rekening</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, jenis: 'setoran' })}
                          className={cn(
                            "flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border-2 text-sm font-bold transition-all shadow-sm",
                            formData.jenis === 'setoran' 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-emerald-100' 
                            : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                          )}
                        >
                          <div className={cn("p-2 rounded-lg", formData.jenis === 'setoran' ? 'bg-emerald-500 text-white' : 'bg-slate-100')}>
                            <ArrowDownLeft size={20} />
                          </div>
                          SETORAN TUNAI
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, jenis: 'penarikan' })}
                          className={cn(
                            "flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border-2 text-sm font-bold transition-all shadow-sm",
                            formData.jenis === 'penarikan' 
                            ? 'border-red-500 bg-red-50 text-red-700 shadow-red-100' 
                            : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                          )}
                        >
                          <div className={cn("p-2 rounded-lg", formData.jenis === 'penarikan' ? 'bg-red-500 text-white' : 'bg-slate-100')}>
                            <ArrowUpRight size={20} />
                          </div>
                          PENARIKAN KAS
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nominal Transaksi (Rp)</Label>
                      <Input
                        type="number"
                        required
                        value={formData.nominal}
                        onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                        placeholder="Contoh: 50.000"
                        min="1"
                        className="h-12 bg-slate-50 border-none focus:bg-white focus:ring-sky-500 rounded-xl text-lg font-display font-bold"
                      />
                    </div>

                    <div className="pt-8 flex gap-4">
                      <Button type="button" variant="secondary" className="flex-1 py-6 bg-slate-100 border-none text-slate-500 font-bold uppercase tracking-widest text-xs rounded-2xl" onClick={() => setShowModal(false)}>Batal</Button>
                      <Button type="submit" className="flex-1 py-6 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-slate-200">Konfirmasi Transaksi</Button>
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
