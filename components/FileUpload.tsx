import React, { useCallback, useState, useRef } from 'react';
import { UploadIcon, ImageIcon, XIcon } from './Icons';
import { ImageFile } from '../types';

interface FileUploadProps {
  selectedImage: ImageFile | null;
  onImageSelect: (image: ImageFile | null) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ selectedImage, onImageSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    const previewUrl = URL.createObjectURL(file);
    onImageSelect({ file, previewUrl });
  }, [onImageSelect]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile, disabled]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const clearImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage) {
        URL.revokeObjectURL(selectedImage.previewUrl);
    }
    onImageSelect(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, [onImageSelect, selectedImage]);

  const triggerFileInput = () => {
      if (!disabled && fileInputRef.current) {
          fileInputRef.current.click();
      }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onInputChange}
        disabled={disabled}
      />

      {!selectedImage ? (
        <div
          onClick={triggerFileInput}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            relative group cursor-pointer
            flex flex-col items-center justify-center
            w-full h-64 rounded-2xl border-2 border-dashed
            transition-all duration-300 ease-in-out
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 bg-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="p-6 flex flex-col items-center text-center">
            <div className={`
              p-4 rounded-full mb-4 transition-colors duration-300
              ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}
            `}>
              <UploadIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              Upload an image
            </h3>
            <p className="text-sm text-slate-500">
              Drag and drop or click to browse
            </p>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden shadow-md group">
          <img 
            src={selectedImage.previewUrl} 
            alt="Preview" 
            className="w-full h-full object-contain" 
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {/* Clear Button */}
          {!disabled && (
              <button
                onClick={clearImage}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-lg transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                title="Remove image"
              >
                <XIcon className="w-5 h-5" />
              </button>
          )}
          
          {/* File Info Badge */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{selectedImage.file.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;