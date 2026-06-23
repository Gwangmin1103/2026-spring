"use client";

import ClothingMeasurementSilhouette, {
  GarmentSilhouetteMeasurement
} from "@/app/components/ClothingMeasurementSilhouette";
import { GarmentCategory } from "@/app/lib/types";

type Props = {
  category: GarmentCategory;
  measurements: GarmentSilhouetteMeasurement[];
};

export default function BodySilhouetteViewer({ category, measurements }: Props) {
  return (
    <ClothingMeasurementSilhouette
      category={category}
      measurements={measurements}
      title="인체 실루엣 핏 오버레이"
    />
  );
}
