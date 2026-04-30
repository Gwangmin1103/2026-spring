import BodyStepForm from "@/app/components/BodyStepForm";

export default function BodyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">핏 분석 시작</h1>
        <p className="mt-1 text-sm text-slate-600">사진 1장 + 키/몸무게만 입력하면 신체 치수를 추정합니다.</p>
      </header>
      <BodyStepForm />
    </main>
  );
}
