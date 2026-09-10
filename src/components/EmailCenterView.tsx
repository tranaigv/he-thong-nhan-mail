import React, { useState } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  Edit3,
  RefreshCw,
  Search,
  User,
  AlertCircle,
  FileText,
  ShieldCheck,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { EmailDraft, UserProfile } from '../types';

interface EmailCenterViewProps {
  drafts?: EmailDraft[];
  users?: UserProfile[];
  currentUser: UserProfile;
  onSendEmail: (email: EmailDraft) => void;
  onUpdateDraft: (email: EmailDraft) => void;
}

export const EmailCenterView: React.FC<EmailCenterViewProps> = ({
  drafts = [],
  users = [],
  currentUser,
  onSendEmail,
  onUpdateDraft,
}) => {
  const safeDrafts = drafts || [];
  const safeUsers = users || [];
  const [activeTab, setActiveTab] = useState<'pending' | 'sent' | 'compose'>('pending');
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Compose state
  const [recipient, setRecipient] = useState('');
  const [purpose, setPurpose] = useState('');
  const [deadline, setDeadline] = useState('2026-09-25');
  const [docRef, setDocRef] = useState('');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Human-in-the-loop adjustment
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustPrompt, setAdjustPrompt] = useState('');
  const [diffView, setDiffView] = useState<{ before: string; after: string } | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const pendingDrafts = safeDrafts.filter((d) => d && d.status === 'Chờ duyệt');
  const sentEmails = safeDrafts.filter((d) => d && (d.status === 'Đã gửi' || d.status === 'Đã duyệt'));

  const handleGenerateAiEmail = async () => {
    if (!recipient.trim() || !purpose.trim()) {
      alert('Vui lòng chọn người nhận và nhập mục đích email.');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipient,
          purpose,
          taskOrDocInfo: docRef || 'Chỉ đạo Ban Giám hiệu THPT Ngô Quyền',
          deadline,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setGeneratedSubject(data.draft.subject);
      setGeneratedBody(data.draft.body);
    } catch (err: any) {
      alert('Không thể tạo email: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveOrSendComposed = (action: 'draft' | 'send') => {
    if (!generatedSubject.trim() || !generatedBody.trim()) {
      alert('Vui lòng tạo hoặc soạn nội dung email.');
      return;
    }

    const newDraft: EmailDraft = {
      id: `EML-${Date.now()}`,
      to: users.find((u) => u.name.includes(recipient))?.email || 'giaovien@thpt-ngoquyen.edu.vn',
      recipientName: recipient,
      subject: generatedSubject,
      body: generatedBody,
      status: action === 'send' ? 'Đã gửi' : 'Chờ duyệt',
      createdAt: new Date().toISOString(),
      sentAt: action === 'send' ? new Date().toISOString() : undefined,
      reviewedBy: action === 'send' ? currentUser.name : undefined,
    };

    if (action === 'send') {
      onSendEmail(newDraft);
      alert('Email đã được gửi thành công qua hệ thống Google Workspace THPT Ngô Quyền!');
      setActiveTab('sent');
    } else {
      onUpdateDraft(newDraft);
      alert('Đã lưu dự thảo email vào hàng chờ phê duyệt!');
      setActiveTab('pending');
    }

    setGeneratedSubject('');
    setGeneratedBody('');
    setPurpose('');
    setRecipient('');
  };

  // Human-in-the-loop review of a pending draft
  const handleApproveDraft = (draft: EmailDraft) => {
    const updated: EmailDraft = {
      ...draft,
      status: 'Đã gửi',
      sentAt: new Date().toISOString(),
      reviewedBy: `${currentUser.name} (${currentUser.roleTitle})`,
    };
    onSendEmail(updated);
    setSelectedDraft(null);
    alert(`Đã phê duyệt và phát hành email tới ${draft.recipientName}!`);
  };

  const handleAdjustDraft = async () => {
    if (!selectedDraft || !adjustPrompt.trim()) return;
    setIsAdjusting(true);
    try {
      // Prompt AI to rewrite email body based on leader's instruction
      const response = await fetch('/api/ai/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: selectedDraft.recipientName,
          purpose: `Yêu cầu chỉnh sửa của Lãnh đạo: "${adjustPrompt}". Nội dung gốc: ${selectedDraft.body}`,
          taskOrDocInfo: selectedDraft.relatedDocNumber || 'Văn bản chỉ đạo',
          deadline: 'Thời hạn ban đầu',
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      setDiffView({
        before: selectedDraft.body,
        after: data.draft.body,
      });

      const updated: EmailDraft = {
        ...selectedDraft,
        subject: data.draft.subject || selectedDraft.subject,
        body: data.draft.body,
      };
      setSelectedDraft(updated);
      onUpdateDraft(updated);
      setShowAdjust(false);
      setAdjustPrompt('');
    } catch (err: any) {
      alert('Không thể chỉnh sửa: ' + err.message);
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 font-serif">
            Trung tâm Thư tín & Email Công vụ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Soạn thảo thông báo tự động bằng AI • Phê duyệt Human-in-the-loop trước khi gửi
          </p>
        </div>

        {/* Gmail Google Workspace Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Google Workspace: thpt-ngoquyen.edu.vn</span>
          <ShieldCheck className="w-4 h-4 text-blue-600" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Chờ duyệt ({pendingDrafts.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'sent'
              ? 'border-blue-600 text-blue-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Đã gửi ({sentEmails.length})
        </button>
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'compose'
              ? 'border-blue-600 text-blue-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Soạn thư mới với AI
        </button>
      </div>

      {/* TAB 1: PENDING APPROVAL (SECTION XII MANDATE) */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingDrafts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="text-sm font-bold text-slate-800">Không có email nào đang chờ duyệt</div>
              <p className="text-xs text-slate-400">
                Mọi dự thảo do AI tạo khi duyệt Phiếu tham mưu hoặc nhắc việc đã được xử lý đầy đủ.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Chờ Ban Giám hiệu duyệt
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(draft.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      Gửi tới: <span className="text-slate-900 font-bold">{draft.recipientName}</span> ({draft.to})
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-1">{draft.subject}</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {draft.body}
                  </div>

                  {/* Section XII Human-in-the-loop action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedDraft(draft);
                        setShowAdjust(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Yêu cầu chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleApproveDraft(draft)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Đồng ý & Gửi ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SENT EMAILS */}
      {activeTab === 'sent' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {sentEmails.map((email) => (
            <div key={email.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Đã gửi thành công
                  </span>
                  <span className="text-xs font-bold text-slate-800">{email.subject}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>Người nhận: {email.recipientName} ({email.to})</span>
                  <span>•</span>
                  <span>Người duyệt: {email.reviewedBy || 'Hệ thống'}</span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono shrink-0">
                {email.sentAt ? new Date(email.sentAt).toLocaleString('vi-VN') : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: COMPOSE WITH AI */}
      {activeTab === 'compose' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Trợ lý AI Soạn thảo Email Điều hành
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Người nhận:</label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="">-- Chọn cán bộ giáo viên --</option>
                {users.map((u) => (
                  <option key={u.id} value={`${u.name} (${u.roleTitle})`}>
                    {u.name} - {u.roleTitle} ({u.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Căn cứ văn bản:</label>
              <input
                type="text"
                value={docRef}
                onChange={(e) => setDocRef(e.target.value)}
                placeholder="Ví dụ: Công văn số 186/SGDĐT-GDTrH"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hạn xử lý yêu cầu:</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mục đích & Nội dung chỉ đạo cần truyền đạt:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Ví dụ: Yêu cầu nộp báo cáo rà soát cơ sở vật chất phòng máy tính trước thứ Sáu để kịp năm học mới..."
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                onClick={handleGenerateAiEmail}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                Tạo Email AI
              </button>
            </div>
          </div>

          {/* Generated Result */}
          {(generatedSubject || generatedBody) && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Tiêu đề email (Subject):
                </label>
                <input
                  type="text"
                  value={generatedSubject}
                  onChange={(e) => setGeneratedSubject(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nội dung thư (Body):
                </label>
                <textarea
                  value={generatedBody}
                  onChange={(e) => setGeneratedBody(e.target.value)}
                  rows={8}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleSaveOrSendComposed('draft')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Lưu vào hàng chờ duyệt
                </button>
                <button
                  onClick={() => handleSaveOrSendComposed('send')}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Gửi ngay
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HUMAN-IN-THE-LOOP ADJUSTMENT MODAL */}
      {showAdjust && selectedDraft && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Yêu cầu AI chỉnh sửa dự thảo email
              </h3>
              <button onClick={() => setShowAdjust(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Đang chỉnh sửa email gửi: <span className="font-bold">{selectedDraft.recipientName}</span>
            </div>

            <textarea
              value={adjustPrompt}
              onChange={(e) => setAdjustPrompt(e.target.value)}
              placeholder="Nhập yêu cầu: Ví dụ 'Viết ngắn gọn hơn, nhấn mạnh hạn chót 17h00 ngày 25/09, bổ sung lời chào của Hiệu trưởng'..."
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:border-blue-500"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAdjust(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleAdjustDraft}
                disabled={isAdjusting || !adjustPrompt.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                {isAdjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                AI Cập nhật nội dung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION XII DIFF VIEW: NỘI DUNG CŨ -> NỘI DUNG MỚI */}
      {diffView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Kiểm tra so sánh: Nội dung cũ → Nội dung mới (Human-in-the-loop)
              </h3>
              <button onClick={() => setDiffView(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50/50 rounded-2xl border border-red-200">
                <div className="text-xs font-bold text-red-700 uppercase mb-2">Nội dung cũ:</div>
                <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {diffView.before}
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                <div className="text-xs font-bold text-emerald-700 uppercase mb-2">
                  Nội dung mới (Sau khi AI sửa):
                </div>
                <div className="text-xs text-slate-900 font-medium whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {diffView.after}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDiffView(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setDiffView(null);
                  if (selectedDraft) handleApproveDraft(selectedDraft);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Xác nhận & Gửi ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
