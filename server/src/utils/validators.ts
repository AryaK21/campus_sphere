import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').refine((val) => {
    // Check institutional email or standard educational domain format
    const allowed = process.env.ALLOWED_EMAIL_DOMAINS ? process.env.ALLOWED_EMAIL_DOMAINS.split(',') : ['edu', 'ac.in', 'campus.edu', 'univ.edu', 'gmail.com'];
    return allowed.some(dom => val.endsWith(dom) || val.includes(dom));
  }, {
    message: 'Institutional email format recommended (.edu, .ac.in, or university domain)'
  }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Student', 'Faculty', 'Admin']).default('Student'),
  department: z.string().min(2, 'Department is required'),
  semester: z.number().min(1).max(8).optional(),
  bio: z.string().max(500).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required')
});

export const subjectSchema = z.object({
  title: z.string().min(2, 'Subject title required'),
  code: z.string().min(2, 'Subject code required').toUpperCase(),
  department: z.string().min(2, 'Department required'),
  semester: z.number().min(1).max(8),
  syllabus: z.string().optional(),
  facultyAssigned: z.array(z.string()).optional()
});

export const resourceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  subjectId: z.string().min(1, 'Subject ID is required'),
  semester: z.number().min(1).max(8),
  department: z.string().min(2, 'Department is required'),
  resourceType: z.enum(['Notes', 'PPT', 'LabManual', 'PYQ', 'Syllabus', 'ReferenceBook', 'VideoLink', 'Assignment']),
  fileUrl: z.string().min(1, 'File URL or link is required'),
  fileType: z.string().optional().default('pdf')
});

export const noticeSchema = z.object({
  title: z.string().min(3, 'Notice title required'),
  content: z.string().min(10, 'Notice content must be at least 10 characters'),
  category: z.enum(['Department', 'Clubs', 'Placements', 'Exams', 'Workshops', 'Holidays']),
  targetAudience: z.array(z.string()).default(['All']),
  pinned: z.boolean().default(false),
  attachmentUrl: z.string().optional(),
  expiresAt: z.string().optional()
});

export const forumPostSchema = z.object({
  title: z.string().min(5, 'Post title must be at least 5 characters'),
  body: z.string().min(15, 'Post body must be at least 15 characters'),
  category: z.enum(['Placements', 'Internships', 'Coding', 'Projects', 'Exams', 'General']),
  tags: z.array(z.string()).default([])
});

export const forumCommentSchema = z.object({
  content: z.string().min(2, 'Comment cannot be empty'),
  parentCommentId: z.string().optional().nullable()
});

export const placementSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  role: z.string().min(2, 'Role is required'),
  package: z.string().optional(),
  location: z.string().optional(),
  eligibility: z.object({
    minCgpa: z.number().min(0).max(10).default(6.0),
    allowedDepartments: z.array(z.string()).default([]),
    allowedBatches: z.array(z.string()).default([]),
    backlogsAllowed: z.boolean().default(false)
  }),
  jobDescription: z.string().min(10, 'Job description required'),
  deadline: z.string().min(1, 'Application deadline is required'),
  applyUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['Active', 'Closed', 'Upcoming']).default('Active')
});

export const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});
