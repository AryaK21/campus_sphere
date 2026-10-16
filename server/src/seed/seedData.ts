import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Subject } from '../models/Subject';
import { Resource } from '../models/Resource';
import { Notice } from '../models/Notice';
import { ForumPost } from '../models/ForumPost';
import { ForumComment } from '../models/ForumComment';
import { Simulation } from '../models/Simulation';
import { Placement } from '../models/Placement';

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Checking and seeding initial CampusSphere dataset...');

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️ Database already populated with records. Skipping seed.');
      return;
    }

    console.log('🧹 Preparing fresh collections and indices...');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);

    // 1. Seed Users
    const users = await User.create([
      {
        name: 'Dr. Alok Verma',
        email: 'admin@campus.edu',
        passwordHash: adminPasswordHash,
        role: 'Admin',
        department: 'Administration',
        semester: 1,
        bio: 'Dean of Academic Computing and Infrastructure at CampusSphere.',
        profilePicUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
      },
      {
        name: 'Prof. Rajesh Sharma',
        email: 'prof.sharma@campus.edu',
        passwordHash: defaultPasswordHash,
        role: 'Faculty',
        department: 'Computer Science',
        semester: 1,
        bio: 'Professor of Algorithms & Operating Systems. Head of Distributed Systems Lab.',
        profilePicUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
      },
      {
        name: 'Dr. Ananya Sen',
        email: 'dr.ananya@campus.edu',
        passwordHash: defaultPasswordHash,
        role: 'Faculty',
        department: 'Information Technology',
        semester: 1,
        bio: 'Associate Professor specializing in Database Systems and Cloud Architecture.',
        profilePicUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
      },
      {
        name: 'Aarav Patel',
        email: 'aarav.patel@campus.edu',
        passwordHash: defaultPasswordHash,
        role: 'Student',
        department: 'Computer Science',
        semester: 6,
        bio: 'Full Stack Developer | Competitive Programmer (Candidate Master on CF) | Google Summer of Code 2024.',
        profilePicUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
      },
      {
        name: 'Priya Verma',
        email: 'priya.verma@campus.edu',
        passwordHash: defaultPasswordHash,
        role: 'Student',
        department: 'Information Technology',
        semester: 4,
        bio: 'Tech enthusiast, Open Source contributor, and Vice-President of ACM Student Chapter.',
        profilePicUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
      },
      {
        name: 'Rohit Sharma',
        email: 'rohit.sharma@campus.edu',
        passwordHash: defaultPasswordHash,
        role: 'Student',
        department: 'Computer Science',
        semester: 8,
        bio: 'Incoming SDE at Microsoft IDC | Ex-Amazon Intern | Mentor for Junior Batches.',
        profilePicUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        socialLinks: { linkedin: 'https://linkedin.com', github: 'https://github.com' },
      }
    ]);

    const adminUser = users[0];
    const faculty1 = users[1];
    const faculty2 = users[2];
    const student1 = users[3];
    const student2 = users[4];
    const student3 = users[5];

    // 2. Seed Subjects
    const subjects = await Subject.create([
      {
        title: 'Data Structures and Algorithms',
        code: 'CS301',
        department: 'Computer Science',
        semester: 3,
        syllabus: 'Linear & Non-linear data structures, Trees, AVL, Heaps, Graphs, Sorting, Dynamic Programming, Greedy Algorithms.',
        facultyAssigned: [faculty1._id],
      },
      {
        title: 'Operating Systems & Concurrency',
        code: 'CS402',
        department: 'Computer Science',
        semester: 4,
        syllabus: 'Processes, Threads, CPU Scheduling, Synchronization, Deadlocks, Memory Management, Paging, Virtual Memory, File Systems.',
        facultyAssigned: [faculty1._id],
      },
      {
        title: 'Database Management Systems',
        code: 'CS503',
        department: 'Computer Science',
        semester: 5,
        syllabus: 'Relational Model, ER Diagrams, Normalization (1NF to BCNF), SQL, Transaction Processing, ACID properties, Concurrency Control, Indexing (B+ Trees).',
        facultyAssigned: [faculty2._id],
      },
      {
        title: 'Computer Networks & Internet Protocols',
        code: 'CS601',
        department: 'Computer Science',
        semester: 6,
        syllabus: 'OSI & TCP/IP stack, Data Link Layer, IP Addressing & Subnetting, Routing Algorithms (Dijkstra, Bellman-Ford), TCP vs UDP, Socket Programming.',
        facultyAssigned: [faculty1._id],
      },
      {
        title: 'Digital Electronics & Logic Design',
        code: 'EC204',
        department: 'Electronics',
        semester: 2,
        syllabus: 'Boolean Algebra, Logic Gates, Karnaugh Maps (K-Maps), Multiplexers, Decoders, Flip-Flops, Counters, Registers.',
        facultyAssigned: [faculty2._id],
      },
      {
        title: 'Cloud Architecture & DevOps',
        code: 'IT504',
        department: 'Information Technology',
        semester: 5,
        syllabus: 'Cloud service models (IaaS, PaaS, SaaS), Virtualization, Containers (Docker), Kubernetes Orchestration, CI/CD pipelines.',
        facultyAssigned: [faculty2._id],
      }
    ]);

    // 3. Seed Course Resources
    const resources = await Resource.create([
      {
        title: 'Complete Hand-Written DSA Lecture Notes & Cheatsheet',
        description: 'Comprehensive chapter-wise handwritten notes covering Asymptotic notations, Trees, Graph traversals, and DP patterns with LeetCode solutions.',
        subjectId: subjects[0]._id,
        semester: 3,
        department: 'Computer Science',
        uploadedBy: faculty1._id,
        resourceType: 'Notes',
        fileUrl: 'https://raw.githubusercontent.com/campus-sphere/assets/main/DSA_Master_Notes.pdf',
        fileType: 'pdf',
        downloadCount: 342,
        ratings: [
          { userId: student1._id, rating: 5, comment: 'The best explanation of Dijkstra and Red-Black trees!', createdAt: new Date() },
          { userId: student2._id, rating: 5, comment: 'Extremely clear diagrams for midterm preparation.', createdAt: new Date() },
        ],
        averageRating: 5.0,
      },
      {
        title: 'Operating Systems CPU Scheduling & Memory Lab Manual (with C Code)',
        description: 'Complete lab guide containing C programs for FCFS, SJF, Round Robin, Banker Algorithm, and LRU Page Replacement with output simulations.',
        subjectId: subjects[1]._id,
        semester: 4,
        department: 'Computer Science',
        uploadedBy: faculty1._id,
        resourceType: 'LabManual',
        fileUrl: 'https://raw.githubusercontent.com/campus-sphere/assets/main/OS_Lab_Manual.pdf',
        fileType: 'pdf',
        downloadCount: 215,
        ratings: [
          { userId: student3._id, rating: 4, comment: 'Very helpful code snippets for the lab exams.', createdAt: new Date() },
        ],
        averageRating: 4.0,
      },
      {
        title: 'DBMS End-Semester Previous Year Question Papers (2020-2024)',
        description: 'Past 5 years solved university question papers with detailed step-by-step solutions for 3NF/BCNF decompositions and SQL subqueries.',
        subjectId: subjects[2]._id,
        semester: 5,
        department: 'Computer Science',
        uploadedBy: student3._id,
        resourceType: 'PYQ',
        fileUrl: 'https://raw.githubusercontent.com/campus-sphere/assets/main/DBMS_PYQs_Solved.pdf',
        fileType: 'pdf',
        downloadCount: 489,
        ratings: [
          { userId: student1._id, rating: 5, comment: '80% of questions in our midterms were directly from this bundle!', createdAt: new Date() },
        ],
        averageRating: 5.0,
      },
      {
        title: 'Computer Networks Packet Routing & Subnetting PPT Slides',
        description: 'Official slide decks explaining IPv4/IPv6 CIDR block allocation, VLSM formulas, and BGP/OSPF dynamic routing protocol diagrams.',
        subjectId: subjects[3]._id,
        semester: 6,
        department: 'Computer Science',
        uploadedBy: faculty1._id,
        resourceType: 'PPT',
        fileUrl: 'https://raw.githubusercontent.com/campus-sphere/assets/main/CN_Subnetting_Slides.pptx',
        fileType: 'ppt',
        downloadCount: 178,
        ratings: [
          { userId: student2._id, rating: 5, comment: 'Great visual representation of TCP 3-way handshake.', createdAt: new Date() },
        ],
        averageRating: 5.0,
      },
      {
        title: 'Digital Logic K-Map Simplification & Logic Gates Reference Guide',
        description: 'Guide for 2-variable to 5-variable Karnaugh Maps, Don\'t Care condition simplifications, and multiplexer implementations.',
        subjectId: subjects[4]._id,
        semester: 2,
        department: 'Electronics',
        uploadedBy: faculty2._id,
        resourceType: 'ReferenceBook',
        fileUrl: 'https://raw.githubusercontent.com/campus-sphere/assets/main/Digital_Logic_Guide.pdf',
        fileType: 'pdf',
        downloadCount: 130,
        ratings: [],
        averageRating: 4.5,
      }
    ]);

    // Save bookmarks on student
    student1.savedResources = [resources[0]._id, resources[2]._id];
    await student1.save();

    // 4. Seed Digital Notices
    await Notice.create([
      {
        title: '⚡ End-Semester Examination Schedule (Spring 2026)',
        content: 'The official timetable for End-Semester examinations has been published. Theory exams commence from May 15th. Admit cards will be distributed through the portal starting next Monday. Strict compliance with anti-malpractice rules is mandated.',
        category: 'Exams',
        postedBy: adminUser._id,
        targetAudience: ['All'],
        pinned: true,
        attachmentUrl: 'https://raw.githubusercontent.com/campus-sphere/assets/main/EndSem_Timetable_2026.pdf',
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        title: '🚀 Microsoft IDC Campus Recruitment Drive 2026 — SDE Role',
        content: 'Microsoft IDC is visiting for 2026 passing out batch for Software Development Engineer (Full-Time) and 6-Month Internships. Minimum CGPA: 7.5, Eligible branches: CS, IT, ECE. Online Coding Round scheduled on Sunday at 10:00 AM on HackerRank.',
        category: 'Placements',
        postedBy: faculty1._id,
        targetAudience: ['Student', 'Computer Science', 'Information Technology'],
        pinned: true,
        attachmentUrl: '',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: '🏆 Annual Hackathon "HackSphere 2026" Registrations Open!',
        content: 'CampusSphere ACM Chapter presents a 36-hour flagship hackathon with prize pool of ₹2,50,000 across Web3, AI/ML, Cloud, and EdTech tracks. Free food, swag kits, and direct mentorship from top industry sponsors.',
        category: 'Workshops',
        postedBy: student2._id,
        targetAudience: ['All'],
        pinned: false,
        attachmentUrl: '',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        title: '📢 Departmental Seminar on Modern Distributed Cloud Storage',
        content: 'Guest lecture by Dr. Vivek (Staff Engineer at Google) on "Designing Bigtable and Distributed Consensus with Paxos". Mandatory attendance for Sem 6 & Sem 8 students in Auditorium 2.',
        category: 'Department',
        postedBy: faculty2._id,
        targetAudience: ['Computer Science', 'Information Technology'],
        pinned: false,
        attachmentUrl: '',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    ]);

    // 5. Seed Forum Posts & Comments
    const post1 = await ForumPost.create({
      title: 'How to effectively prepare for Microsoft SDE On-Campus Coding & System Design Rounds?',
      body: 'Hey seniors! With Microsoft visiting next month for 2026 grads, what should be the primary focus in DSA topics? How heavily do they ask low-level design vs standard LeetCode mediums? Any tips on what to highlight in resume projects?',
      author: student1._id,
      category: 'Placements',
      tags: ['Microsoft', 'Placements', 'DSA', 'InterviewPrep', 'Resume'],
      upvotes: [student1._id, student2._id, faculty1._id],
      status: 'Resolved',
      commentsCount: 2,
      viewsCount: 145,
    });

    const comment1 = await ForumComment.create({
      postId: post1._id,
      author: student3._id, // Rohit (placed at Microsoft)
      content: 'Here is my complete breakdown from last year\'s Microsoft drive:\n1. **Online Assessment**: 2 LeetCode medium questions (focus heavily on Binary Trees, DFS/BFS, and Dynamic Programming with strings).\n2. **Round 1 (DSA)**: Graph algorithms (Topological Sort / Dijkstra) and Trie based lookup. Write clean, modular code with descriptive variable names.\n3. **Round 2 (Low Level Design)**: They asked to design an in-memory Parking Lot system or LRU Cache. Practice OOPS principles and SOLID patterns.\n4. **Round 3 (HM / Culture)**: Behavioral questions using STAR methodology. Be ready to explain your deepest project challenges.',
      isBestAnswer: true,
      upvotes: [student1._id, student2._id, faculty1._id],
    });

    const comment2 = await ForumComment.create({
      postId: post1._id,
      author: faculty1._id,
      content: 'I second Rohit\'s advice. In addition, please review concurrency and OS process synchronization concepts, as Microsoft interviewers often probe how thread-safety is achieved in your code.',
      isBestAnswer: false,
      upvotes: [student1._id],
    });

    post1.bestAnswerId = comment1._id;
    await post1.save();

    const post2 = await ForumPost.create({
      title: 'Understanding Multi-Level Feedback Queue (MLFQ) Scheduling vs Standard Round Robin',
      body: 'I am solving the OS assignment and trying to understand why MLFQ is preferred over simple Round Robin in production operating systems like Linux and macOS. How does priority boost prevent process starvation?',
      author: student2._id,
      category: 'Coding',
      tags: ['OperatingSystems', 'CPUScheduling', 'CS402', 'Algorithms'],
      upvotes: [student2._id, student1._id],
      status: 'Open',
      commentsCount: 1,
      viewsCount: 88,
    });

    await ForumComment.create({
      postId: post2._id,
      author: faculty1._id,
      content: 'Great question Priya! Simple Round Robin treats all processes equally with a fixed quantum, which hurts interactive I/O-bound jobs. MLFQ dynamically adjusts priority: CPU-bound processes drop to lower priority queues with longer quantums, while I/O-bound interactive processes stay at top priority for quick response times. Periodic Priority Boost moves all jobs to the highest queue, preventing long-running starvation!',
      isBestAnswer: false,
      upvotes: [student1._id, student2._id],
    });

    // 6. Seed Educational Simulations
    await Simulation.create([
      {
        title: 'Algorithm & Graph Traversal Visualizer',
        module: 'DSA',
        slug: 'sorting-algorithms',
        description: 'Interactive real-time visualizer for Sorting Algorithms (Bubble, Selection, Insertion, Merge, Quick) and Graph Pathfinding (Dijkstra, BFS, DFS) with step-by-step state inspection.',
        metadata: {
          complexity: {
            bubbleSort: { time: 'O(N^2)', space: 'O(1)' },
            quickSort: { time: 'O(N log N)', space: 'O(log N)' },
            mergeSort: { time: 'O(N log N)', space: 'O(N)' },
            dijkstra: { time: 'O((V+E) log V)', space: 'O(V)' },
          }
        },
        usageStats: { views: 430, runs: 182 },
      },
      {
        title: 'CPU Scheduling & Gantt Chart Simulator',
        module: 'OS',
        slug: 'cpu-scheduling',
        description: 'Dynamic Process Scheduling Visualizer for FCFS, SJF (Preemptive SRTF & Non-Preemptive), Priority, and Round Robin with dynamic Gantt charts and TAT/WT analytics.',
        metadata: {
          supportedAlgorithms: ['FCFS', 'SJF-NonPreemptive', 'SRTF-Preemptive', 'RoundRobin', 'Priority'],
        },
        usageStats: { views: 512, runs: 240 },
      },
      {
        title: 'Interactive Logic Gates & Truth Table Canvas',
        module: 'DigitalElectronics',
        slug: 'logic-gates',
        description: 'Real-time digital logic circuit builder supporting AND, OR, NOT, NAND, NOR, XOR, XNOR gates with live wire conduction and automated truth table synthesis.',
        metadata: {
          gates: ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'],
        },
        usageStats: { views: 280, runs: 95 },
      },
      {
        title: 'Packet Routing & Subnetting Calculator',
        module: 'Networks',
        slug: 'packet-routing',
        description: 'Visual hop-by-hop shortest path packet routing through configurable network topologies with CIDR Subnet Calculator and IP Range visualizer.',
        metadata: {
          tools: ['SPF Routing', 'Subnet Calculator', 'CIDR Mask Breakdown'],
        },
        usageStats: { views: 310, runs: 120 },
      }
    ]);

    // 7. Seed Placement Drives
    await Placement.create([
      {
        companyName: 'Microsoft',
        role: 'Software Development Engineer (SDE-1)',
        package: '44 LPA (Base: 15.5 LPA + Stocks + Bonus)',
        location: 'Hyderabad / Bangalore / Noida',
        eligibility: {
          minCgpa: 7.5,
          allowedDepartments: ['Computer Science', 'Information Technology', 'Electronics'],
          allowedBatches: ['2026'],
          backlogsAllowed: false,
        },
        jobDescription: 'Design, write, and deploy resilient scalable cloud microservices on Azure. Collaborate with cross-functional product teams to build features used by billions globally.',
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        applyUrl: 'https://careers.microsoft.com',
        status: 'Active',
        interviewExperiences: [
          {
            author: student3._id,
            roundDetails: '4 Rounds total: 1 Online Assessment + 2 Technical DSA/Design rounds + 1 As-Appropriate (AA) Director round.',
            tips: 'Focus heavily on Tree structures, DP, and writing unit test cases on whiteboard during the interview.',
            outcome: 'Selected',
            createdAt: new Date(),
          }
        ],
        attachments: [],
      },
      {
        companyName: 'Google',
        role: 'Software Engineer University Graduate',
        package: '38 LPA',
        location: 'Bangalore / Hyderabad',
        eligibility: {
          minCgpa: 8.0,
          allowedDepartments: ['Computer Science', 'Information Technology'],
          allowedBatches: ['2026'],
          backlogsAllowed: false,
        },
        jobDescription: 'Solve planetary scale computing challenges across Search, Cloud, Android, and Core infrastructure with high algorithmic efficiency.',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        applyUrl: 'https://careers.google.com',
        status: 'Active',
        interviewExperiences: [],
        attachments: [],
      },
      {
        companyName: 'Amazon',
        role: 'SDE Intern (6 Months)',
        package: '₹80,000 / month + PPO Opportunity',
        location: 'Bangalore / Chennai / Hyderabad',
        eligibility: {
          minCgpa: 7.0,
          allowedDepartments: ['Computer Science', 'Information Technology', 'Electronics'],
          allowedBatches: ['2026', '2027'],
          backlogsAllowed: false,
        },
        jobDescription: 'Work on Amazon Web Services (AWS) or Retail Infrastructure services. Build high-throughput REST APIs and distributed event streaming pipelines.',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        applyUrl: 'https://amazon.jobs',
        status: 'Active',
        interviewExperiences: [],
        attachments: [],
      },
      {
        companyName: 'Oracle',
        role: 'Cloud Engineer / Systems Developer',
        package: '20 LPA',
        location: 'Bangalore / Hyderabad / Pune',
        eligibility: {
          minCgpa: 6.5,
          allowedDepartments: ['Computer Science', 'Information Technology'],
          allowedBatches: ['2026'],
          backlogsAllowed: true,
        },
        jobDescription: 'Oracle Cloud Infrastructure (OCI) engineering, kernel performance tuning, and distributed database cluster optimization.',
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Closed drive for testing
        applyUrl: 'https://oracle.com/careers',
        status: 'Closed',
        interviewExperiences: [],
        attachments: [],
      }
    ]);

    console.log('✅ CampusSphere initial dataset seeded successfully!');
  } catch (error) {
    console.error('❌ Database Seeding error:', error);
  }
};
