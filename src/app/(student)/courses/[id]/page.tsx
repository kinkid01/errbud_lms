"use client";

import { use } from "react";
import CurriculumViewer from "@/components/course/CurriculumViewer";

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CurriculumViewer courseId={id} />;
}
