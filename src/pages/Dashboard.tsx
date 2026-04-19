import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, cn } from '../components/ui';
import { getDashboardData, getTransaksi, getSiswa } from '../lib/api';
import { 
  Users, 
  Wallet, 
  ArrowLeftRight,
  TrendingUp,
  Activity,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  Calendar,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { MemberCard } from '../components/MemberCard';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMemberCard, setShowMemberCard] = useState(false);
  const [chartView, setChartView] = useState<'pekan' | 'bulan'>('pekan');

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { role: 'admin' };
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const [dash, tx] = await Promise.all([getDashboardData(), getTransaksi()]);
        setData(dash);
        setTransactions(tx.sort((a: any, b: any) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).slice(0, 5));
      } else {
        const [allTx, students] = await Promise.all([getTransaksi(), getSiswa()]);
        const mySiswa = students.find((s: any) => String(s.id_siswa) === String(user.id_siswa));
        const myTx = allTx.filter((t: any) => String(t.id_siswa) === String(user.id_siswa))
                          .sort((a: any, b: any) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
        setStudentData(mySiswa);
        setTransactions(myTx);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-xl shadow-xl border-slate-100 ring-1 ring-slate-900/5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-bold text-sky-600">Rp {payload[0].value.toLocaleString('id-ID')}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div></div></Layout>;

  if (isAdmin) {
    const stats = [
      { 
        label: 'Total Tabungan', 
        value: data?.totalSaldo || 0, 
        icon: Wallet, 
        prefix: 'Rp ', 
        desc: 'Dana terkumpul saat ini',
        color: 'bg-emerald-500',
        lightColor: 'bg-emerald-50 text-emerald-600'
      },
      { 
        label: 'Santri Terdaftar', 
        value: data?.jumlahSiswa || 0, 
        icon: Users, 
        prefix: '', 
        desc: 'Total santri penabung',
        color: 'bg-indigo-500',
        lightColor: 'bg-indigo-50 text-indigo-600'
      },
      { 
        label: 'Total Penarikan', 
        value: Number(data?.totalPenarikan || 0), 
        icon: ArrowUpRight, 
        prefix: 'Rp ', 
        desc: 'Total dana dikembalikan',
        color: 'bg-red-500',
        lightColor: 'bg-red-50 text-red-600'
      },
    ];

    return (
      <Layout>
        <div className="space-y-10">
          {/* Elegant Hero Header */}
          <div className="relative p-10 rounded-[2rem] bg-slate-900 overflow-hidden text-white shadow-2xl">
            <div className="gradient-blur opacity-50" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/10 w-fit rounded-full backdrop-blur-sm border border-white/10">
                  <Sparkles size={12} className="text-emerald-300" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">Management Panel v2.5</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Selamat Datang, Admin</h1>
                <p className="text-slate-400 max-w-lg text-sm leading-relaxed">Kelola tabungan santri dengan presisi tinggi. Seluruh data sudah terenkripsi dan dicadangkan secara real-time ke sistem awan.</p>
              </div>
              <div className="flex gap-4">
                <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-8 py-6 h-auto font-bold uppercase tracking-widest text-xs">
                  Cetak Laporan
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <Card className="p-8 border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
                  <div className="relative z-10 flex flex-col">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm", stat.lightColor)}>
                      <stat.icon size={22} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
                    <div className="text-3xl font-display font-bold text-slate-900 tracking-tight leading-none mb-2">
                      {stat.prefix}{stat.value.toLocaleString('id-ID')}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{stat.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <Card className="lg:col-span-2 overflow-hidden border-slate-100 rounded-[2rem] shadow-sm">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-slate-900 text-xl">Performa Keuangan</h3>
                  <p className="text-xs text-slate-400 font-medium tracking-wide">
                    {chartView === 'pekan' ? 'Analisis pertumbuhan tabungan pekan ini' : 'Analisis pertumbuhan tabungan 7 bulan terakhir'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100/50 p-1.5 rounded-xl border border-slate-100">
                    <button 
                      onClick={() => setChartView('pekan')}
                      className={cn(
                        "px-4 py-2 text-[10px] font-bold uppercase rounded-[10px] transition-all",
                        chartView === 'pekan' ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-900/5" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Pekan
                    </button>
                    <button 
                      onClick={() => setChartView('bulan')}
                      className={cn(
                        "px-4 py-2 text-[10px] font-bold uppercase rounded-[10px] transition-all",
                        chartView === 'bulan' ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-900/5" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Bulan
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartView === 'pekan' ? [
                      { label: 'Sen', val: 4200 }, { label: 'Sel', val: 3800 }, { label: 'Rab', val: 5500 },
                      { label: 'Kam', val: 4900 }, { label: 'Jum', val: 7200 }, { label: 'Sab', val: 6800 },
                      { label: 'Min', val: 8900 },
                    ] : [
                      { label: 'Jan', val: 24000 }, { label: 'Feb', val: 28000 }, { label: 'Mar', val: 35000 },
                      { label: 'Apr', val: 32000 }, { label: 'Mei', val: 48000 }, { label: 'Jun', val: 54000 },
                      { label: 'Jul', val: 69000 },
                    ]}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f8fafc" />
                      <XAxis 
                        dataKey="label" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                        dy={15} 
                      />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="val" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorVal)" 
                        strokeWidth={4} 
                        activeDot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 3 }}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <div className="space-y-8">
              <Card className="flex flex-col border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-white flex flex-col gap-1">
                  <h3 className="font-display font-bold text-slate-900 text-lg">Aktivitas Terkini</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Live Updates</span>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  {transactions.map((tx, i) => (
                    <motion.div 
                      key={tx.id_transaksi || i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                          tx.jenis === 'setoran' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                        )}>
                          {tx.jenis === 'setoran' ? <Plus size={18} /> : <div className="w-4 h-0.5 bg-current rounded-full" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-tight truncate">{tx.nama_siswa || 'User'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{tx.jenis === 'setoran' ? 'Setoran' : 'Penarikan'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-xs font-bold font-display tracking-tight",
                          tx.jenis === 'setoran' ? 'text-emerald-600' : 'text-red-500'
                        )}>
                          {tx.jenis === 'setoran' ? '+' : '-'}Rp{(Number(tx.nominal) / 1000)}k
                        </p>
                        <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.1em] mt-0.5">
                          {new Date(tx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                         <Activity size={20} className="text-slate-200" />
                      </div>
                      <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Belum ada transaksi</p>
                    </div>
                  )}
                  <Button variant="secondary" className="w-full mt-4 text-[10px] py-4 bg-slate-50 border-none rounded-xl text-slate-400 font-bold uppercase tracking-[0.15em] hover:bg-slate-100 hover:text-slate-600 group">
                    Semua Mutasi 
                    <ChevronRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Siswa Dashboard
  return (
    <Layout>
      <div className="space-y-10">
        <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-emerald-800 overflow-hidden text-white shadow-2xl">
           <div className="gradient-blur opacity-30 bg-white" />
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 glass border-white/30 rounded-3xl flex items-center justify-center text-white shadow-lg shrink-0">
                    <Users size={32} />
                 </div>
                 <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold leading-none tracking-tight">Halo, {studentData?.nama}</h1>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">Santri Aktif</span>
                       <span className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">• Kelas {studentData?.kelas}</span>
                    </div>
                 </div>
              </div>
              <Button 
                onClick={() => setShowMemberCard(true)} 
                className="gap-3 bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl px-8 py-6 h-auto font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
              >
                 <QrCode size={18} />
                 Tampilkan Kartu Digital
              </Button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-10 bg-slate-900 border-none shadow-2xl relative overflow-hidden group rounded-[2.5rem]">
               <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-110 group-hover:opacity-10 transition-all duration-700 pointer-events-none">
                  <Wallet size={120} />
               </div>
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] block">Saldo Tabungan Saat Ini</span>
               </div>
               <div className="text-5xl font-display font-bold tracking-tight text-white mb-8">
                  <span className="text-emerald-500 mr-2 text-2xl font-sans">Rp</span>
                  {Number(studentData?.saldo || 0).toLocaleString('id-ID')}
               </div>
               <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                  <div className="flex -space-x-2">
                     <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-emerald-500" />
                     <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-indigo-500" />
                     <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">Tabungan Masa Depan Aman</span>
               </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <Card className="p-8 bg-white border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                     <ArrowDownLeft size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Setoran</span>
                    <div className="text-2xl font-display font-bold text-slate-900 leading-none">
                       Rp {transactions.filter(t => t.jenis === 'setoran').reduce((acc, t) => acc + Number(t.nominal), 0).toLocaleString('id-ID')}
                    </div>
                  </div>
               </Card>
               <Card className="p-8 bg-white border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                     <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Tarik</span>
                    <div className="text-2xl font-display font-bold text-slate-900 leading-none">
                       Rp {transactions.filter(t => t.jenis === 'penarikan').reduce((acc, t) => acc + Number(t.nominal), 0).toLocaleString('id-ID')}
                    </div>
                  </div>
               </Card>
            </div>
        </div>

        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <Activity size={20} />
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-xl">Arus Kas Pribadi</h3>
               </div>
               <button className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">Unduh Riwayat</button>
            </div>
            
            <Card className="overflow-hidden border-slate-100 rounded-[2rem] shadow-sm">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal & Waktu</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aksi Mutasi</th>
                          <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Nominal</th>
                       </tr>
                    </thead>
                    <tbody>
                       {transactions.map((tx, idx) => (
                          <motion.tr 
                            key={tx.id_transaksi} 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                          >
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                      <Calendar size={14} />
                                   </div>
                                   <div className="text-xs font-bold text-slate-700">{new Date(tx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full",
                                  tx.jenis === 'setoran' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                                )}>
                                   {tx.jenis === 'setoran' ? 'Deposit' : 'Withdrawal'}
                                </span>
                             </td>
                             <td className={cn(
                                "px-8 py-6 text-right text-sm font-bold font-display tracking-tight",
                                tx.jenis === 'setoran' ? 'text-emerald-700' : 'text-red-600'
                             )}>
                                {tx.jenis === 'setoran' ? '+' : '-'} Rp {Number(tx.nominal).toLocaleString('id-ID')}
                             </td>
                          </motion.tr>
                       ))}
                       {transactions.length === 0 && (
                          <tr>
                             <td colSpan={3} className="p-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                   <Activity size={32} className="text-slate-300" />
                                </div>
                                <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">Belum ada mutasi tabungan</p>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </Card>
        </div>

        {showMemberCard && studentData && (
          <MemberCard 
            siswa={studentData} 
            onClose={() => setShowMemberCard(false)} 
          />
        )}
      </div>
    </Layout>
  );
}
