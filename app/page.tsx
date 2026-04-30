import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/body");
}
// 배포 재시도용 주석 