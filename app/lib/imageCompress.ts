const DEFAULT_MAX_SIZE = 600;
const DEFAULT_QUALITY = 0.5;
const MAX_BASE64_BYTES = 3 * 1024 * 1024;

function getBase64ByteSize(base64: string): number {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function scaleDimensions(width: number, height: number, maxSize: number) {
  if (width <= maxSize && height <= maxSize) {
    return { width, height };
  }

  if (width >= height) {
    const nextWidth = maxSize;
    return { width: nextWidth, height: Math.round((height / width) * nextWidth) };
  }

  const nextHeight = maxSize;
  return { width: Math.round((width / height) * nextHeight), height: nextHeight };
}

export async function compressImageToBase64(
  file: File,
  options?: { maxSize?: number; quality?: number }
): Promise<string> {
  const maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE;
  const quality = options?.quality ?? DEFAULT_QUALITY;
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const { width, height } = scaleDimensions(image.width, image.height, maxSize);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("이미지 압축을 지원하지 않는 환경입니다.");
  }

  context.drawImage(image, 0, 0, width, height);
  let base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1] ?? "";

  if (getBase64ByteSize(base64) > MAX_BASE64_BYTES) {
    base64 = canvas.toDataURL("image/jpeg", 0.3).split(",")[1] ?? "";
  }

  return base64;
}
