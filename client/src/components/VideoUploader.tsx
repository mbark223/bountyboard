import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadCloud, FileVideo, X, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VideoUploaderProps {
  onVideoUploaded: (videoUrl: string, videoKey: string, file: File) => void;
  briefId: number;
  creatorEmail: string;
  maxSizeMB?: number;
  className?: string;
}

export function VideoUploader({ 
  onVideoUploaded, 
  briefId, 
  creatorEmail,
  maxSizeMB = 500,
  className 
}: VideoUploaderProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = async (videoFile: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Get upload URL from backend
      const uploadUrlResponse = await fetch("/api/videos/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: videoFile.name,
          fileType: videoFile.type,
          fileSizeBytes: videoFile.size,
          briefId,
          creatorEmail,
        }),
      });

      if (!uploadUrlResponse.ok) {
        const error = await uploadUrlResponse.json();
        throw new Error(error.error || "Failed to get upload URL");
      }

      const { uploadUrl, videoKey, publicUrl } = await uploadUrlResponse.json();

      // Step 2: Upload video to storage
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      // Handle upload completion
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });
      });

      // Start upload
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", videoFile.type);
      xhr.send(videoFile);

      await uploadPromise;

      // Step 3: Notify parent component
      setUploadComplete(true);
      onVideoUploaded(publicUrl, videoKey, videoFile);

      toast({
        title: "Upload successful",
        description: "Your video has been uploaded successfully.",
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const videoFile = acceptedFiles[0];
      setFile(videoFile);
      await uploadVideo(videoFile);
    }
  }, [briefId, creatorEmail]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv']
    },
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: isUploading || uploadComplete,
  });

  const removeVideo = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed transition-colors cursor-pointer",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                "relative overflow-hidden"
              )}
            >
              <input {...getInputProps()} />
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <UploadCloud className="h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">
                  {isDragActive ? "Drop your video here" : "Drag & drop your video here"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse your files
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: MP4, MOV, AVI, WebM, MKV (max {maxSizeMB}MB)
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileVideo className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium break-all">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      {!isUploading && !uploadComplete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={removeVideo}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {isUploading && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Uploading...</span>
                          <span className="font-medium">{uploadProgress}%</span>
                        </div>
                      </div>
                    )}

                    {uploadComplete && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Upload complete</span>
                      </div>
                    )}

                    {error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Please don't close this page while uploading</span>
        </div>
      )}
    </div>
  );
}