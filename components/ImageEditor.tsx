import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import { UploadIcon, BrainIcon } from './Icons';
import { ErrorMessage } from './ErrorMessage';
import { Loader } from './Loader';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const ImageEditor: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setResultImage(null);
      setError(null);
      blobToBase64(file).then(setImageBase64);
    } else {
      setError('Please upload a valid image file (PNG, JPG, etc.).');
    }
  }, []);

  const handleGenerate = async () => {
    if (!imageBase64 || !imageFile || !prompt) {
      setError('Please upload an image and enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);
    try {
      const result = await editImage(imageBase64, imageFile.type, prompt);
      setResultImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  
  return (
    <div className="bg-surface rounded-lg shadow-lg p-6 h-full flex flex-col">
      <h2 className="text-3xl font-bold text-on-surface mb-6">AI Image Editor</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
        {/* Input Side */}
        <div className="flex flex-col space-y-4">
          {!imageFile ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300 flex-grow flex flex-col justify-center items-center ${isDragging ? 'border-secondary bg-slate-800' : 'border-slate-600 hover:border-slate-500'}`}
              onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
            >
              <input type="file" id="image-upload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                <UploadIcon className="w-12 h-12 text-on-surface-variant mb-4"/>
                <p className="text-on-surface font-semibold">Drag & drop an image</p>
                <p className="text-on-surface-variant mt-1">or click to browse</p>
              </label>
            </div>
          ) : (
            <div className="relative group flex-grow">
              <img src={URL.createObjectURL(imageFile)} alt="Original" className="w-full h-full object-contain rounded-lg" />
              <button onClick={() => { setImageFile(null); setImageBase64(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                &times;
              </button>
            </div>
          )}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Add a retro filter' or 'Make the sky purple'"
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm text-on-surface h-24 resize-none"
            rows={3}
          />
          <button
            onClick={handleGenerate}
            disabled={!imageBase64 || !prompt || isLoading}
            className="w-full bg-secondary hover:bg-emerald-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center shadow-lg"
          >
            <BrainIcon className="w-5 h-5 mr-2" />
            {isLoading ? 'Generating...' : 'Generate Edit'}
          </button>
        </div>

        {/* Output Side */}
        <div className="bg-slate-800 rounded-lg flex items-center justify-center p-4 min-h-[300px] md:min-h-0">
          {isLoading ? (
            <Loader />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : resultImage ? (
            <img src={`data:image/png;base64,${resultImage}`} alt="Generated" className="w-full h-full object-contain rounded-lg" />
          ) : (
            <p className="text-on-surface-variant">Your edited image will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
};