import { useState, useCallback } from "react";
import { Upload, File, X, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function UploadBox({ 
  onFileSelect, 
  accept = ".pdf,.png,.jpg,.jpeg",
  maxSize = 10 
}: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect, maxSize]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isDragging && "ring-2 ring-primary ring-offset-2 bg-accent"
      )}
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="p-8"
      >
        {selectedFile ? (
          // File Selected State
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFile}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          </div>
        ) : (
          // Upload State
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-3xl flex items-center justify-center transition-colors",
              isDragging ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <Upload className={cn(
                "h-8 w-8",
                isDragging ? "animate-bounce-gentle" : "text-muted-foreground"
              )} />
            </div>
            
            <div className="text-center">
              <p className="font-medium text-foreground">
                {isDragging ? "Drop your file here" : "Upload Invoice"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, PNG, JPG up to {maxSize}MB
              </p>
            </div>

            <label className="cursor-pointer">
              <input
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
              />
              <Button variant="gpt" className="pointer-events-none">
                <File className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </label>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center mt-4 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    </Card>
  );
}
