import React, { useState, ChangeEvent, DragEvent } from 'react';
import axios from 'axios';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: (imageUrl: string) => void;
  imageUrl:any
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, onImageRemove, imageUrl }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await privateApi.post('/api/v1/upload-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.url) {
          onImageUpload(response.data.url);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      try {
        const formData = new FormData();
        formData.append('file', file);

        privateApi.post('/api/v1/upload-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then(response => {
          if (response.data.url) {
            onImageUpload(response.data.url);
          }
        }).catch(error => {
          console.error('Error uploading file:', error);
        });
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleRemove = async () => {
    if (previewUrl) {
      try {
        await privateApi.post('/api/v1/delete-file', { fileUrl: imageUrl });
        onImageRemove(previewUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            SVG, PNG, JPG or GIF (MAX. 800x400px)
          </p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />
      </label>
      {previewUrl && (
        <div className="mt-4">
          <img src={previewUrl} alt="Preview" className="max-w-xs" />
          <button
            onClick={handleRemove}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
          >
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
