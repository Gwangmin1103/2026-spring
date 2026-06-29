import { NextRequest, NextResponse } from "next/server";
import { analyzeAllSizes } from "@/app/lib/fitEngine";
import { createFinalFitComment } from "@/app/lib/claude";
import { BodyEstimationResult, ProductInfo } from "@/app/lib/types";

type AnalyzeRequestBody = {
  bodyEstimation: BodyEstimationResult;
  product: ProductInfo;
  recommendedSize?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { bodyEstimation, product, recommendedSize: requestedSize } = (await req.json()) as AnalyzeRequestBody;

    const analyzed = analyzeAllSizes(bodyEstimation.estimated, product);
    const recommendedSize = requestedSize ?? analyzed.recommendedSize;
    const aiDescription = await createFinalFitComment({
      bodyEstimation,
      product,
      analyses: analyzed.analyses,
      recommendedSize
    });

    return NextResponse.json({
      success: true,
      data: { ...analyzed, recommendedSize, aiComment: aiDescription }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "핏 분석 중 오류가 발생했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
