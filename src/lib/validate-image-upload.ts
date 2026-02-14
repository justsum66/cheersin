/**
 * SEC-012：圖片上傳驗證 — 白名單 MIME、大小限制，供 /api/upload 等使用
 */

export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
/** 單檔大小上限 5MB */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export type ValidateImageUploadResult =
  | { ok: true }
  | { ok: false; status: number; code: string; message: string }

/**
 * 驗證上傳檔案為允許的圖片類型且未超過大小上限
 */
export function validateImageUpload(blob: Blob): ValidateImageUploadResult {
  const type = blob.type?.toLowerCase()
  if (!type || !ALLOWED_IMAGE_TYPES.has(type)) {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_FILE_TYPE',
      message: 'Only image/jpeg, image/png, image/webp are allowed',
    }
  }
  if (blob.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      status: 400,
      code: 'FILE_TOO_LARGE',
      message: 'File too large (max 5MB)',
    }
  }
  return { ok: true }
}
