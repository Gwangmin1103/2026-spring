import ProductStepForm from "@/app/components/ProductStepForm";

export default function ProductPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">상품 정보 입력</h1>
        <p className="mt-1 text-sm text-slate-600">무신사/29CM 링크를 넣고 사이즈 후보를 비교하세요.</p>
      </header>
      <ProductStepForm />
    </main>
  );
}
