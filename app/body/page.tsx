import BodyStepForm from "@/app/components/BodyStepForm";

export default function BodyPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">핏 분석</h1>
        <p className="mt-1 text-sm text-slate-600">
          신체 정보와 상품 링크를 입력하면 실측 사이즈와 비교해 핏을 분석합니다.
        </p>
      </header>
      <BodyStepForm />
    </main>
  );
}
