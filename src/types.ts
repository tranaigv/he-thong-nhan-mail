export type UserRole =
  | 'SUPER_ADMIN'
  | 'HIEU_TRUONG'
  | 'PHO_HIEU_TRUONG'
  | 'VAN_PHONG'
  | 'VAN_THU'
  | 'KE_TOAN'
  | 'TO_TRUONG'
  | 'TO_PHO'
  | 'GIAO_VIEN'
  | 'GV_CHU_NHIEM'
  | 'NHAN_VIEN'
  | 'XEM'
  | 'KHACH';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatar: string;
  fieldsOfWork: string[];
  status: 'ACTIVE' | 'LOCKED';
}

export type UrgencyLevel = 'Hỏa tốc' | 'Thượng khẩn' | 'Khẩn' | 'Bình thường';
export type ConfidentialityLevel = 'Tuyệt mật' | 'Mật' | 'Thường';
export type DocStatus =
  | 'Mới tiếp nhận'
  | 'Đã xử lý AI'
  | 'Chờ BGH duyệt'
  | 'Đã duyệt & giao việc'
  | 'Đang thực hiện'
  | 'Hoàn thành'
  | 'Lưu trữ';

export interface DocumentItem {
  id: string;
  documentNumber: string;
  title: string;
  issuingAgency: string;
  signer: string;
  signerTitle: string;
  issueDate: string;
  effectiveDate?: string;
  deadline?: string;
  urgency: UrgencyLevel;
  confidentiality: ConfidentialityLevel;
  status: DocStatus;
  summary: string;
  rawText?: string;
  legalReferences: string[];
  recipients: string[];
  attachments: string[];
  reportingRequirements?: string;
  version: 'V1' | 'V2' | 'V3' | 'FINAL';
  docType: 'Văn bản đến' | 'Văn bản đi' | 'Nội bộ';
  relatedDocId?: string;
  createdAt: string;
  advisorySheet?: AdvisorySheet;
  auditTrail?: AuditLog[];
}

export interface AdvisoryTaskProposed {
  taskId: string;
  title: string;
  description: string;
  owner: string;
  collaborators: string[];
  approver: string;
  deadline: string;
  priority: 'Khẩn cấp' | 'Cao' | 'Trung bình' | 'Thấp';
  outputRequired: string;
  reportReceiver: string;
  evidence: string;
  confidence: number;
}

export type AdvisoryTask = AdvisoryTaskProposed;

export interface AdvisorySheet {
  id?: string;
  documentId: string;
  documentNumber: string;
  aiSummary: string;
  keyRequirements: string;
  executiveOpinion?: string;
  deadline: string;
  tasks: AdvisoryTaskProposed[];
  proposedOwner: string;
  outputProduct: string;
  draftEmail?: {
    subject: string;
    body: string;
  };
  draftEmailSubject?: string;
  draftEmailBody?: string;
  status: 'Dự thảo AI' | 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Đã giao việc';
  approverNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  version?: string;
  versions?: {
    version: string;
    author: string;
    timestamp: string;
    changesSummary: string;
    opinion?: string;
    tasksCount?: number;
  }[];
  diffHistory?: {
    timestamp: string;
    oldContent: string;
    newContent: string;
    feedback: string;
  }[];
}

export type TaskStatus =
  | 'MỚI'
  | 'CHỜ DUYỆT'
  | 'ĐÃ GIAO'
  | 'ĐANG LÀM'
  | 'CHỜ KIỂM TRA'
  | 'CẦN BỔ SUNG'
  | 'HOÀN THÀNH'
  | 'QUÁ HẠN';

export type TaskPriority = 'Khẩn cấp' | 'Cao' | 'Trung bình' | 'Thấp';

export interface TaskComment {
  id: string;
  author: string;
  role: string;
  avatar?: string;
  timestamp: string;
  content: string;
  attachment?: string;
}

