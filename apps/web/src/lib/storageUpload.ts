import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Compresses an image client-side to keep upload sizes under a few hundred KB
 * and max dimensions <= 1280px (compliant with Storage security rule < 2MB).
 */
export async function compressImage(
  fileOrBlob: File | Blob,
  maxSide: number = 1280,
  quality: number = 0.82
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image data'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSide) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          }
        } else {
          if (height > maxSide) {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP if supported, fallback to JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress canvas to blob'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Uploads a compressed image to Firebase Storage under `flats/{flatId}/expenses/{expenseId}.jpg`
 * and retrieves the authorized download URL.
 */
export async function uploadExpensePhoto(
  flatId: string,
  expenseId: string,
  imageBlob: Blob
): Promise<{ storagePath: string; downloadUrl: string }> {
  const filename = `${expenseId}_${Date.now()}.jpg`;
  const storagePath = `flats/${flatId}/expenses/${filename}`;
  const storageReference = ref(storage, storagePath);

  // Upload with metadata
  await uploadBytes(storageReference, imageBlob, {
    contentType: 'image/jpeg',
    customMetadata: {
      flatId,
      expenseId,
    },
  });

  const downloadUrl = await getDownloadURL(storageReference);

  return {
    storagePath,
    downloadUrl,
  };
}

