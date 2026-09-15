export type UploadFileStatus = "pending" | "uploading" | "success" | "error";

export interface UploadFile {
  id: string;
  file: File;
  previewUrl: string;
  status: UploadFileStatus;
  error?: string;
}

export type UploadDialogStatus = "idle" | "ready" | "uploading" | "success" | "error";
