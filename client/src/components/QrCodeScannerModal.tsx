import React from 'react';
import { X, QrCode } from 'lucide-react';

interface QrCodeScannerModalProps {
  onClose: () => void;
}

export default function QrCodeScannerModal({ onClose }: QrCodeScannerModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-app-surface rounded-lg max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-app-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Scan QR Code</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover"
          >
            <X className="w-4 h-4 text-app-muted" />
          </button>
        </div>
        
        <div className="p-6 flex-1 flex flex-col items-center justify-center">
          <div className="w-64 h-64 bg-app-bg rounded-lg flex items-center justify-center mb-4">
            <QrCode size={150} className="text-app-muted" />
          </div>
          <p className="text-center text-app-muted mb-6">
            Position a QR code within the frame to scan. Use this to connect with friends or join groups.
          </p>
          <p className="text-xs text-app-muted">
            Note: Camera access is required for QR code scanning.
          </p>
        </div>
        
        <div className="p-4 border-t border-app-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-md font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}