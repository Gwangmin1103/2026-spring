import { NextRequest, NextResponse } from "next/server";
import { parseProduct } from "@/app/lib/parser";

type CrawlRequestBody = {
  url: string;
  manualSizeText?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { url, manualSizeText } = (await req.json()) as CrawlRequestBody;

    if (!url) {
      return NextResponse.json({ error: "상품 URL이 필요합니다." }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      },
      cache: "no-store"
    });

    const html = res.ok ? await res.text() : "<html><title>상품명 미확인</title></html>";
    const parsed = parseProduct(url, html, manualSizeText);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    return NextResponse.json(
      { error: "크롤링 중 오류가 발생했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
