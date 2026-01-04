/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { useApiClient } from "@/hooks/useApiClient";
export default function ImageUploader({
  value,
  onChange,
  onDelete,
}: {
  value: string;
  onChange: (url: string) => void;
  onDelete: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const { privateApi } = useApiClient();
  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await privateApi.post("/api/v1/upload-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Image upload failed");
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        setIsUploading(true);
        const url = await uploadFile(file);
        onChange(url);
        setError("");
      } catch (err) {
        setError("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".svg"],
    },
    multiple: false,
  });

  const handleDelete = async () => {
    try {
      await axios.post(
        "http://https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/delete-file",
        {
          fileUrl: value,
        }
      );
      onDelete();
      setError("");
    } catch (err) {
      setError("Failed to delete image. Please try again.");
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Featured preview"
            className="rounded-lg w-full h-48 object-cover"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? "Drop the image here"
                  : "Drag & drop image, or click to select"}
              </p>
              <p className="text-xs text-gray-500">Supports: JPEG, PNG, SVG</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or enter image URL directly"
          className="pr-16"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 px-2"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
