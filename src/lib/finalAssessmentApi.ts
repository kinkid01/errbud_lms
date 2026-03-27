import api, { normalize } from './api';
import { FinalAssessment, Question } from '@/types/admin';

function toExam(doc: any): FinalAssessment {
  const n = normalize(doc);
  return {
    id: n.id,
    courseId: 'general',
    questions: (n.questions ?? []).map((q: any) => ({
      id: q._id ?? q.id ?? '',
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer ?? 0,
    })),
    passingScore: n.passingScore,
    timeLimit: n.timeLimit,
  };
}

export const finalAssessmentApi = {
  // Get the single general exam (admin — includes correct answers)
  async getGeneralExam(): Promise<FinalAssessment | null> {
    const res = await api.get('/exam');
    return res.data.data ? toExam(res.data.data) : null;
  },

  // All exams are the same general exam in this backend
  async getFinalAssessment(_courseId: string): Promise<FinalAssessment | null> {
    return this.getGeneralExam();
  },

  async createFinalAssessment(assessment: Omit<FinalAssessment, 'id'>): Promise<FinalAssessment> {
    const res = await api.post('/exam', assessment);
    return toExam(res.data.data);
  },

  async updateFinalAssessment(_id: string, updates: Partial<FinalAssessment>): Promise<FinalAssessment> {
    const res = await api.put('/exam', updates);
    return toExam(res.data.data);
  },

  async deleteFinalAssessment(_id: string): Promise<void> {
    throw new Error('Deleting the exam is not supported. Use updateFinalAssessment to clear questions instead.');
  },

  async generateQuestions(_courseId: string, _questionCount: number = 20): Promise<Question[]> {
    // Not implemented in the backend — admin must write questions manually
    return [];
  },

  async getAssessmentResults(_courseId: string, _userId: string): Promise<any> {
    return null;
  },
};

// Keep empty export so pages importing mockFinalAssessments don't break
export const mockFinalAssessments: FinalAssessment[] = [];
