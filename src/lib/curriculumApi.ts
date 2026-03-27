import api, { normalize } from './api';
import { Curriculum, Quiz } from '@/types/admin';

function toLesson(doc: any): Curriculum {
  const n = normalize(doc);
  return {
    id: n.id,
    courseId: doc.moduleId?._id ?? doc.moduleId ?? '',
    title: n.title,
    description: n.description,
    content: n.content,
    visualContent: n.visualContent,
    order: n.order,
    quiz: n.quiz ?? { id: n.id, curriculumId: n.id, questions: [], passingScore: 60 },
  };
}

export const curriculumApi = {
  async getCurriculumsByCourse(courseId: string): Promise<Curriculum[]> {
    const res = await api.get(`/lessons/module/${courseId}`);
    return res.data.data.map(toLesson);
  },

  async createCurriculum(curriculum: Omit<Curriculum, 'id'>): Promise<Curriculum> {
    const { courseId, ...rest } = curriculum;
    const res = await api.post('/lessons', { ...rest, moduleId: courseId });
    return toLesson(res.data.data);
  },

  async updateCurriculum(id: string, updates: Partial<Curriculum>): Promise<Curriculum> {
    const { courseId, ...rest } = updates as any;
    const payload = courseId ? { ...rest, moduleId: courseId } : rest;
    const res = await api.put(`/lessons/${id}`, payload);
    return toLesson(res.data.data);
  },

  async deleteCurriculum(id: string): Promise<void> {
    await api.delete(`/lessons/${id}`);
  },

  async reorderCurriculums(_courseId: string, curriculumIds: string[]): Promise<void> {
    await api.put('/lessons/reorder', { orderedIds: curriculumIds });
  },

  async updateQuiz(curriculumId: string, quiz: Quiz): Promise<Quiz> {
    const res = await api.put(`/lessons/${curriculumId}`, { quiz });
    return toLesson(res.data.data).quiz;
  },
};

// Keep empty export so pages importing mockCurriculums don't break
export const mockCurriculums: Curriculum[] = [];
