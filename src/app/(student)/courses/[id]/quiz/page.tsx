"use client";

import { use } from "react";
import CourseQuiz from "@/components/quiz/CourseQuiz";

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CourseQuiz courseId={id} />;
}
