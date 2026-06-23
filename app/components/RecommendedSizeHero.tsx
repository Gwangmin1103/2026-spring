type Props = {
  sizeLabel: string;
  description?: string;
};

export default function RecommendedSizeHero({
  sizeLabel,
  description = "부위별 핏 분석 결과, 가장 균형 잡힌 사이즈입니다."
}: Props) {
  return (
    <section className="rounded-2xl bg-slate-900 px-6 py-8 text-center text-white shadow-sm">
      <p className="text-sm font-medium uppercase tracking-widest text-slate-300">최종 추천 사이즈</p>
      <p className="mt-3 text-6xl font-black tracking-tight sm:text-7xl">{sizeLabel}</p>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-300">{description}</p>
    </section>
  );
}
