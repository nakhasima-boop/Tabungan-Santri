import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, Button } from './ui';
import { X, Camera } from 'lucide-react';
import { motion } from 'motion/react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        if (scannerRef.current) {
          scannerRef.current.clear().then(() => {
            onScan(decodedText);
          }).catch(err => {
             console.error("Failed to clear scanner", err);
             onScan(decodedText);
          });
        }
      },
      (errorMessage) => {
        // console.error(errorMessage);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner cleanup failed", err));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg relative"
      >
        <Card className="p-0 overflow-hidden bg-white border-none shadow-2xl">
          <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
               <div className="bg-sky-600 p-2 rounded-lg">
                  <Camera size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-base leading-none uppercase tracking-tight">Scanner Identitas</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Arahkan ke Barcode / QR NIS Santri</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
               <X size={20} />
            </button>
          </div>
          
          <div className="p-8">
            <div id="reader" className="w-full overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50"></div>
            
            <div className="mt-8 space-y-4">
               <div className="flex items-center gap-4 p-4 bg-sky-50 rounded-xl border border-sky-100">
                  <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white shrink-0">
                     <span className="text-[10px] font-black underline">!</span>
                  </div>
                  <p className="text-[10px] font-bold text-sky-800 uppercase tracking-wide leading-relaxed">
                    Pastikan Barcode terlihat jelas dan mendapatkan cahaya yang cukup untuk hasil pembacaan optimal.
                  </p>
               </div>
               
               <Button variant="secondary" className="w-full bg-slate-50 border-none py-6 uppercase tracking-widest text-xs font-bold text-slate-400" onClick={onClose}>
                 BataLkan Pemindaian
               </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
