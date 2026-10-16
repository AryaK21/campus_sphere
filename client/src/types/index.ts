export type Role = 'Student' | 'Faculty' | 'Admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  semester?: number;
  profilePicUrl?: string;
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  savedResources?: string[] | Resource[];
  createdAt: string;
}

export interface Subject {
  _id: string;
  title: string;
  code: string;
  department: string;
  semester: number;
  syllabus?: string;
  facultyAssigned?: User[];
  createdAt: string;
}

export type ResourceType = 'Notes' | 'PPT' | 'LabManual' | 'PYQ' | 'Syllabus' | 'ReferenceBook' | 'VideoLink' | 'Assignment';

export interface Rating {
  _id?: string;
  userId: User | string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Resource {
  _id: string;
  title: string;
  description?: string;
  subjectId: Subject;
  semester: number;
  department: string;
  uploadedBy: User;
  resourceType: ResourceType;
  fileUrl: string;
  fileType: string;
  downloadCount: number;
  ratings: Rating[];
  ratingsCount?: number;
  averageRating: number;
  createdAt: string;
}

export type NoticeCategory = 'Department' | 'Clubs' | 'Placements' | 'Exams' | 'Workshops' | 'Holidays';

export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  postedBy: User;
  targetAudience: string[];
  pinned: boolean;
  attachmentUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

export type ForumCategory = 'Placements' | 'Internships' | 'Coding' | 'Projects' | 'Exams' | 'General';

export interface ForumComment {
  _id: string;
  postId: string;
  author: User;
  content: string;
  parentCommentId?: string | null;
  upvotes: string[];
  isBestAnswer: boolean;
  createdAt: string;
}

export interface ForumPost {
  _id: string;
  title: string;
  body: string;
  author: User;
  category: ForumCategory;
  tags: string[];
  upvotes: string[];
  bestAnswerId?: ForumComment | string;
  status: 'Open' | 'Resolved';
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
}

export type SimulationModule = 'DSA' | 'OS' | 'Networks' | 'DBMS' | 'DigitalElectronics';

export interface Simulation {
  _id: string;
  title: string;
  module: SimulationModule;
  slug: string;
  description: string;
  metadata?: Record<string, any>;
  usageStats: {
    views: number;
    runs: number;
  };
}

export interface InterviewExperience {
  _id?: string;
  author: User;
  roundDetails: string;
  tips: string;
  outcome: 'Selected' | 'Rejected' | 'In-Progress';
  createdAt: string;
}

export interface Placement {
  _id: string;
  companyName: string;
  role: string;
  package?: string;
  location?: string;
  eligibility: {
    minCgpa: number;
    allowedDepartments: string[];
    allowedBatches: string[];
    backlogsAllowed: boolean;
  };
  jobDescription: string;
  deadline: string;
  applyUrl?: string;
  status: 'Active' | 'Closed' | 'Upcoming';
  interviewExperiences: InterviewExperience[];
  attachments: string[];
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  errors?: any;
}
