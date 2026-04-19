import React from 'react';
import { Wallet, QrCode, User } from 'lucide-react';
import { Card, Button } from './ui';
import { motion } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';

interface MemberCardProps {
  siswa: {
    nama: string;
    nis: string;
    kelas: string;
    foto?: string;
  };
  onClose: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ siswa, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md relative"
      >
        <Card className="p-0 overflow-hidden shadow-2xl border-none bg-white font-sans text-slate-800 print:shadow-none print:border print:border-slate-200">
          {/* Decorative Pattern Background */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none overflow-hidden">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Header */}
          <div className="bg-slate-900 p-8 flex items-center justify-between text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg ring-1 ring-emerald-500/30">
                <Wallet size={24} className="text-emerald-400" fill="currentColor" fillOpacity={0.2} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-display font-bold text-xl leading-none tracking-tighter uppercase">Santri Card</h3>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.4em] mt-2">SANTRICASH ECOSYSTEM</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-10 pb-12 relative">
            <div className="flex items-start gap-10">
              <div className="flex flex-col items-center">
                <div className="w-28 h-32 bg-slate-50 rounded-[1.5rem] flex items-center justify-center border-2 border-dashed border-slate-100 text-slate-200 relative overflow-hidden group shadow-inner">
                  {siswa.foto ? (
                    <img src={siswa.foto} alt={siswa.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={48} className="group-hover:scale-110 transition-transform" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-900/10 py-1 text-[8px] font-bold text-center uppercase tracking-widest text-slate-500">Foto 3x4</div>
                </div>
                <div className="mt-4 bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Member Aktif
                </div>
              </div>

              <div className="flex-1 space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nama Terdaftar</label>
                  <p className="text-lg font-bold text-slate-800 leading-tight">{siswa.nama}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">NIS / ID</label>
                    <p className="font-mono text-sm font-bold text-slate-600">{siswa.nis}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Kelas</label>
                    <p className="text-sm font-bold text-slate-700">{siswa.kelas}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 flex items-end justify-between">
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <QrCode size={16} className="text-slate-400" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verifikasi Digital</span>
                 </div>
                 <div className="w-16 h-16 bg-white p-1 border border-slate-100 rounded-lg shadow-sm flex items-center justify-center">
                    <QRCodeCanvas 
                      value={siswa.nis} 
                      size={54}
                      level="H"
                      includeMargin={false}
                      className="w-full h-full"
                    />
                 </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dicetak pada</div>
                <div className="text-xs font-bold text-slate-600">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div className="mt-4 h-8 flex items-center justify-end opacity-20">
                    <div className="w-3 h-3 bg-sky-600 rotate-45 mr-1" />
                    <div className="w-3 h-3 bg-slate-800 rotate-45" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3 print:hidden">
          <Button variant="secondary" className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={onClose}>Tutup</Button>
          <Button className="flex-1 bg-sky-600 hover:bg-sky-500" onClick={handlePrint}>Unduh / Cetak</Button>
        </div>
      </motion.div>
    </div>
  );
};
