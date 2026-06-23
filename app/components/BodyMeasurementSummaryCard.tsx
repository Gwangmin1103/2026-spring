type MeasurementItem = {
  label: string;
  value: number;
  unit?: string;
};

type Props = {
  title?: string;
  subtitle?: string;
  measurements: MeasurementItem[];
};

export default function BodyMeasurementSummaryCard({
  title = "내 신체 치수 요약",
  subtitle = "키·몸무게·성별 기반 추정 결과",
  measurements
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {measurements.map((item) => (
          <div key={item.label} className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {item.value}
              <span className="ml-0.5 text-sm font-medium text-slate-500">{item.unit ?? "cm"}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
