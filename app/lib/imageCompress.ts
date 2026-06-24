const DEFAULT_MAX_SIZE = 800;
const DEFAULT_QUALITY = 0.7;

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
  const compressed = canvas.toDataURL("image/jpeg", quality);
  return compressed.split(",")[1] ?? "";
}
