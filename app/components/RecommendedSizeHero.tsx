type Props = {
  productName: string;
  sizeLabel: string;
};

export default function RecommendedSizeHero({ productName, sizeLabel }: Props) {
  return (
    <section className="flex h-full w-full flex-col justify-center rounded-2xl bg-slate-900 px-6 py-8 text-center text-white shadow-sm">
      <p className="text-sm font-medium leading-snug text-slate-300">{productName}</p>
      <p className="mt-4 text-6xl font-black tracking-tight sm:text-7xl">{sizeLabel}</p>
    </section>
  );
}
