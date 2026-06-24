type ProductImageGalleryProps = {
  imageUrls: string[];
  productName: string;
};

export default function ProductImageGallery({ imageUrls, productName }: ProductImageGalleryProps) {
  if (imageUrls.length === 0) return null;

  return (
    <section aria-label="상품 이미지" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex gap-3 overflow-x-auto p-4 snap-x snap-mandatory">
        {imageUrls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="h-48 w-36 shrink-0 snap-start overflow-hidden rounded-xl bg-slate-100 sm:h-56 sm:w-44"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${productName} 이미지 ${index + 1}`}
              className="h-full w-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
