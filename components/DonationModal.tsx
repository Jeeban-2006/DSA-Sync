import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart, X, Check, Copy } from 'lucide-react';
import Image from 'next/image';

export default function DonationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  const upiId = "jeebankrushnasahu1@ibl";

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-dark-300 w-full max-w-sm rounded-2xl border border-dark-200 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-dark-400 rounded-full p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Buy me a Coffee! ☕</h2>
          <p className="text-gray-400 text-sm mb-6">
            If this app helped you in your DSA journey, consider supporting the developer to keep it running free of cost!
          </p>

          {/* QR Code Container */}
          <div className="bg-white p-2 rounded-xl inline-block mb-6 shadow-inner mx-auto relative group">
            <div className="w-full max-w-[260px] relative rounded-lg overflow-hidden flex flex-col items-center justify-center">
              <img src={`/scanner.jpeg?v=2`} alt="Payment Scanner" className="w-full h-auto object-contain rounded-lg block" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-300 font-medium">Or pay via UPI ID</p>
            <button 
              onClick={copyUpi}
              className="flex items-center justify-between w-full p-3 bg-dark-400 border border-dark-200 rounded-xl hover:bg-dark-500 transition-colors group"
            >
              <span className="text-primary-400 font-mono tracking-wide">{upiId}</span>
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400 group-hover:text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
