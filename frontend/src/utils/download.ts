/**
 * Robust utility to download an image/file directly to the user's device
 * with original byte fidelity.
 */
export async function downloadAsset(
  url: string,
  fileName: string = "proofmint-asset.png"
): Promise<void> {
  if (!url) return;

  try {
    // 1. Preferred method: Fetch blob directly to ensure exact binary bytes and precise fileName
    const res = await fetch(url);
    if (!res.ok) throw new Error("Fetch failed with status " + res.status);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1500);
  } catch (err) {
    console.warn("Direct blob download failed, falling back to attachment URL:", err);

    // 2. Fallback: Cloudinary attachment header fl_attachment
    const fallbackUrl = url.includes("/upload/")
      ? url.replace("/upload/", "/upload/fl_attachment/")
      : url;

    const link = document.createElement("a");
    link.href = fallbackUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
