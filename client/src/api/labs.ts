export async function uploadLabFile(file: File) {
  return {
    fileName: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}
