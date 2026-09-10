import React, { useState } from 'react';
import {
  mockDocuments,
  mockTasks,
  mockAdvisorySheets,
  mockReports,
  mockEmailDrafts,
  mockUsers,
  mockAuditLogs,
  mockWorkDossiers,
  mockNotifications,
  defaultAiSettings,
} from './mockData';
import {
  DocumentItem,
  TaskItem,
  AdvisorySheet,
  ReportItem,
  EmailDraft,
  UserProfile,
  AuditLogItem,
  AiSettings,
  WorkDossier,
  NotificationItem,
} from './types';

// Components
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { IncomingDocsView } from './components/IncomingDocsView';
import { OutgoingDocsView } from './components/OutgoingDocsView';
import { TaskManagementView } from './components/TaskManagementView';
import { WorkDossiersView } from './components/WorkDossiersView';
import { EmailCenterView } from './components/EmailCenterView';
import { ReportsView } from './components/ReportsView';
import { CalendarView } from './components/CalendarView';
import { OrgStructureView } from './components/OrgStructureView';
import { UserManagementView } from './components/UserManagementView';
import { AiSettingsView } from './components/AiSettingsView';
import { AuditLogView } from './components/AuditLogView';

// Modals
import { DocumentIntakeModal } from './components/DocumentIntakeModal';
import { AdvisorySheetModal } from './components/AdvisorySheetModal';
import { DocDetailsModal } from './components/DocDetailsModal';
import { SearchAiModal } from './components/SearchAiModal';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { VersionCompareModal } from './components/VersionCompareModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Core domain states
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers[0]); // TS. Đỗ Thị Lan (Hiệu trưởng)
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  const [advisorySheets, setAdvisorySheets] = useState<AdvisorySheet[]>(mockAdvisorySheets);
  const [reports, setReports] = useState<ReportItem[]>(mockReports);
  const [emails, setEmails] = useState<EmailDraft[]>(mockEmailDrafts);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(mockAuditLogs);
  const [dossiers, setDossiers] = useState<WorkDossier[]>(mockWorkDossiers);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [aiSettings, setAiSettings] = useState<AiSettings>(defaultAiSettings);
  const [primaryColor, setPrimaryColor] = useState('#1e3a8a');

  // Modals state
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [selectedDocForAdvisory, setSelectedDocForAdvisory] = useState<DocumentItem | null>(null);
  const [selectedDocForDetails, setSelectedDocForDetails] = useState<DocumentItem | null>(null);
  const [isSearchAiOpen, setIsSearchAiOpen] = useState(false);
  const [searchAiQuery, setSearchAiQuery] = useState('');
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const [isVersionCompareOpen, setIsVersionCompareOpen] = useState(false);
  const [selectedAdvisoryForCompare, setSelectedAdvisoryForCompare] = useState<AdvisorySheet | null>(null);

  // Helper for flexible tab routing
  const isTab = (target: string) => {
    const normActive = activeTab.toLowerCase().replace(/[_-]/g, '');
    const normTarget = target.toLowerCase().replace(/[_-]/g, '');
    return normActive === normTarget;
  };

  // Handlers
  const handleDocIntakeSuccess = (doc: DocumentItem, sheet: AdvisorySheet) => {
    setDocuments((prev) => [doc, ...prev]);
    setAdvisorySheets((prev) => [sheet, ...prev]);

    // Append to audit trail
    const intakeLog: AuditLogItem = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userRole: currentUser.roleTitle,
      actorType: 'HUMAN',
      action: 'Tiếp nhận & bóc tách số hóa công văn',
      details: `Đã số hóa công văn số ${doc.documentNumber}: "${doc.title}". Trợ lý AI đã lập Phiếu tham mưu V1.`,
      documentNumber: doc.documentNumber,
      ipAddress: '192.168.1.45',
    };
    setAuditLogs((prev) => [intakeLog, ...prev]);

    // Immediately open advisory sheet for Human-in-the-loop review
    setSelectedDocForAdvisory(doc);
  };

  const handleApproveAdvisorySheet = (
    sheet: AdvisorySheet,
    approvedTasks: TaskItem[],
    autoSendEmail: boolean,
  ) => {
    // 1. Update advisory sheet status
    setAdvisorySheets((prev) =>
      prev.map((s) =>
        s.id === sheet.id
          ? {
              ...s,
              status: 'Đã duyệt',
              executiveOpinion: sheet.executiveOpinion,
              approvedBy: currentUser.name,
              approvedAt: new Date().toISOString(),
            }
          : s,
      ),
    );

    // 2. Update parent document status
    setDocuments((prev) =>
      prev.map((d) => (d.id === sheet.documentId ? { ...d, status: 'Đã duyệt & giao việc' } : d)),
    );

    // 3. Add generated approved tasks to the Kanban board
    setTasks((prev) => [...approvedTasks, ...prev]);

    // 4. If autoSendEmail requested, add to emails list
    if (autoSendEmail) {
      approvedTasks.forEach((t) => {
        const newEmail: EmailDraft = {
          id: `EML-${Date.now()}-${t.id}`,
          to: 'giaovien@thpt-ngoquyen.edu.vn',
          recipientName: t.owner,
          subject: `[NQ OFFICE - CHỈ ĐẠO BGH] Giao nhiệm vụ: ${t.title}`,
          body: `Kính gửi: Đồng chí ${t.owner} (${t.department})\n\nCăn cứ vào chỉ đạo của Ban Giám hiệu Trường THPT Ngô Quyền tại Phiếu tham mưu văn bản số ${
            documents.find((d) => d.id === sheet.documentId)?.documentNumber || ''
          }, đồng chí được phân công thực hiện nhiệm vụ:\n\n- Tên nhiệm vụ: ${t.title}\n- Thời hạn hoàn thành: ${
            t.deadline
          }\n- Sản phẩm yêu cầu: ${t.outputRequired}\n- Ý kiến chỉ đạo của BGH: "${sheet.executiveOpinion}"\n\nĐề nghị đồng chí chủ động phối hợp triển khai và nộp sản phẩm minh chứng đúng hạn trên phần mềm NQ Office AI.\n\nTrân trọng,\nBan Giám hiệu Trường THPT Ngô Quyền`,
          status: 'Đã gửi',
          relatedDocNumber: documents.find((d) => d.id === sheet.documentId)?.documentNumber,
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString(),
          reviewedBy: currentUser.name,
        };
        setEmails((prev) => [newEmail, ...prev]);
      });
    }

    // 5. Append approval to Audit Trail
    const approvalLog: AuditLogItem = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userRole: currentUser.roleTitle,
      actorType: 'HUMAN',
      action: 'Phê duyệt Phiếu tham mưu & Giao nhiệm vụ (Human-in-the-loop)',
      details: `${currentUser.roleTitle} ${currentUser.name} đã phê duyệt ${approvedTasks.length} nhiệm vụ và ban hành ý kiến chỉ đạo.`,
      documentNumber: documents.find((d) => d.id === sheet.documentId)?.documentNumber,
      ipAddress: '192.168.1.45',
    };
    setAuditLogs((prev) => [approvalLog, ...prev]);

    setSelectedDocForAdvisory(null);
    alert(
      `Đã phê duyệt thành công! ${approvedTasks.length} nhiệm vụ đã được kích hoạt trên bảng Kanban và thông báo tới các tổ bộ phận.`,
    );
  };

  const handleCreateTask = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
    const log: AuditLogItem = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userRole: currentUser.roleTitle,
      actorType: 'HUMAN',
      action: 'Khởi tạo nhiệm vụ mới',
      details: `Đã tạo nhiệm vụ ${newTask.code}: "${newTask.title}" giao cho ${newTask.owner}.`,
      ipAddress: '192.168.1.45',
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const handleUpdateTask = (updatedTask: TaskItem) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleSendEmail = (newEmail: EmailDraft) => {
    setEmails((prev) => [newEmail, ...prev]);
    const log: AuditLogItem = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userRole: currentUser.roleTitle,
      actorType: 'HUMAN',
      action: 'Phát hành Email điều hành',
      details: `Đã gửi thư tới ${newEmail.recipientName}: "${newEmail.subject}".`,
      ipAddress: '192.168.1.45',
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const handleCreateReport = (newReport: ReportItem) => {
    setReports((prev) => [newReport, ...prev]);
  };

  const handleCreateOutgoingDoc = (newDoc: DocumentItem) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleOpenAdvisoryForDoc = (doc: DocumentItem) => {
    setSelectedDocForAdvisory(doc);
  };

  const handleOpenDetailsForDoc = (doc: DocumentItem) => {
    setSelectedDocForDetails(doc);
  };

  // Find sheet for currently selected advisory doc
  const currentAdvisorySheet = selectedDocForAdvisory
    ? advisorySheets.find((s) => s.documentId === selectedDocForAdvisory.id) ||
      selectedDocForAdvisory.advisorySheet || {
        id: `ADV-${selectedDocForAdvisory.id}`,
        documentId: selectedDocForAdvisory.id,
        documentNumber: selectedDocForAdvisory.documentNumber,
        aiSummary: selectedDocForAdvisory.summary || '',
        keyRequirements: selectedDocForAdvisory.reportingRequirements || '',
        executiveOpinion: `Kính chuyển Ban Giám hiệu và các Tổ bộ phận nghiên cứu thực hiện nghiêm túc theo chỉ đạo tại văn bản số ${selectedDocForAdvisory.documentNumber}.`,
        tasks: [
          {
            taskId: 'NV-01',
            title: `Triển khai các nội dung theo công văn ${selectedDocForAdvisory.documentNumber}`,
            description: selectedDocForAdvisory.summary || '',
            owner: 'Nguyễn Văn Tuấn',
            collaborators: ['Phạm Thu Hà (Văn thư)'],
            approver: 'Hiệu trưởng Đỗ Thị Lan',
            deadline: selectedDocForAdvisory.deadline || '2026-09-30',
            priority: 'Cao',
            outputRequired: 'Báo cáo kế hoạch chi tiết',
            reportReceiver: 'Ban Giám hiệu',
            evidence: 'File minh chứng nộp trên phần mềm',
            confidence: 0.95,
          },
        ],
        proposedOwner: 'Nguyễn Văn Tuấn',
        outputProduct: 'Báo cáo kế hoạch chi tiết',
        draftEmailSubject: `[NQ OFFICE] Triển khai công văn số ${selectedDocForAdvisory.documentNumber}`,
        draftEmailBody: `Kính gửi các đồng chí phụ trách,\nĐề nghị nghiên cứu và thực hiện công văn ${selectedDocForAdvisory.documentNumber} trước ngày ${selectedDocForAdvisory.deadline}.`,
        status: 'Chờ duyệt',
        createdAt: new Date().toISOString(),
        version: 'V1',
      }
    : null;

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-100 text-slate-900 transition-colors duration-200 selection:bg-blue-600 selection:text-white"
      style={{ '--primary-color': primaryColor } as React.CSSProperties}
    >
      {/* TopBar with School branding, search, notifications & role switch */}
      <TopBar
        currentUser={currentUser}
        users={users}
        onSwitchUser={setCurrentUser}
        notifications={notifications}
        onMarkNotificationRead={(id) =>
          setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
        }
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenIntake={() => setIsIntakeOpen(true)}
        onOpenSearchAi={(query) => {
          setSearchAiQuery(query || '');
          setIsSearchAiOpen(true);
        }}
        onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
        unreadCount={notifications.filter((n) => !n.read).length}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={currentUser.role}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          newDocsCount={documents.filter((d) => d && d.issueDate >= '2026-09-01').length}
          pendingTasksCount={tasks.filter((t) => t && (t.status === 'CHỜ DUYỆT' || t.status === 'ĐANG LÀM')).length}
          pendingApprovalsCount={documents.filter((d) => d && d.status === 'Chờ BGH duyệt').length}
          unreadInboxCount={documents.filter((d) => d && (d.status === 'Mới tiếp nhận' || d.status === 'Đã xử lý AI')).length}
          myTasksCount={tasks.filter((t) => t && t.owner && t.owner.includes(currentUser.name)).length}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-65px)]">
          {isTab('dashboard') && (
            <DashboardView
              documents={documents}
              tasks={tasks}
              reports={reports}
              users={users}
              currentUser={currentUser}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenIntake={() => setIsIntakeOpen(true)}
              onOpenTaskCreate={() => {
                setActiveTab('tasks');
              }}
              onOpenSearchAi={(query) => {
                setSearchAiQuery(query || '');
                setIsSearchAiOpen(true);
              }}
              onOpenAdvisory={handleOpenAdvisoryForDoc}
            />
          )}

          {(isTab('incoming-docs') || isTab('ai-inbox') || isTab('incomingdocs') || isTab('aiinbox')) && (
            <IncomingDocsView
              documents={documents}
              currentUser={currentUser}
              onOpenIntake={() => setIsIntakeOpen(true)}
              onOpenAdvisory={handleOpenAdvisoryForDoc}
              onSelectDoc={handleOpenDetailsForDoc}
            />
          )}

          {(isTab('outgoing-docs') || isTab('outgoingdocs')) && (
            <OutgoingDocsView
              documents={documents}
              currentUser={currentUser}
              onCreateOutgoingDoc={handleCreateOutgoingDoc}
            />
          )}

          {(isTab('tasks') || isTab('my-tasks') || isTab('approvals') || isTab('tasks-kanban') || isTab('taskskanban')) && (
            <TaskManagementView
              tasks={tasks}
              users={users}
              currentUser={currentUser}
              onUpdateTask={handleUpdateTask}
              onAddTask={handleCreateTask}
              onCreateTask={handleCreateTask}
              onOpenReportChecker={() => setActiveTab('reports')}
              isMyTasksOnly={isTab('my-tasks') || isTab('mytasks')}
              initialFilter={isTab('approvals') ? 'CHỜ DUYỆT' : undefined}
            />
          )}

          {(isTab('dossiers') || isTab('legal-docs') || isTab('templates') || isTab('work-dossiers') || isTab('workdossiers') || isTab('legaldocs')) && (
            <WorkDossiersView dossiers={dossiers} currentUser={currentUser} />
          )}

          {(isTab('email-center') || isTab('emailcenter')) && (
            <EmailCenterView
              drafts={emails}
              users={users}
              currentUser={currentUser}
              onSendEmail={handleSendEmail}
              onUpdateDraft={(updated) =>
                setEmails((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
              }
            />
          )}

          {(isTab('reports') || isTab('statistics')) && (
            <ReportsView
              reports={reports}
              documents={documents}
              tasks={tasks}
              currentUser={currentUser}
              onCreateReport={handleCreateReport}
            />
          )}

          {isTab('calendar') && <CalendarView currentUser={currentUser} tasks={tasks} />}

          {(isTab('organization') || isTab('org-structure') || isTab('orgstructure')) && (
            <OrgStructureView users={users} />
          )}

          {isTab('users') && (
            <UserManagementView
              users={users}
              currentUser={currentUser}
              onUpdateUser={(updated) =>
                setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
              }
              onAddUser={(newUser) => setUsers((prev) => [newUser, ...prev])}
              onSwitchUser={setCurrentUser}
            />
          )}

          {(isTab('ai-settings') || isTab('settings') || isTab('aisettings')) && (
            <AiSettingsView
              settings={aiSettings}
              currentUser={currentUser}
              onSaveSettings={setAiSettings}
            />
          )}

          {(isTab('audit-log') || isTab('auditlog')) && (
            <AuditLogView
              logs={auditLogs}
              onOpenDiff={(log) => {
                if (advisorySheets[0]) {
                  setSelectedAdvisoryForCompare(advisorySheets[0]);
                  setIsVersionCompareOpen(true);
                }
              }}
            />
          )}
        </main>
      </div>

      {/* GLOBAL MODALS */}

      {/* 1. Document Intake Modal */}
      <DocumentIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onSuccess={handleDocIntakeSuccess}
        onExtractionComplete={(doc) => {
          if (doc.advisorySheet) {
            handleDocIntakeSuccess(doc, doc.advisorySheet);
          }
        }}
        currentUser={currentUser}
      />

      {/* 2. Advisory Sheet Modal (Human-in-the-loop AI extraction & approval) */}
      {selectedDocForAdvisory && (
        <AdvisorySheetModal
          isOpen={!!selectedDocForAdvisory}
          onClose={() => setSelectedDocForAdvisory(null)}
          document={selectedDocForAdvisory}
          advisorySheet={currentAdvisorySheet}
          users={users}
          currentUser={currentUser}
          onApprove={handleApproveAdvisorySheet}
          onOpenVersionCompare={() => {
            setSelectedAdvisoryForCompare(currentAdvisorySheet);
            setIsVersionCompareOpen(true);
          }}
        />
      )}

      {/* 3. Document Details Full-Screen Modal */}
      <DocDetailsModal
        isOpen={!!selectedDocForDetails}
        onClose={() => setSelectedDocForDetails(null)}
        document={selectedDocForDetails}
        onOpenAdvisory={handleOpenAdvisoryForDoc}
      />

      {/* 4. Natural Language Smart Search & AI Q&A Modal */}
      <SearchAiModal
        isOpen={isSearchAiOpen}
        onClose={() => setIsSearchAiOpen(false)}
        initialQuery={searchAiQuery}
        documents={documents}
        tasks={tasks}
        reports={reports}
        onSelectDoc={(doc) => {
          setSelectedDocForDetails(doc);
          setActiveTab('INCOMING_DOCS');
        }}
        onSelectTask={(task) => {
          setActiveTab('TASKS_KANBAN');
        }}
      />

      {/* 5. Theme Customizer Modal (3D Soft UI & Color Palettes) */}
      <ThemeCustomizerModal
        isOpen={isThemeCustomizerOpen}
        onClose={() => setIsThemeCustomizerOpen(false)}
        currentPrimaryColor={primaryColor}
        onColorChange={setPrimaryColor}
      />

      {/* 6. Human-in-the-loop Version Compare (Diff V1 -> V2) */}
      <VersionCompareModal
        isOpen={isVersionCompareOpen}
        onClose={() => setIsVersionCompareOpen(false)}
        advisorySheet={selectedAdvisoryForCompare}
      />
    </div>
  );
}
