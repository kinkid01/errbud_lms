export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  generatedPassword?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  duration: number; // in hours
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  curriculums: Curriculum[];
}

export interface Curriculum {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  visualContent?: string; // image or video URL
  order: number;
  quiz: Quiz;
}

export interface Quiz {
  id: string;
  curriculumId: string;
  questions: Question[];
  passingScore: number; // default 60
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // index of correct option
}

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  enrolledAt: string;
  completedAt?: string;
  curriculumProgress: CurriculumProgress[];
  finalAssessmentScore?: number;
  certificateIssued?: boolean;
}

export interface CurriculumProgress {
  id: string;
  curriculumId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  quizScore?: number;
  attempts: number;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  userName: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
  score: number;
  pdfUrl?: string;
}

export interface FinalAssessment {
  id: string;
  courseId: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  activeLearners: number;
  completedCourses: number;
  totalCertificatesIssued: number;
  averageScore: number;
  completionRate: number;
}
