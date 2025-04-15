import React from 'react';
import { X, QrCode, Camera } from 'lucide-react';

interface QrCodeScannerModalProps {
  onClose: () => void;
}

export default function QrCodeScannerModal({ onClose }: QrCodeScannerModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/20 text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-white">Scan QR Code</h2>
        <div className="w-10 h-10"></div> {/* Empty div for flex alignment */}
      </div>
      
      {/* Scanner area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative w-72 h-72 mb-8">
          {/* Scan frame with corner markers */}
          <div className="absolute inset-0 border-2 border-white/30">
            {/* Corner markers */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-white"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-white"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-white"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-white"></div>
          </div>
          
          {/* Scan line animation */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-scan"></div>
          
          {/* Placeholder - Camera would go here in actual implementation */}
          <div className="w-full h-full flex items-center justify-center bg-black/50">
            <Camera size={40} className="text-white/50" />
          </div>
        </div>
        
        <p className="text-center text-white/80 max-w-xs">
          Position a QR code within the frame to scan
        </p>
      </div>
      
      {/* Footer with controls */}
      <div className="p-6 flex flex-col items-center">
        <div className="flex gap-8 mb-4">
          <button className="flex flex-col items-center text-white/80">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
              <QrCode size={24} className="text-white" />
            </div>
            <span className="text-xs">My QR</span>
          </button>
          
          <button 
            onClick={onClose}
            className="flex flex-col items-center text-white/80"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
              <X size={24} className="text-white" />
            </div>
            <span className="text-xs">Cancel</span>
          </button>
        </div>
        
        <p className="text-xs text-white/60 max-w-xs text-center">
          Scan friends' QR codes to add them or share your QR code
        </p>
      </div>
    </div>
  );
}

