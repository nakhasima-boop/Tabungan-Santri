import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, Input, Label, cn } from '../components/ui';
import { getSiswa, getTransaksi } from '../lib/api';
import { FileText, Download, Printer, Users, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ReportsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, tx] = await Promise.all([getSiswa(), getTransaksi()]);
      setStudents(s);
      setTransactions(tx);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalSetoran = transactions
    .filter(tx => tx.jenis === 'setoran')
    .reduce((acc, tx) => acc + Number(tx.nominal), 0);

  const totalPenarikan = transactions
    .filter(tx => tx.jenis === 'penarikan')
    .reduce((acc, tx) => acc + Number(tx.nominal), 0);

  const currentTotalSaldo = totalSetoran - totalPenarikan;

  const selectedStudent = students.find(s => s.id_siswa === selectedStudentId);
  const studentTransactions = transactions
    .filter(tx => tx.id_siswa === selectedStudentId)
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div></div></Layout>;

  return (
    <Layout>
      <div className="space-y-10 print:p-0">
        <div className="relative p-10 rounded-[2.5rem] bg-slate-900 overflow-hidden text-white shadow-2xl print:hidden">
          <div className="gradient-blur opacity-50" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 w-fit rounded-full backdrop-blur-sm border border-white/10">
                <FileText size={12} className="text-sky-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">Financial Audit v4.2</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Laporan Keuangan</h1>
              <p className="text-slate-400 max-w-lg text-sm leading-relaxed">Analisis mendalam mengenai arus kapital asrama. Rekapitulasi otomatis dari seluruh mutasi tabungan santri.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-8 py-6 h-auto font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all gap-3" onClick={handlePrint}>
                <Printer size={18} />
                Cetak Laporan
              </Button>
            </div>
          </div>
        </div>

        {/* General Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:grid-cols-3">
          <Card className="p-8 border-slate-100 bg-white relative overflow-hidden rounded-[2rem] shadow-sm group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Wallet size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Setoran</span>
              <div className="text-3xl font-display font-bold text-slate-900 tracking-tight">Rp {totalSetoran.toLocaleString('id-ID')}</div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-4 flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Akumulasi Kredit
              </div>
            </div>
          </Card>

          <Card className="p-8 border-slate-100 bg-white relative overflow-hidden rounded-[2rem] shadow-sm group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                <ArrowUpRight size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Penarikan</span>
              <div className="text-3xl font-display font-bold text-slate-900 tracking-tight">Rp {totalPenarikan.toLocaleString('id-ID')}</div>
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-4 flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Akumulasi Debit
              </div>
            </div>
          </Card>

          <Card className="p-8 border-slate-900 bg-slate-900 relative overflow-hidden rounded-[2rem] shadow-2xl group text-white">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
             <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 text-sky-400 rounded-2xl flex items-center justify-center mb-6 border border-white/10 backdrop-blur-sm">
                <FileText size={22} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Saldo Bersih (Kas)</span>
              <div className="text-3xl font-display font-bold text-white tracking-tight">Rp {currentTotalSaldo.toLocaleString('id-ID')}</div>
              <div className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-4 flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" /> Managed by Asrama
              </div>
            </div>
          </Card>
        </div>

        {/* Student Specific Filter */}
        <Card className="p-8 border-slate-100 bg-white rounded-[2rem] shadow-sm print:hidden">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Pilih Santri untuk Laporan Personal</Label>
              </div>
              <select 
                className="w-full h-12 px-4 rounded-xl border border-slate-100 text-sm focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50 font-bold text-slate-700 transition-all"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">-- Tampilkan Seluruh Ringkasan Santri --</option>
                {students.map(s => <option key={s.id_siswa} value={s.id_siswa}>{s.nis} - {s.nama}</option>)}
              </select>
            </div>
            {selectedStudentId && (
               <Button variant="ghost" className="text-slate-400 hover:text-red-600 h-10 px-6 font-bold uppercase tracking-widest text-[10px] rounded-xl" onClick={() => setSelectedStudentId('')}>
                 Reset Pemilihan
               </Button>
            )}
          </div>
        </Card>

        {/* Detailed Report View */}
        {selectedStudentId && selectedStudent ? (
           <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
           >
               <Card className="bg-white border-slate-100 rounded-[2.5rem] overflow-hidden print:border-none shadow-sm">
                <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                         <Users size={40} className="relative z-10" />
                      </div>
                      <div className="space-y-1">
                         <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight leading-none">{selectedStudent.nama}</h2>
                         <div className="flex items-center gap-2 mt-3">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-wider border border-emerald-100">NIS: {selectedStudent.nis}</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-wider border border-indigo-100">Kelas: {selectedStudent.kelas}</span>
                         </div>
                      </div>
                   </div>
                   <div className="text-right bg-white p-6 rounded-3xl border border-slate-50 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Total Akumulasi Saldo</span>
                      <div className="text-4xl font-display font-bold text-slate-900 tracking-tighter">Rp {Number(selectedStudent.saldo).toLocaleString('id-ID')}</div>
                   </div>
                </div>

                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-50">
                             <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu Transaksi</th>
                             <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Aksi</th>
                             <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Nominal Mutasi</th>
                             <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Verifikasi</th>
                          </tr>
                       </thead>
                       <tbody>
                          {studentTransactions.length > 0 ? (
                             studentTransactions.map((tx) => (
                                <tr key={tx.id_transaksi} className="border-b border-slate-50/50 hover:bg-slate-50/30 transition-colors">
                                   <td className="px-10 py-6">
                                      <div className="text-xs font-bold text-slate-700 font-mono">{new Date(tx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(tx.tanggal).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })} WIB</div>
                                   </td>
                                   <td className="px-10 py-6">
                                      <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-lg border",
                                        tx.jenis === 'setoran' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                                      )}>
                                         {tx.jenis === 'setoran' ? 'Kredit (In)' : 'Debit (Out)'}
                                      </span>
                                   </td>
                                   <td className={cn(
                                      "px-10 py-6 text-right text-sm font-bold font-display tracking-tight",
                                      tx.jenis === 'setoran' ? 'text-emerald-700' : 'text-red-600'
                                   )}>
                                      {tx.jenis === 'setoran' ? '+' : '-'} Rp {Number(tx.nominal).toLocaleString('id-ID')}
                                   </td>
                                   <td className="px-10 py-6 text-right">
                                      <div className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_12px_rgba(52,211,153,0.6)]"></div>
                                   </td>
                                </tr>
                             ))
                          ) : (
                             <tr>
                                <td colSpan={4} className="p-24 text-center">
                                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                      <FileText size={32} className="text-slate-300" />
                                   </div>
                                   <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Belum ada riwayat transaksi</p>
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                </div>
                
                <div className="p-16 bg-slate-50 border-t border-slate-100 hidden print:block mt-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white border border-slate-200 rounded-[3rem] rotate-45 opacity-10"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] relative z-10">LAPORAN RESMI SISTEM TABUNGAN SANTRI ASRAMA</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 relative z-10">© 2026 Admin Verification Systems • Digital Ledger v4.2</p>
                </div>
              </Card>
           </motion.div>
        ) : (
          <div className="bg-white border-slate-100 rounded-[2.5rem] p-24 text-center space-y-6 print:hidden shadow-sm">
              <div className="inline-flex w-24 h-24 bg-slate-50 rounded-full items-center justify-center text-slate-200 border-2 border-dashed border-slate-200">
                 <Users size={40} />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900">Pilih Santri untuk Laporan Detail</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4 leading-relaxed max-w-sm mx-auto">Gunakan menu pilihan di atas untuk memfilter data mutasi <br/>personal dan mengunduh laporan audit.</p>
              </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
