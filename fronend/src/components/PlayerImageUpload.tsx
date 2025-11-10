"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { iplApi } from "@/lib/services/iplApi";

interface PlayerImageUploadProps {
  playerId: string;
  playerName: string;
  onImageUploaded?: (imagePath: string) => void;
}

export default function PlayerImageUpload({ playerId, playerName, onImageUploaded }: PlayerImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [msg, setMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = async () => {
    setIsUploading(true);
    setMsg('');
    
    const fd = new FormData();
    if (file) {
      fd.append('file', file, file.name);
    } else if (url && url !== '') {
      fd.append('image_url', url);
    } else { 
      setMsg('Please select a file or enter an image URL'); 
      setIsUploading(false);
      return; 
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ipl-anylasis-2.onrender.com';
      const res = await fetch(`${API_BASE}/players/${playerId}/upload-image`, {
        method: 'POST',
        body: fd,
      });
      
      const data = await res.json();
      
      if (!res.ok) { 
        setMsg(data.detail || 'Upload failed'); 
        setIsUploading(false);
        return; 
      }

      setMsg(data.message || 'Image uploaded successfully!');
      const newImagePath = `${API_BASE}${data.image_path}`;
      setImgSrc(newImagePath);
      
      // Invalidate player cache to refresh data everywhere
      iplApi.util.invalidateTags(['Player', 'Players']);
      
      // Call the callback to update the parent component
      if (onImageUploaded) {
        onImageUploaded(newImagePath);
      }
      
      // Clear the form
      setFile(null);
      setUrl('');
    } catch (error) {
      setMsg('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center gap-2">
          📸 Upload Player Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Upload an image for <span className="font-semibold">{playerName}</span>
        </div>
        
        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Upload File:</label>
          <Input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors"
          />
        </div>
        
        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Or Enter Image URL:</label>
          <Input 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            placeholder="https://example.com/image.jpg"
            className="border-blue-200 focus:border-blue-400"
          />
        </div>
        
        {/* Upload Button */}
        <Button 
          onClick={onUpload} 
          disabled={isUploading || (!file && !url)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Uploading...
            </div>
          ) : (
            'Upload Image'
          )}
        </Button>
        
        {/* Message */}
        {msg && (
          <div className={`p-3 rounded-lg text-sm ${
            msg.includes('successfully') || msg.includes('Uploaded') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {msg}
          </div>
        )}
        
        {/* Preview */}
        {imgSrc && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Preview:</label>
            <div className="flex justify-center">
              <img 
                src={imgSrc} 
                alt={`${playerName} - Uploaded`} 
                className="max-w-full h-32 object-cover rounded-lg border-2 border-blue-200 shadow-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
