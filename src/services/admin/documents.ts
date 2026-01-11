import { fetchAdminApi } from "./api";

interface SignedUploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

export async function getSignedUploadUrl(contentType: string): Promise<SignedUploadUrlResponse> {
  return fetchAdminApi("/api/v1/admin/documents/images/signed-url", {
    method: "POST",
    body: JSON.stringify({ content_type: contentType }),
  });
}

export async function uploadImageToGCS(file: File): Promise<string> {
  // Get signed URL from backend
  const { uploadUrl, publicUrl } = await getSignedUploadUrl(file.type);

  // Upload directly to GCS
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return publicUrl;
}
