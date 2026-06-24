"use client";

type BodyNameProfileBarProps = {
  name: string;
  onNameChange: (name: string) => void;
  onLoad: () => void;
  loadMessage: string | null;
};

export default function BodyNameProfileBar({
  name,
  onNameChange,
  onLoad,
  loadMessage
}: BodyNameProfileBarProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">이름으로 불러오기</h2>
        <p className="text-sm text-slate-600">이름을 입력해 저장된 키·몸무게·성별을 불러올 수 있습니다.</p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 space-y-1 text-sm">
          <span className="font-medium">이름</span>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="예: 홍길동"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={onLoad}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          불러오기
        </button>
      </div>

      {loadMessage ? <p className="mt-3 text-sm text-amber-700">{loadMessage}</p> : null}
    </section>
  );
}