export interface TaskItem {
  id: string;
  code: string;
  title: string;
  description: string;
  sourceDocId?: string;
  sourceDocNumber?: string;
  owner: string;
  ownerId?: string;
  department: string;
  collaborators: string[];
  approver: string;
  assignDate: string;
  deadline: string;
  outputRequired: string;
  evidenceFiles: string[];
  priority: TaskPriority;
  progress: number;
  status: TaskStatus;
  comments: TaskComment[];
  history: string[];
}

export interface EmailDraft {
  id: string;
  to: string;
  recipientName: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  status: 'Dự thảo AI' | 'Chờ duyệt' | 'Đã duyệt' | 'Đã gửi';
  createdAt: string;
  sentAt?: string;
  relatedTaskId?: string;
  relatedDocNumber?: string;
  attachments?: string[];
  reviewedBy?: string;
}

export interface AiCriterionCheck {
  criterion: string;
  status: 'Đã đáp ứng' | 'Đáp ứng một phần' | 'Chưa đáp ứng' | 'Thiếu minh chứng' | 'Chưa rõ';
  notes: string;
  evidenceProvided: string;
}

export interface AiReportCheck {
  evaluation: 'Đã đáp ứng' | 'Đáp ứng một phần' | 'Chưa đáp ứng';
  score: number;
  summary: string;
  details: AiCriterionCheck[];
}

export interface ReportItem {
  id: string;
  code: string;
  title: string;
  type: 'Hàng ngày' | 'Hàng tuần' | 'Hàng tháng' | 'Hàng quý' | 'Năm học' | 'Đột xuất';
  period: string;
  author: string;
  department: string;
  createdDate: string;
  status: 'Dự thảo' | 'Chờ duyệt' | 'Đã duyệt' | 'Đã nộp';
  content: string;
  taskIds: string[];
  checkerResult?: AiReportCheck;
  version: 'V1' | 'V2' | 'FINAL';
}

export interface WorkDossier {
  id: string;
  code: string;
  title: string;
  schoolYear: string;
  department: string;
  createdDate: string;
  status: 'Đang xử lý' | 'Hoàn thành' | 'Lưu trữ';
  documents: { id: string; number: string; title: string }[];
  tasks: { id: string; code: string; title: string; status: TaskStatus }[];
  emails: { id: string; subject: string; sentAt: string }[];
  submittedFiles: { name: string; uploadedBy: string; date: string; size: string }[];
  minutes: string[];
  reports: string[];
  outgoingDocs: string[];
  history: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type:
    | 'Văn bản mới'
    | 'Nhiệm vụ mới'
    | 'Sắp đến hạn'
    | 'Quá hạn'
    | 'Yêu cầu duyệt'
    | 'Bình luận'
    | 'Sản phẩm mới'
    | 'Báo cáo mới';
  createdAt: string;
  read: boolean;
  targetId?: string;
  targetType?: 'doc' | 'task' | 'report' | 'email';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user?: string;
  userName?: string;
  role?: string;
  userRole?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
  documentNumber?: string;
  beforeContent?: string;
  afterContent?: string;
  actorType: 'AI' | 'HUMAN';
  approvedBy?: string;
  ipAddress?: string;
  diffData?: any;
}

export type AuditLogItem = AuditLog;

export interface ThemeConfig {
  preset:
    | 'Ocean Blue'
    | 'Education Blue'
    | 'Emerald'
    | 'Purple'
    | 'Sunset'
    | 'Dark'
    | 'Light'
    | 'School Brand'
    | 'CUSTOM';
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  surfaceBg: string;
  cardBg: string;
  textColor: string;
  isDark: boolean;
}

export interface AiSettings {
  model: 'gemini-3.8-flash' | 'gemini-3.1-pro-preview';
  temperature: number;
  systemInstructions: string;
  automationLevel: 1 | 2 | 3 | 4;
  taskAssignmentRules: string;
  emailRules: string;
}
