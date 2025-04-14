import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useChatStore } from '@/store/store';
import { useToast } from '@/hooks/use-toast';
import { symmetricEncrypt } from '@/lib/encryption';

interface FileUploadModalProps {
  chatId: string;
  publicKey: string;
  onClose: () => void;
  onSend: (chatId: string, content: string, transaction?: any) => void;
}

export default function FileUploadModal({ chatId, publicKey, onClose, onSend }: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Check file size (max 10MB)
      if (e.target.files[0].size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive"
        });
        return;
      }
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Generate a random encryption key
      const encryptionKey = Math.random().toString(36).substring(2, 15) + 
                            Math.random().toString(36).substring(2, 15);
      
      // In a real app, this would encrypt the file with the key
      // For demo purposes, we're just simulating encryption
      
      // Simulate encryption and upload progress
      let progress = 0;
      const simulateProgress = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(simulateProgress);
          completeUpload(encryptionKey);
        }
      }, 300);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };
  
  const completeUpload = (encryptionKey: string) => {
    if (!file) return;
    
    // Create file metadata
    const fileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      encryptionKey: encryptionKey, // In production, encrypt this with recipient's public key
      fileHash: `file_${Date.now()}` // In production, use actual file hash
    };
    
    // Send message with file attachment
    onSend(chatId, `[File] ${file.name}`, { 
      file: fileMetadata 
    });
    
    toast({
      title: "Upload complete",
      description: `${file.name} has been sent`,
    });
    
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-app-bg border border-app-border rounded-xl w-full max-w-md overflow-hidden animate-in fade-in duration-300">
        <div className="p-4 border-b border-app-border flex justify-between items-center">
          <h3 className="text-lg font-medium">Share File</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-app-hover transition"
            disabled={isUploading}
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <div className="p-4">
          {!file ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-upload-line text-3xl text-primary"></i>
              </div>
              <p className="text-app-muted mb-6">Select a file to share. Files will be encrypted for privacy.</p>
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileChange}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Select File
              </Button>
            </div>
          ) : (
            <div className="py-4">
              <div className="flex items-center border border-app-border rounded-md p-3 mb-4">
                <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center mr-3">
                  <i className={`ri-${getFileIcon(file.type)} text-xl text-primary`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-app-muted">{formatFileSize(file.size)}</p>
                </div>
                {!isUploading && (
                  <button 
                    onClick={() => setFile(null)}
                    className="ml-2 text-app-muted hover:text-app"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                )}
              </div>
              
              {isUploading && (
                <div className="mb-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-app-muted text-center mt-1">
                    Encrypting and uploading: {uploadProgress}%
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {isUploading ? 'Sending...' : 'Send File'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image-line';
  if (mimeType.startsWith('video/')) return 'video-line';
  if (mimeType.startsWith('audio/')) return 'music-line';
  if (mimeType.includes('pdf')) return 'file-pdf-line';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word-line';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'file-excel-line';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-ppt-line';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('7z')) {
    return 'file-zip-line';
  }
  return 'file-line';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}