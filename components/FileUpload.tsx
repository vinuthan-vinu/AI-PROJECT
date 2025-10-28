
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File, data: string, headers: string[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          onFileSelect(file, text, headers);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid CSV file.');
    }
  }, [onFileSelect]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300 ${isDragging ? 'border-secondary bg-surface' : 'border-slate-600 hover:border-slate-500'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept=".csv"
        onChange={handleChange}
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
        <UploadIcon className="w-12 h-12 text-on-surface-variant mb-4"/>
        <p className="text-on-surface font-semibold">Drag & drop a CSV file here</p>
        <p className="text-on-surface-variant mt-1">or click to browse</p>
      </label>
    </div>
  );
};
