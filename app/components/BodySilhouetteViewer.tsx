"use client";

import ClothingMeasurementSilhouette, {
  GarmentSilhouetteMeasurement
} from "@/app/components/ClothingMeasurementSilhouette";

type Props = {
  measurements: GarmentSilhouetteMeasurement[];
};

export default function BodySilhouetteViewer({ measurements }: Props) {
  return (
    <ClothingMeasurementSilhouette
      measurements={measurements}
      title="인체 실루엣 핏 오버레이"
    />
  );
}
