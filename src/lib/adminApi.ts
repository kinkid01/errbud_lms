import api, { normalize } from './api';
import { AdminStats, User, Course, UserProgress, Certificate } from '@/types/admin';

function toCourse(doc: any): Course {
  const n = normalize(doc);
  return {
    id: n.id,
    title: n.title,
    description: n.description,
    coverImage: n.coverImage ?? '',
    status: n.status,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    curriculums: n.lessons ?? [],
  };
}

function toUser(doc: any): User {
  const n = normalize(doc);
  return {
    id: n.id,
    name: n.name,
    email: n.email,
    role: n.role,
    createdAt: n.createdAt,
    lastLogin: n.lastLogin,
    generatedPassword: doc.generatedPassword ?? '',
    emailVerified: doc.emailVerified,
    isAccountActive: doc.isAccountActive,
  };
}

export const adminApi = {
  async getDashboardStats(): Promise<AdminStats> {
    const [modulesRes, usersRes, certsRes] = await Promise.all([
      api.get('/modules'),
      api.get('/users'),
      api.get('/certificates'),
    ]);
    return {
      totalUsers: usersRes.data.data.length,
      totalCourses: modulesRes.data.data.length,
      activeLearners: usersRes.data.data.length,
      completedCourses: 0,
      totalCertificatesIssued: certsRes.data.data.length,
      averageScore: 0,
      completionRate: 0,
    };
  },

  async getUsers(): Promise<User[]> {
    const res = await api.get('/users');
    return res.data.data.map(toUser);
  },

  async createStudent(name: string, email: string): Promise<{ name: string; email: string; generatedPassword: string }> {
    console.log('adminApi.createStudent called:', { name, email });
    const res = await api.post('/users/create-student', { name, email });
    console.log('adminApi.createStudent response:', res.data);
    return res.data.data;
  },

  async refreshUserStatus(userId: string): Promise<User> {
    try {
      const res = await api.get(`/users/refresh/${userId}`);
      return toUser(res.data.data);
    } catch (error) {
      console.error('Failed to refresh user status:', error);
      throw error;
    }
  },

  async updateUserPassword(userId: string, newPassword: string): Promise<User> {
    try {
      const res = await api.put(`/users/${userId}/password`, { password: newPassword });
      return toUser(res.data.data);
    } catch (error) {
      console.error('Failed to update user password:', error);
      throw error;
    }
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      const res = await api.put(`/users/${userId}/status`, { isAccountActive: isActive });
      return toUser(res.data.data);
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw error;
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const res = await api.get(`/progress/user/${userId}`);
    return res.data.data.map((p: any) => ({
      id: normalize(p).id,
      userId,
      courseId: p.moduleId?._id ?? p.moduleId,
      status: p.status,
      enrolledAt: p.enrolledAt,
      completedAt: p.completedAt,
      curriculumProgress: (p.lessonProgress ?? []).map((lp: any) => ({
        id: lp._id ?? lp.id,
        curriculumId: lp.lessonId,
        status: lp.status,
        quizScore: lp.quizScore,
        attempts: lp.attempts,
      })),
      finalAssessmentScore: p.finalExamScore,
      certificateIssued: p.certificateIssued,
    }));
  },

  async getCourses(): Promise<Course[]> {
    const res = await api.get('/modules');
    return res.data.data.map(toCourse);
  },

  async createCourse(
    course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'curriculums'>
  ): Promise<Course> {
    const res = await api.post('/modules', course);
    return toCourse(res.data.data);
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const res = await api.put(`/modules/${id}`, updates);
    return toCourse(res.data.data);
  },

  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/modules/${id}`);
  },

  async getCertificates(): Promise<Certificate[]> {
    const res = await api.get('/certificates');
    return res.data.data.map((c: any) => {
      const n = normalize(c);
      return {
        id: n.id,
        userId: c.studentId?._id ?? c.studentId,
        courseId: '',
        userName: c.studentName,
        courseTitle: 'Errbud Professional Cleaning Program',
        completionDate: c.issuedAt,
        certificateId: n.id,
        score: c.score ?? 0,
      };
    });
  },

  async issueCertificate(userId: string, _courseId: string): Promise<Certificate> {
    const res = await api.post(`/certificates/issue/${userId}`, { score: 0 });
    const n = normalize(res.data.data);
    return {
      id: n.id,
      userId,
      courseId: '',
      userName: n.studentName,
      courseTitle: 'Errbud Professional Cleaning Program',
      completionDate: n.issuedAt,
      certificateId: n.id,
      score: res.data.data.score ?? 0,
    };
  },
};

// Keep these exports so existing pages that import mock data don't break
export const mockCourses: Course[] = [];
export const mockUsers: User[] = [];
export const mockUserProgress: UserProgress[] = [];
export const mockCertificates: Certificate[] = [];
