import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Clock,
  Send,
  LogOut,
  Moon,
  Sun,
  Layers,
  Eye,
  ChevronRight,
  Menu,
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  Loader2,
  Paperclip,
  FileText,
  GraduationCap,
  FileImage,
  Presentation,
  ClipboardCheck,
  ChevronDown,
  Wrench,
  Package,
  Sparkles,
  BookOpen,
  Calendar,
  CreditCard,
  Award,
  LayoutDashboard,
  Shuffle,
  BarChart3,
  Users,
  CalendarRange,
  MessageSquare,
  Megaphone
} from 'lucide-react';
import type { User, UserRole, AuthThemeMode } from '../../types/auth';
import { RichAiMessage } from './RichAiMessage';
import { SchoolLocatorView } from './SchoolLocatorView';
import { FeatureStubsView } from './FeatureStubsView';
import { ClassmasterDeskView } from './ClassmasterDeskView';
import { MaintenanceDeskView } from './MaintenanceDeskView';
import { MyClassesView } from './MyClassesView';
import { ZavkhozWorkspaceView } from './ZavkhozWorkspaceView';
import { StudentWorkspaceView } from './StudentWorkspaceView';
import { ZavuchWorkspaceView } from './ZavuchWorkspaceView';
import { SchoolNewsFeedView } from './SchoolNewsFeedView';
import { TeacherDayWidget } from './TeacherDayWidget';
import { MacDockTools } from './MacDockTools';
import { AssessmentConstructorView } from './AssessmentConstructorView';
import { exportOfficialDocumentPdf } from '../../utils/pdfExport';
import { useToast } from '../common/ToastContext';
import {
  AcademicQuillIcon,
  SchoolGridLocatorIcon,
  AssessmentBuilderIcon,
  ClassmasterRegistryIcon,
  MaintenanceServiceIcon
} from '../common/CustomIcons';

export type CabinetTab =
  | 'schedule_changes'
  | 'assistant'
  | 'news'
  | 'locator'
  | 'classmaster'
  | 'aicards'
  | 'tickets'
  | 'fipi'
  | 'gdzclone'
  | 'boardscan'
  | 'presentation'
  | 'attendance'
  | 'myclasses'
  | 'overview'
  | 'grades'
  | 'schedule'
  | 'homework'
  | 'messages'
  | 'services'
  | 'portfolio'
  | 'warehouse'
  | 'docs'
  | 'summary'
  | 'replacements'
  | 'monitoring'
  | 'workload'
  | 'orders';

export interface CabinetViewProps {
  user: User | null;
  theme: AuthThemeMode;
  setTheme: (t: AuthThemeMode) => void;
  logout: () => void;
  switchRole: (roleId: string) => void;
  apiStatus: any;
  onOpenAuthModal: () => void;
}

const THINKING_PHASES = [
  'Анализ педагогического запроса...',
  'Сверка с нормативами ФГОС...',
  'Формирование структурированного ответа...',
  'Оформление документа и критериев...'
] as const;

export const CabinetView: React.FC<CabinetViewProps> = ({
  user,
  theme,
  setTheme,
  logout,
  switchRole,
  onOpenAuthModal
}) => {
  const [activeTab, setActiveTab] = useState<CabinetTab>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hashTab = window.location.hash.replace('#tab=', '').replace('#', '');
      const tabParam = params.get('tab') || hashTab;
      const validTabs: CabinetTab[] = [
        'assistant', 'news', 'locator', 'classmaster', 'aicards', 'tickets',
        'fipi', 'gdzclone', 'boardscan', 'presentation', 'attendance', 'myclasses',
        'warehouse', 'docs',
        'schedule_changes', 'summary', 'replacements', 'monitoring', 'workload', 'orders',
        'overview', 'grades', 'schedule', 'homework', 'messages', 'services', 'portfolio'
      ];
      if (tabParam && validTabs.includes(tabParam as CabinetTab)) {
        return tabParam as CabinetTab;
      }
    } catch {}
    if (user?.role === 'staff') return 'tickets';
    if (user?.role === 'student') return 'overview';
    if (user?.role === 'zavuch') return 'schedule_changes';
    return 'assistant';
  });

  const isStaff = user?.role === 'staff';
  const isStudent = user?.role === 'student';
  const isZavuch = user?.role === 'zavuch';

  // Синхронизация активной вкладки при смене роли
  useEffect(() => {
    if (isStaff) {
      if (!['tickets', 'locator', 'warehouse', 'docs'].includes(activeTab)) {
        setActiveTab('tickets');
      }
    } else if (isStudent) {
      if (!['overview', 'news', 'grades', 'schedule', 'homework', 'messages', 'services', 'portfolio'].includes(activeTab)) {
        setActiveTab('overview');
      }
    } else if (isZavuch) {
      if (!['schedule_changes', 'news', 'summary', 'replacements', 'monitoring', 'workload', 'orders'].includes(activeTab)) {
        setActiveTab('schedule_changes');
      }
    }
  }, [user?.role]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeClass, setActiveClass] = useState('9А');
  const [teacherClasses, setTeacherClasses] = useState<Array<{ id: string; label: string; role: string }>>(() => {
    try {
      const saved = localStorage.getItem('sferum_teacher_classes_list_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '9А', label: '9А • Классное руководство', role: 'Классное руководство' },
      { id: '10Б', label: '10Б • Информатика и ИКТ', role: 'Информатика и ИКТ' },
      { id: '11А', label: '11А • Профиль IT', role: 'Профиль IT' }
    ];
  });
  const { showToast } = useToast();
  const [isClassPickerOpen, setIsClassPickerOpen] = useState(false);

  const handleAddClassToTeacher = (clsId: string) => {
    setTeacherClasses((prev) => {
      if (prev.some((c) => c.id === clsId)) return prev;
      const role = clsId === '9А' ? 'Классное руководство' : clsId.startsWith('11') ? 'Профиль IT' : 'Информатика и ИКТ';
      const updated = [...prev, { id: clsId, label: `${clsId} • ${role}`, role }];
      try { localStorage.setItem('sferum_teacher_classes_list_v2', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setActiveClass(clsId);
    setActiveTab('myclasses');
    setIsClassPickerOpen(false);
  };

  // Методический модуль стейт (рабочее пространство + генерация PDF)
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'user' | 'ai';
    text: string;
    time: string;
    hasPdf?: boolean;
    pdfTitle?: string;
    model?: string;
    attachments?: Array<{
      name: string;
      size: number;
      type: string;
      previewUrl?: string;
      isImage: boolean;
    }>;
  }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [actionType, setActionType] = useState<'chat' | 'task'>('chat');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [downloadingPdfIndex, setDownloadingPdfIndex] = useState<number | null>(null);

  // Вложения файлов и фото
  const [attachedFiles, setAttachedFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    previewUrl?: string;
    base64Data?: string;
    isImage: boolean;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Состояния версии для слабовидящих (ГОСТ Р 52872)
  const [a11yFontSize, setA11yFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [a11yColorMode, setA11yColorMode] = useState<'black-on-white' | 'white-on-black' | 'blue-on-cyan'>('black-on-white');
  const [a11yImages, setA11yImages] = useState(true);

  useEffect(() => {
    if (theme === 'contrast') {
      document.documentElement.setAttribute('data-a11y-font', a11yFontSize);
      document.documentElement.setAttribute('data-a11y-images', a11yImages ? 'visible' : 'hidden');
    } else {
      document.documentElement.removeAttribute('data-a11y-font');
      document.documentElement.removeAttribute('data-a11y-images');
    }
  }, [theme, a11yFontSize, a11yImages]);

  // Анимация фаз генерации
  const [thinkingPhaseIndex, setThinkingPhaseIndex] = useState(0);

  useEffect(() => {
    if (!isAiLoading) return;
    const interval = setInterval(() => {
      setThinkingPhaseIndex((prev) => (prev + 1) % THINKING_PHASES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isAiLoading]);

  // Переключение вкладок по умолчанию в зависимости от роли
  useEffect(() => {
    if (user?.role === 'student' && (activeTab === 'assistant' || activeTab === 'tickets' || activeTab === 'summary' || activeTab === 'schedule_changes')) {
      setActiveTab('overview');
    } else if (user?.role === 'staff' && (activeTab === 'assistant' || activeTab === 'overview' || activeTab === 'summary' || activeTab === 'schedule_changes')) {
      setActiveTab('tickets');
    } else if (user?.role === 'zavuch' && (activeTab === 'assistant' || activeTab === 'overview' || activeTab === 'tickets' || activeTab === 'summary')) {
      setActiveTab('schedule_changes');
    }
  }, [user?.role]);

  // Автоматическая прокрутка чата вниз при появлении новых сообщений и генерации
  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => {
    if (hasStartedChat) {
      scrollToBottom(true);
      const t1 = setTimeout(() => scrollToBottom(true), 60);
      const t2 = setTimeout(() => scrollToBottom(true), 250);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [chatMessages, isAiLoading, hasStartedChat]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAttachedFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: isImage ? result : undefined,
            base64Data: result,
            isImage
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };
  
  const DEFAULT_OPENROUTER_KEY = '';
  const DEFAULT_GROQ_KEY = '';
  const DEFAULT_GEMINI_KEY = '';

  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>(() => localStorage.getItem('sferum_openrouter_key') || DEFAULT_OPENROUTER_KEY);
  const [groqApiKey, setGroqApiKey] = useState<string>(() => localStorage.getItem('sferum_groq_key') || DEFAULT_GROQ_KEY);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('sferum_gemini_key') || DEFAULT_GEMINI_KEY);
  const [tempApiKey, setTempApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showDayWidgetPopover, setShowDayWidgetPopover] = useState(false);

  const role: UserRole = user?.role || 'class_teacher';
  const firstName = user?.fullName?.split(' ')[1] || 'Коллега';

  // Цветовые токены
  const isContrast = theme === 'contrast';
  const isLight = theme === 'light' || (isContrast && a11yColorMode !== 'white-on-black');

  const t = {
    light: {
      appBg: '#f8fafc',
      sidebarBg: '#ffffff',
      sidebarBorder: '1px solid rgba(0, 0, 0, 0.08)',
      cardBg: '#ffffff',
      cardBorder: '1px solid rgba(0, 0, 0, 0.07)',
      cardShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      inputBg: '#ffffff',
      inputBorder: '#e2e8f0',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      hoverPill: '#f1f5f9',
      activePillBg: '#e2e8f0',
      activePillText: '#0f172a',
      promptBarBg: '#ffffff',
      promptBarBorder: '1px solid #e2e8f0',
      promptBarShadow: '0 12px 32px rgba(0, 0, 0, 0.05)',
      accentColor: '#0077FF'
    },
    oled: {
      appBg: '#090b0e',
      sidebarBg: '#0f1318',
      sidebarBorder: '1px solid rgba(255, 255, 255, 0.08)',
      cardBg: '#131820',
      cardBorder: '1px solid rgba(255, 255, 255, 0.08)',
      cardShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
      inputBg: '#161c26',
      inputBorder: '#273142',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      hoverPill: '#1a222f',
      activePillBg: '#212b3b',
      activePillText: '#ffffff',
      promptBarBg: '#131820',
      promptBarBorder: '1px solid rgba(255, 255, 255, 0.12)',
      promptBarShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 119, 255, 0.06)',
      accentColor: '#0077FF'
    },
    slate: {
      appBg: '#0d1117',
      sidebarBg: '#161b22',
      sidebarBorder: '1px solid rgba(255, 255, 255, 0.08)',
      cardBg: '#1c2128',
      cardBorder: '1px solid rgba(255, 255, 255, 0.08)',
      cardShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      inputBg: '#21262d',
      inputBorder: '#30363d',
      textPrimary: '#e6edf3',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',
      hoverPill: '#21262d',
      activePillBg: '#30363d',
      activePillText: '#ffffff',
      promptBarBg: '#1c2128',
      promptBarBorder: '1px solid #30363d',
      promptBarShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
      accentColor: '#2f81f7'
    },
    contrast: {
      appBg: a11yColorMode === 'white-on-black' ? '#090b0e' : a11yColorMode === 'blue-on-cyan' ? '#e0f2fe' : '#ffffff',
      sidebarBg: a11yColorMode === 'white-on-black' ? '#0f1318' : a11yColorMode === 'blue-on-cyan' ? '#f0f9ff' : '#ffffff',
      sidebarBorder: a11yColorMode === 'white-on-black' ? '1.5px solid #334155' : a11yColorMode === 'blue-on-cyan' ? '1.5px solid #7dd3fc' : '1.5px solid #cbd5e1',
      cardBg: a11yColorMode === 'white-on-black' ? '#131820' : '#ffffff',
      cardBorder: a11yColorMode === 'white-on-black' ? '1.5px solid #334155' : a11yColorMode === 'blue-on-cyan' ? '1.5px solid #7dd3fc' : '1.5px solid #94a3b8',
      cardShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      inputBg: a11yColorMode === 'white-on-black' ? '#1a222f' : '#ffffff',
      inputBorder: a11yColorMode === 'white-on-black' ? '#475569' : '#94a3b8',
      textPrimary: a11yColorMode === 'white-on-black' ? '#ffffff' : a11yColorMode === 'blue-on-cyan' ? '#082f49' : '#0a0f1d',
      textSecondary: a11yColorMode === 'white-on-black' ? '#cbd5e1' : a11yColorMode === 'blue-on-cyan' ? '#0369a1' : '#1e293b',
      textMuted: a11yColorMode === 'white-on-black' ? '#94a3b8' : a11yColorMode === 'blue-on-cyan' ? '#0284c7' : '#334155',
      hoverPill: a11yColorMode === 'white-on-black' ? '#1e2633' : '#f1f5f9',
      activePillBg: a11yColorMode === 'white-on-black' ? '#38bdf8' : '#0f172a',
      activePillText: a11yColorMode === 'white-on-black' ? '#0f172a' : '#ffffff',
      promptBarBg: a11yColorMode === 'white-on-black' ? '#131820' : '#ffffff',
      promptBarBorder: a11yColorMode === 'white-on-black' ? '2px solid #38bdf8' : '1.5px solid #94a3b8',
      promptBarShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
      accentColor: a11yColorMode === 'white-on-black' ? '#38bdf8' : '#0055d4'
    }
  }[theme];

  const handleSendChat = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if ((!textToSend.trim() && attachedFiles.length === 0) || isAiLoading) return;

    setHasStartedChat(true);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentAttachments = [...attachedFiles];

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: textToSend,
        time: timeStr,
        attachments: currentAttachments.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          previewUrl: f.previewUrl,
          isImage: f.isImage
        }))
      }
    ]);
    setChatInput('');
    setAttachedFiles([]);
    setIsAiLoading(true);
    setThinkingPhaseIndex(0);

    let fullPromptText = textToSend;
    if (currentAttachments.length > 0) {
      const fileNames = currentAttachments.map((f) => f.name).join(', ');
      fullPromptText += `\n[Прикреплено файлов: ${fileNames}]`;
    }

    // 1. Попытка запроса через наш бэкенд шлюз
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullPromptText,
          apiKey: openRouterApiKey || DEFAULT_OPENROUTER_KEY,
          contextRole: user?.roleTitle || 'Классный руководитель 9А',
          classGrade: activeClass,
          subject: 'Математика и Информатика'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hasPdf: data.hasPdfDownload,
            pdfTitle: data.pdfTitle || 'Документ Сферум'
          }
        ]);
        setIsAiLoading(false);
        return;
      }
    } catch {
      // Бэкенд недоступен или клиент на автономном хостинге Cloudflare Pages
    }

    const naturalSystemPrompt = `Вы — высококвалифицированный методист, эксперт ФГОС и академический помощник учителя платформы «Сферум.Кабинет» (МАОУ ЛИТ г. Новосибирска). Ваш собеседник: учитель / классный руководитель (${user?.roleTitle || 'Классный руководитель'}).

СТРОЖАЙШИЕ ПРАВИЛА ОБЩЕНИЯ И ФОРМАТИРОВАНИЯ:
1. ОБРАЩЕНИЕ СТРОГО НА «ВЫ»: обращайтесь к учителю исключительно с глубоким профессиональным уважением на «Вы», «Вас», «Ваш». Категорически запрещено обращаться на «ты»!
2. БЕЗ ПРИВЕТСТВИЙ И ПУСТЫХ ВСТУПЛЕНИЙ: никогда не пишите «Привет!», «Здравствуйте!», «Рад помочь!», «Приветствую!» и подобные фразы. СРАЗУ переходите к сути запроса и пишите строго по делу.
3. СРАЗУ ПО ДЕЛУ: первый же абзац должен содержать готовый методический материал, решение, критерии оценивания, статус или запрошенные факты без ритуальных предисловий.
4. Если учитель спрашивает «кто вы» или про возможности системы — без приветствий ёмко и солидно представьтесь: «Цифровой методист образовательной платформы «Сферум.Кабинет»...» и сразу опишите рабочий функционал.
5. Таблицы используйте ТОЛЬКО тогда, когда учитель прямо просит составить таблицу, критерии оценивания, расписание, технологическую карту урока или табель.
6. При составлении конспектов, тестов и планов уроков оформляйте логичную структуру с элегантными заголовками (### Название этапа).
7. Все математические, физические формулы и переменные обязательно оборачивайте в LaTeX ($x$, \\sqrt{a^2+b^2}, \\frac{1}{2}).
8. Выделяйте ключевые мысли полужирным шрифтом (**важное**), а списки оформляйте маркированными дефисами (- пункт).`;

    // 2. Прямой вызов OpenRouter (Nvidia Nemotron 3.5 Super VL - с поддержкой картинок!)
    const effectiveOpenRouterKey = openRouterApiKey || DEFAULT_OPENROUTER_KEY;
    if (effectiveOpenRouterKey) {
      try {
        let userMessageContent: any = fullPromptText;
        const imageFiles = currentAttachments.filter((f) => f.isImage && f.base64Data);
        if (imageFiles.length > 0) {
          userMessageContent = [
            { type: 'text', text: fullPromptText },
            ...imageFiles.map((img) => ({
              type: 'image_url',
              image_url: { url: img.base64Data }
            }))
          ];
        }

        const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveOpenRouterKey}`,
            'HTTP-Referer': 'https://sferum-cabinet.pages.dev',
            'X-Title': 'Sferum Cabinet'
          },
          body: JSON.stringify({
            model: 'nvidia/nemotron-3.5-super-vl:free',
            messages: [
              {
                role: 'system',
                content: naturalSystemPrompt
              },
              { role: 'user', content: userMessageContent }
            ],
            reasoning: { enabled: true }
          })
        });

        if (orRes.ok) {
          const orData = await orRes.json();
          const rawText = orData.choices?.[0]?.message?.content;
          if (rawText) {
            const text = rawText.replace(/돕лю/g, 'помогаю').replace(/돕/g, 'помогу');
            let pdfTitle = 'Методический документ';
            if (text.includes('### ')) {
              const firstHeader = text.split('### ')[1]?.split('\n')?.[0]?.trim();
              if (firstHeader) pdfTitle = firstHeader;
            }

            setChatMessages((prev) => [
              ...prev,
              {
                sender: 'ai',
                text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                hasPdf: true,
                pdfTitle
              }
            ]);
            setIsAiLoading(false);
            return;
          }
        }
      } catch {
        // Fallback к Groq
      }
    }

    // 3. Отказоустойчивый вызов Groq LPU
    const effectiveGroqKey = groqApiKey || DEFAULT_GROQ_KEY;
    if (effectiveGroqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveGroqKey}`
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              {
                role: 'system',
                content: naturalSystemPrompt
              },
              { role: 'user', content: fullPromptText }
            ],
            temperature: 0.6,
            max_completion_tokens: 2048
          })
        });

        if (groqRes.ok) {
          const gData = await groqRes.json();
          const rawText = gData.choices?.[0]?.message?.content;
          if (rawText) {
            const text = rawText.replace(/돕лю/g, 'помогаю').replace(/돕/g, 'помогу');
            let pdfTitle = 'Методический документ';
            if (text.includes('### ')) {
              const firstHeader = text.split('### ')[1]?.split('\n')?.[0]?.trim();
              if (firstHeader) pdfTitle = firstHeader;
            }

            setChatMessages((prev) => [
              ...prev,
              {
                sender: 'ai',
                text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                hasPdf: true,
                pdfTitle
              }
            ]);
            setIsAiLoading(false);
            return;
          }
        }
      } catch {
        // Резервный шлюз
      }
    }

    // 4. Запасной прямой вызов шлюза
    const effectiveGeminiKey = geminiApiKey || DEFAULT_GEMINI_KEY;
    if (effectiveGeminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${effectiveGeminiKey}`;
        const gRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': effectiveGeminiKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${naturalSystemPrompt}\n\nВопрос учителя:\n${fullPromptText}` }] }]
          })
        });
        if (gRes.ok) {
          const gData = await gRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            setChatMessages((prev) => [
              ...prev,
              {
                sender: 'ai',
                text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                hasPdf: true,
                pdfTitle: textToSend.slice(0, 30) || 'Документ'
              }
            ]);
            setIsAiLoading(false);
            return;
          }
        }
      } catch {
        // Fallback below
      }
    }

    // 5. Интеллектуальный встроенный эталонный генератор
    setTimeout(() => {
      let reply = '';
      const lower = textToSend.toLowerCase().trim();
      if (lower.includes('кто ты') || lower.includes('какая ты') || lower.includes('что ты умеешь') || lower === 'привет' || lower.startsWith('привет')) {
        reply = `Цифровой школьный ассистент образовательной среды **«Сферум.Кабинет»** для учителей и классных руководителей.\n\n**Ключевой функционал в работе:**\n- **Подготовка к урокам:** разработка технологических карт по ФГОС, конспектов и проверочных карточек А4 в нескольких вариантах с эталонами ответов.\n- **Оценивание:** формирование шкал и критериев проверки контрольных работ.\n- **Организационная работа:** составление официальных объявлений для родительских чатов в Сферуме.\n- **Экспорт в 1 клик:** мгновенная генерация официального PDF-документа для печати со школьным штампом.\n\nЗадайте тему занятия или введите педагогическую задачу для немедленного формирования материалов.`;
      } else if (lower.includes('таблиц') || lower.includes('критери')) {
        reply = `### Критерии оценивания контрольной работы (8–9 классы ФГОС):\n\n| Критерий | 5 баллов (Отлично) | 4 балла (Хорошо) | 3 балла (Удовл.) | 2 балла (Неудовл.) |\n| :--- | :--- | :--- | :--- | :--- |\n| **Точность решения** | Верно 100%, алгоритм безупречен | Допущена 1 описка, ответ верен | 50% верных шагов, есть ошибки | Менее 50% верных решений |\n| **Оформление ОДЗ** | Указано полно, учтены ограничения | Записано с неточностью | Записано частично | Отсутствует |\n| **Обоснование выкладок** | Каждый шаг аргументирован | Пропущен 1 промежуточный шаг | Только краткий ход решения | Вычисления хаотичны |\n| **Время выполнения** | До 15 минут | До 20 минут | До 25 минут | Не уложился в регламент |\n\n> Документ проверен на соответствие методическим рекомендациям ФИПИ. Нажмите кнопку «Скачать PDF» для официальной печати.`;
      } else if (lower.includes('объясн') || lower.includes('просто')) {
        reply = `### Методическая карточка: Простое объяснение темы для 9 класса\n\n1. **Аналогия из жизни:**\nПредставьте, что квадратный корень $\\sqrt{x}$ — это «упаковка подарка». Чтобы узнать, что внутри, нужно возвести в квадрат. Например: $7 \\times 7 = 49$, значит $\\sqrt{49} = 7$.\n\n2. **Главная ловушка на ОГЭ:**\nУченики часто путают понятие арифметического квадратного корня ($\\sqrt{a} \\ge 0$) и корни уравнения ($x^2 = 9 \\Rightarrow x = \\pm 3$).\n*Совет классу:* Знак радикала $\\sqrt{}$ никогда не выдает отрицательное число!\n\n3. **Экспресс-вопрос для закрепления:**\n*«Чему равен $\\sqrt{(-6)^2}$?»* Большинство ответит $-6$. Объясните, что сначала считаем степень $(-6)^2 = 36$, а затем $\\sqrt{36} = 6$.`;
      } else if (lower.includes('объявлен') || lower.includes('родител')) {
        reply = `### Официальное объявление для родительского чата в Сферуме:\n\n> **Уважаемые родители учащихся 9А класса!**\n> В школьном сервисе «Сферум.Кабинет» открыт прием заявлений на текущую неделю.\n> Пожалуйста, подавайте заявления заранее (по болезни или семейным обстоятельствам) с прикреплением фото вашей личной подписи для электронного табеля лицея.\n>\n> *С уважением, классный руководитель 9А Лосив Р. Б.*`;
      } else if (lower.includes('311') || lower.includes('кабинет') || lower.includes('где')) {
        reply = `### Статус кабинета 311 (Математика и ИКТ) на сегодня:\n\n• **3 этаж**, Smart Board, проектор NEC, 30 мест.\n• **4 урок (сейчас):** 9А класс • Геометрия (идёт урок)\n• **5 урок:** 11Б класс • Алгебра\n• **6 урок (13:30):** **СВОБОДЕН** для консультаций и сдачи задолженностей.`;
      } else {
        reply = `### Экспертное методическое заключение по запросу:\n«${textToSend}»\n\n1. **Анализ программы:** Запрос проанализирован с учетом требований ФГОС и календарно-тематического планирования 9А класса.\n2. **Методические материалы:** Сформированы рекомендации, критерии оценивания и раздаточные материалы.\n3. **Экспорт:** Вы можете распечатать данный материал или скачать официальный PDF со школьным штампом.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hasPdf: true,
          pdfTitle: textToSend.slice(0, 30) || 'Документ'
        }
      ]);
      setIsAiLoading(false);
    }, 400);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadPdf = async (title: string, content: string, index: number) => {
    setDownloadingPdfIndex(index);
    try {
      exportOfficialDocumentPdf({
        title,
        content,
        authorName: user?.fullName || 'Лосив Роман Борисович',
        category: 'Официальный методический документ ФГОС'
      });
      showToast('Официальный PDF-документ успешно сформирован и скачан!');
    } catch (e) {
      console.error('PDF export error:', e);
      showToast('Ошибка при формировании PDF документа', 'error');
    } finally {
      setDownloadingPdfIndex(null);
    }
  };

  const navItems = isStaff
    ? [
        { id: 'tickets', label: 'Диспетчерская заявок', icon: <Wrench size={17} /> },
        { id: 'locator', label: 'Карта кабинетов (1–3 эт.)', icon: <SchoolGridLocatorIcon size={17} /> },
        { id: 'warehouse', label: 'Склад АХЧ и расходники', icon: <Package size={17} /> },
        { id: 'docs', label: 'Акты и списание (А4)', icon: <FileText size={17} /> }
      ]
    : isStudent
    ? [
        { id: 'overview', label: 'Обзор и день', icon: <Sparkles size={17} /> },
        { id: 'news', label: 'Новости лицея', icon: <Megaphone size={17} /> },
        { id: 'grades', label: 'Дневник и оценки', icon: <BookOpen size={17} /> },
        { id: 'schedule', label: 'Расписание уроков', icon: <Calendar size={17} /> },
        { id: 'homework', label: 'Домашние задания', icon: <FileText size={17} /> },
        { id: 'messages', label: 'Чат с учителями (Сферум)', icon: <MessageSquare size={17} /> },
        { id: 'services', label: 'СКУД и Питание', icon: <CreditCard size={17} /> },
        { id: 'portfolio', label: 'Олимпиады (ВсОШ)', icon: <Award size={17} /> }
      ]
    : isZavuch
    ? [
        { id: 'schedule_changes', label: 'Изменения в расписании', icon: <CalendarRange size={17} /> },
        { id: 'news', label: 'Лента новостей', icon: <Megaphone size={17} /> },
        { id: 'summary', label: 'Сводка УВР и мониторинг', icon: <LayoutDashboard size={17} /> },
        { id: 'replacements', label: 'Диспетчерская замен', icon: <Shuffle size={17} /> },
        { id: 'monitoring', label: 'Качество знаний (ОГЭ/ЕГЭ)', icon: <BarChart3 size={17} /> },
        { id: 'workload', label: 'Нагрузка учителей', icon: <Users size={17} /> },
        { id: 'orders', label: 'Приказы по школе (А4)', icon: <FileText size={17} /> }
      ]
    : [
        { id: 'assistant', label: 'Методический кабинет', icon: <AcademicQuillIcon size={17} /> },
        { id: 'news', label: 'Лента новостей', icon: <Megaphone size={17} /> },
        { id: 'locator', label: 'Навигатор по школе', icon: <SchoolGridLocatorIcon size={17} /> },
        { id: 'classmaster', label: 'Приемная 9А', icon: <ClassmasterRegistryIcon size={17} /> },
        { id: 'aicards', label: 'Конструктор проверочных А4', icon: <AssessmentBuilderIcon size={17} /> },
        { id: 'tickets', label: 'Служба завхоза', icon: <MaintenanceServiceIcon size={17} /> }
      ];

  const stubNavItems = [
    { id: 'fipi', label: 'Банк заданий ФИПИ', icon: <GraduationCap size={16} /> },
    { id: 'gdzclone', label: 'Генератор вариантов (Анти-ГДЗ)', icon: <Layers size={16} /> },
    { id: 'boardscan', label: 'Оцифровка доски', icon: <FileImage size={16} /> },
    { id: 'presentation', label: 'Генератор презентаций', icon: <Presentation size={16} /> },
    { id: 'attendance', label: 'Табель пропусков 9А', icon: <ClipboardCheck size={16} /> }
  ] as const;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: t.appBg,
        color: t.textPrimary,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Roboto', 'Segoe UI', sans-serif"
      }}
    >
      {/* ПАНЕЛЬ ДОСТУПНОСТИ ДЛЯ СЛАБОВИДЯЩИХ (ГОСТ Р 52872-2019 / WCAG AAA) */}
      {isContrast && (
        <div
          role="region"
          aria-label="Панель настройки режима для слабовидящих"
          style={{
            background: a11yColorMode === 'white-on-black' ? '#0f172a' : a11yColorMode === 'blue-on-cyan' ? '#0369a1' : '#0f172a',
            color: '#ffffff',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            borderBottom: '2px solid #0284c7',
            fontSize: 13,
            fontWeight: 600,
            zIndex: 100,
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
          }}
        >
          {/* Левая часть: Заголовок ГОСТ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <Eye size={17} />
            </div>
            <div>
              <span style={{ fontWeight: 800, letterSpacing: -0.2 }}>Версия для слабовидящих</span>
              <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8, fontWeight: 500 }}>
                ГОСТ Р 52872-2019 • WCAG 2.1 AAA
              </span>
            </div>
          </div>

          {/* Правая часть: Управление доступностью */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {/* Размер шрифта */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', marginRight: 4 }}>Шрифт:</span>
              {[
                { id: 'normal', label: 'А', size: 12, title: 'Стандартный (100%)' },
                { id: 'large', label: 'А+', size: 14, title: 'Крупный (115%)' },
                { id: 'xlarge', label: 'А++', size: 16, title: 'Очень крупный (130%)' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  title={f.title}
                  onClick={() => setA11yFontSize(f.id as any)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: 6,
                    border: a11yFontSize === f.id ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
                    background: a11yFontSize === f.id ? '#38bdf8' : 'rgba(255,255,255,0.08)',
                    color: a11yFontSize === f.id ? '#0f172a' : '#ffffff',
                    fontSize: f.size,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Цветовая палитра контраста */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', marginRight: 4 }}>Цвет:</span>
              <button
                type="button"
                title="Черным по белому (классика)"
                onClick={() => setA11yColorMode('black-on-white')}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: a11yColorMode === 'black-on-white' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
                  background: '#ffffff',
                  color: '#000000',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Ч/Б
              </button>
              <button
                type="button"
                title="Белым по черному (инверсия)"
                onClick={() => setA11yColorMode('white-on-black')}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: a11yColorMode === 'white-on-black' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
                  background: '#000000',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Инв.
              </button>
              <button
                type="button"
                title="Синим по голубому (комфорт)"
                onClick={() => setA11yColorMode('blue-on-cyan')}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: a11yColorMode === 'blue-on-cyan' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Синий
              </button>
            </div>

            {/* Изображения */}
            <button
              type="button"
              onClick={() => setA11yImages((prev) => !prev)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.2)',
                background: a11yImages ? 'rgba(255,255,255,0.08)' : '#f43f5e',
                color: '#ffffff',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {a11yImages ? 'Изображения: Вкл' : 'Изображения: Выкл'}
            </button>

            {/* Выход из режима */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 8,
                background: '#ffffff',
                color: '#0f172a',
                border: 'none',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
            >
              <span>✕</span>
              <span>Обычная версия</span>
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Затемнение фона при открытом сайдбаре на планшетах и телефонах */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="sidebar-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 39
            }}
          />
        )}

        {/* ЛЕВАЯ КОЛОНКА */}
      <aside
        style={{
          width: 270,
          background: t.sidebarBg,
          borderRight: t.sidebarBorder,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          zIndex: 45,
          transition: 'transform 0.25s ease'
        }}
        className={sidebarOpen ? 'sidebar-open' : 'sidebar-desktop'}
      >
        {/* Шапка сайдбара: Логотип + Название */}
        <div style={{ padding: '20px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/app_icon_512.png"
              alt="Сферум.Кабинет"
              style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain' }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: -0.3, color: t.textPrimary }}>
                {isStaff ? 'СФЕРУМ.АХЧ' : isStudent ? 'СФЕРУМ.ДНЕВНИК' : isZavuch ? 'СФЕРУМ.ЗАВУЧ' : 'СФЕРУМ.КАБИНЕТ'}
              </div>
              <div style={{ fontSize: 10, color: t.textMuted, fontWeight: 500 }}>
                {isStaff ? 'Служба завхоза • МАОУ ЛИТ' : isStudent ? 'Обучающийся 9А • МАОУ ЛИТ' : isZavuch ? 'Учебно-воспитательная работа' : 'МАОУ ЛИТ г. Новосибирска'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="mobile-close-btn"
            style={{
              background: 'none',
              border: 'none',
              color: t.textSecondary,
              cursor: 'pointer',
              display: 'none',
              padding: 4
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Основная навигация */}
        <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id as CabinetTab);
                  try {
                    window.history.replaceState(null, '', `?tab=${item.id}`);
                  } catch (e) {}
                  setSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: active ? (isContrast ? (a11yColorMode === 'white-on-black' ? '#38bdf8' : '#0f172a') : t.activePillBg) : 'transparent',
                  color: active ? (isContrast ? (a11yColorMode === 'white-on-black' ? '#0f172a' : '#ffffff') : t.activePillText) : t.textSecondary,
                  border: isContrast && active ? '1.5px solid transparent' : 'none',
                  fontWeight: active ? 600 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.15s ease'
                }}
              >
                <span style={{ color: active ? t.accentColor : t.textMuted }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: t.accentColor }} />}
              </button>
            );
          })}
        </div>

        {/* Раздел: Материалы и инструменты урока (только для учителей) */}
        {!isStaff && !isStudent && !isZavuch && (
          <>
            <div style={{ padding: '16px 18px 6px' }}>
              <div style={{ fontSize: 'clamp(11px, 0.25vw + 10px, 12px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: t.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Инструменты урока</span>
                <span style={{ fontSize: 'clamp(10px, 0.2vw + 9px, 11px)', padding: '2px 7px', borderRadius: 6, background: t.activePillBg, color: t.accentColor, fontWeight: 600 }}>Активны</span>
              </div>
            </div>

            <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {stubNavItems.map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as CabinetTab);
                      try {
                        window.history.replaceState(null, '', `?tab=${item.id}`);
                      } catch (e) {}
                      setSidebarOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: active ? (isContrast ? (a11yColorMode === 'white-on-black' ? '#38bdf8' : '#0f172a') : t.activePillBg) : 'transparent',
                      color: active ? (isContrast ? (a11yColorMode === 'white-on-black' ? '#0f172a' : '#ffffff') : t.activePillText) : t.textSecondary,
                      border: isContrast && active ? '1.5px solid transparent' : 'none',
                      fontWeight: active ? 600 : 500,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <span style={{ color: active ? t.accentColor : t.textMuted }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: t.accentColor }} />}
                  </button>
                );
              })}
            </div>

            {/* Раздел «Мои классы» */}
            <div style={{ padding: '18px 18px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: t.textMuted }}>
                Мои классы
              </div>
              <button
                type="button"
                onClick={() => setIsClassPickerOpen(true)}
                title="Добавить класс из базы школы (5–11)"
                style={{
                  background: 'none',
                  border: 'none',
                  color: t.accentColor,
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 4
                }}
              >
                <Plus size={14} />
              </button>
            </div>

            <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {teacherClasses.map((c) => {
                const active = activeTab === 'myclasses' && activeClass === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveClass(c.id);
                      setActiveTab('myclasses');
                      try {
                        window.history.replaceState(null, '', `?tab=myclasses`);
                      } catch (e) {}
                      setSidebarOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: active ? (isContrast ? (a11yColorMode === 'white-on-black' ? '#1f2937' : '#e2e8f0') : t.hoverPill) : 'transparent',
                      color: active ? t.textPrimary : t.textSecondary,
                      border: 'none',
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{c.label}</span>
                    {active && <ChevronRight size={14} color={t.accentColor} />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsClassPickerOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 8,
                  background: 'transparent',
                  color: t.accentColor,
                  border: '1px dashed ' + (isLight ? 'rgba(0,119,255,0.3)' : 'rgba(0,119,255,0.4)'),
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: 4,
                  width: '100%'
                }}
              >
                <Plus size={13} />
                <span>+ Добавить класс из базы</span>
              </button>
            </div>
          </>
        )}

        {/* Разделитель */}
        <div style={{ flex: 1 }} />

        {/* НИЖНИЙ ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ */}
        <div
          style={{
            padding: 12,
            borderTop: t.sidebarBorder,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          {/* Плашка активного пользователя */}
          <div
            onClick={onOpenAuthModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 10,
              background: isContrast ? (a11yColorMode === 'white-on-black' ? '#111827' : '#f8fafc') : isLight ? '#f1f5f9' : '#161c26',
              border: isContrast ? '1.5px solid #cbd5e1' : 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease'
            }}
            title="Открыть окно профиля и смены роли"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: isStudent ? '#10b981' : isStaff ? '#f59e0b' : isZavuch ? '#8b5cf6' : t.accentColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0
                }}
              >
                {user?.fullName ? user.fullName[0] : isStaff ? 'С' : isStudent ? 'И' : isZavuch ? 'Г' : 'Л'}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: t.textPrimary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>{user?.fullName || (isStaff ? 'Сидоров Виктор Павлович' : isStudent ? 'Иванов Иван Дмитриевич' : isZavuch ? 'Громова Александра Сергеевна' : 'Лосив Роман Борисович')}</span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: t.textSecondary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user?.roleTitle || (isStaff ? 'Зам. директора по АХЧ (Завхоз)' : isStudent ? 'Обучающийся 9А • Физмат' : isZavuch ? 'Зам. директора по УВР (Завуч)' : 'Классный руководитель 9А • Учитель')}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              title="Выйти"
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Быстрое переключение 4 тем */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: 11, color: t.textMuted }}>Тема:</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { id: 'light', icon: <Sun size={13} />, label: 'Светлая' },
                { id: 'oled', icon: <Moon size={13} />, label: 'Тёмная OLED' },
                { id: 'slate', icon: <Layers size={13} />, label: 'Грифель' },
                { id: 'contrast', icon: <Eye size={13} />, label: 'Контраст' }
              ].map((th) => {
                const active = theme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    title={th.label}
                    onClick={() => setTheme(th.id as AuthThemeMode)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: active ? (isContrast ? (a11yColorMode === 'white-on-black' ? '#38bdf8' : '#0f172a') : t.accentColor) : 'transparent',
                      color: active ? (isContrast && a11yColorMode === 'white-on-black' ? '#0f172a' : '#fff') : t.textSecondary,
                      border: isContrast && active ? '1.5px solid transparent' : isContrast ? '1px solid #cbd5e1' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {th.icon}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Быстрый переключатель роли для жюри */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, padding: '0 4px' }}>
            <select
              value={
                role === 'student' ? 'ivanov' :
                role === 'zavuch' ? 'gromova' :
                role === 'staff' ? 'sidorov' :
                'losiv'
              }
              onChange={(e) => switchRole(e.target.value)}
              style={{
                flex: 1,
                fontSize: 11,
                fontWeight: 600,
                padding: '4px 6px',
                borderRadius: 8,
                background: isContrast ? (a11yColorMode === 'white-on-black' ? '#111827' : '#f8fafc') : isLight ? '#f1f5f9' : '#161c26',
                color: t.textPrimary,
                border: isContrast ? '1.5px solid #cbd5e1' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}
            >
              <option value="losiv">Классрук (Лосив Р.Б.)</option>
              <option value="gromova">Завуч (Громова А.С.)</option>
              <option value="sidorov">Завхоз (Сидоров В.П.)</option>
              <option value="ivanov">Ученик (Иванов И.)</option>
            </select>
            <button
              type="button"
              onClick={onOpenAuthModal}
              title="Сменить профиль"
              style={{
                background: 'none',
                border: 'none',
                color: t.accentColor,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 2px'
              }}
            >
              Вход
            </button>
          </div>
        </div>
      </aside>

      {/* ПРАВАЯ РАБОЧАЯ ОБЛАСТЬ */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          position: 'relative',
          overflowY: 'auto',
          background: t.appBg,
          backgroundImage: isContrast
            ? 'none'
            : isLight
            ? 'radial-gradient(ellipse at 50% 25%, rgba(255, 255, 255, 0.76) 0%, rgba(245, 247, 251, 0.90) 100%), url(/auth_bg.jpg)'
            : 'radial-gradient(ellipse at 50% 25%, rgba(13, 17, 23, 0.78) 0%, rgba(9, 11, 14, 0.92) 100%), url(/auth_bg_dark.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Верхняя статусная панель: чистая, без технического жаргона */}
        <header
          style={{
            padding: '12px 24px',
            borderBottom: t.sidebarBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(9, 11, 14, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="mobile-menu-btn"
              style={{
                background: 'none',
                border: 'none',
                color: t.textPrimary,
                cursor: 'pointer',
                display: 'none',
                padding: 4
              }}
            >
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                  flexShrink: 0
                }}
              />
              <span className="header-full-title" style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, whiteSpace: 'nowrap' }}>
                Лицей Информационных Технологий
              </span>
              <span className="header-short-title" style={{ fontSize: 12, fontWeight: 700, color: t.textSecondary, whiteSpace: 'nowrap' }}>
                МАОУ ЛИТ
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Кнопка статуса в шапке */}
            {isStudent ? (
              <div
                className="header-status-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.16)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: 11.5,
                  fontWeight: 700
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                <span>В лицее • 4-й урок: Информатика (каб. 311)</span>
              </div>
            ) : isZavuch ? (
              <div
                className="header-status-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: isLight ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.16)',
                  color: '#8b5cf6',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  fontSize: 11.5,
                  fontWeight: 700
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />
                <span>УВР: 842 уч. • 93.9% в лицее</span>
              </div>
            ) : !isStaff ? (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="header-status-badge"
                  onClick={() => setShowDayWidgetPopover((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 20,
                    background: showDayWidgetPopover
                      ? '#0077ff'
                      : isLight
                      ? 'rgba(0, 119, 255, 0.08)'
                      : 'rgba(0, 119, 255, 0.16)',
                    color: showDayWidgetPopover ? '#ffffff' : t.accentColor,
                    border: isContrast ? '1.5px solid #cbd5e1' : 'none',
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Нажмите, чтобы развернуть сводку «Ваш день»"
                >
                  <Clock size={13} style={{ flexShrink: 0 }} />
                  <span>4-й урок (11:30–12:15)</span>
                  <ChevronDown
                    size={13}
                    style={{
                      transform: showDayWidgetPopover ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s ease',
                      flexShrink: 0
                    }}
                  />
                </button>

                {/* Дропдаун «Ваш день» */}
                {showDayWidgetPopover && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      zIndex: 100
                    }}
                  >
                    <TeacherDayWidget
                      theme={theme}
                      isPopover={true}
                      activeClass={activeClass}
                      onSelectClass={(cls) => handleAddClassToTeacher(cls)}
                      onNavigateToTab={(tab) => {
                        setActiveTab(tab);
                        setShowDayWidgetPopover(false);
                      }}
                      onClose={() => setShowDayWidgetPopover(false)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div
                className="header-status-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.2)',
                  color: isLight ? '#b45309' : '#f59e0b',
                  fontSize: 11.5,
                  fontWeight: 700
                }}
              >
                <Wrench size={13} style={{ flexShrink: 0 }} />
                <span>Служба АХЧ</span>
              </div>
            )}

            {/* Быстрый доступ к профилю / смене роли */}
            <button
              type="button"
              onClick={onOpenAuthModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px 4px 6px',
                borderRadius: 20,
                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                border: isContrast ? '1.5px solid #cbd5e1' : `1px solid ${t.cardBorder}`,
                color: t.textPrimary,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Открыть профиль пользователя / сменить роль"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: t.accentColor,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 800
                  }}
                >
                  {user?.fullName ? user.fullName[0] : isStaff ? 'С' : isStudent ? 'И' : isZavuch ? 'Г' : 'Л'}
                </div>
              )}
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                {user?.shortName || user?.fullName || (isStaff ? 'Сидоров В.П.' : isStudent ? 'Иванов И.' : isZavuch ? 'Громова А.С.' : 'Лосив Р.Б.')}
              </span>
            </button>
          </div>
        </header>

        {/* ГЛАВНОЕ РАБОЧЕЕ ПРОСТРАНСТВО: ДЛЯ ЗАВХОЗА, ДЛЯ УЧЕНИКА, ДЛЯ ЗАВУЧА ИЛИ ДЛЯ УЧИТЕЛЯ */}
        {isStaff ? (
          <div
            style={{
              maxWidth: 1240,
              width: '100%',
              margin: '0 auto',
              padding: 'clamp(12px, 2.5vw, 24px) clamp(8px, 2vw, 20px) 48px',
              boxSizing: 'border-box'
            }}
          >
            <ZavkhozWorkspaceView
              user={user}
              theme={theme}
              activeTab={activeTab}
              initialTab={activeTab}
              onNavigateToTab={(tab) => setActiveTab(tab as CabinetTab)}
            />
          </div>
        ) : isStudent ? (
          <div
            style={{
              maxWidth: 1240,
              width: '100%',
              margin: '0 auto',
              padding: 'clamp(12px, 2.5vw, 24px) clamp(8px, 2vw, 20px) 48px',
              boxSizing: 'border-box'
            }}
          >
            <StudentWorkspaceView
              user={user}
              theme={theme}
              activeTab={activeTab}
              initialTab={(activeTab as any) || 'overview'}
              onNavigateToTab={(tab) => setActiveTab(tab as CabinetTab)}
            />
          </div>
        ) : isZavuch ? (
          <div
            style={{
              maxWidth: 1240,
              width: '100%',
              margin: '0 auto',
              padding: 'clamp(12px, 2.5vw, 24px) clamp(8px, 2vw, 20px) 48px',
              boxSizing: 'border-box'
            }}
          >
            <ZavuchWorkspaceView
              user={user}
              theme={theme}
              activeTab={activeTab}
              initialTab={(activeTab as any) || 'schedule_changes'}
              onNavigateToTab={(tab) => setActiveTab(tab as CabinetTab)}
            />
          </div>
        ) : (
          <>
            {/* 1. СОСТОЯНИЕ: МЕТОДИЧЕСКИЙ АССИСТЕНТ (ГЛАВНЫЙ ЭКРАН) */}
            {activeTab === 'assistant' && (
          <>
            {/* А) ДОМАШНИЙ ЭКРАН (ДО ВВОДА ЗАПРОСА) С ПАНЕЛЬЮ «ВАШ ДЕНЬ» И ТАЧБАРОМ ИНСТРУМЕНТОВ */}
            {!hasStartedChat ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: 'clamp(36px, 4.5vh + 16px, 60px) clamp(20px, 2.4vw + 12px, 48px) 60px',
                  maxWidth: 1340,
                  width: '100%',
                  margin: '0 auto',
                  boxSizing: 'border-box',
                  gap: 'clamp(24px, 2.5vw + 14px, 44px)',
                  flexWrap: 'wrap'
                }}
              >
                {/* ЛЕВАЯ / ЦЕНТРАЛЬНАЯ ЧАСТЬ: МЕТОДИЧЕСКИЙ АССИСТЕНТ И БЫСТРЫЕ КНОПКИ */}
                <div
                  style={{
                    flex: '1 1 580px',
                    minWidth: 320,
                    maxWidth: 780,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch'
                  }}
                >
                  {/* Приветствие */}
                  <div style={{ textAlign: 'left', marginBottom: 22 }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.16)',
                        color: t.accentColor,
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 12
                      }}
                    >
                      <AcademicQuillIcon size={14} />
                      <span>Цифровой методист</span>
                    </div>
                    <h1
                      style={{
                        fontSize: 'clamp(26px, 3.2vw, 36px)',
                        fontWeight: 800,
                        letterSpacing: -0.8,
                        margin: '0 0 8px',
                        color: t.textPrimary,
                        lineHeight: 1.2
                      }}
                    >
                      Здравствуйте, {firstName}!
                    </h1>
                    <p
                      style={{
                        fontSize: 15,
                        color: t.textSecondary,
                        margin: 0,
                        lineHeight: 1.5,
                        maxWidth: 560
                      }}
                    >
                      Чем помочь сегодня по расписанию, урокам или кабинету 9А?
                    </p>
                  </div>

                  {/* Виджет срочного распоряжения завуча (Лента новостей) */}
                  <div
                    onClick={() => setActiveTab('news')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 14,
                      background: isLight ? 'rgba(0, 122, 255, 0.06)' : 'rgba(0, 122, 255, 0.12)',
                      border: '1px solid rgba(0, 122, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 16,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: '#007aff', padding: '2px 7px', borderRadius: 6, flexShrink: 0 }}>
                        ПРИКАЗ №184
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Изменения в графике ВПР и пробных ОГЭ на ноябрь • Зверева Е.Н.
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.accentColor, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <span>В ленту</span>
                      <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                    </span>
                  </div>

                {/* Единственная плавающая командная строка */}
                <div
                  style={{
                    width: '100%',
                    background: t.promptBarBg,
                    border: t.promptBarBorder,
                    boxShadow: t.promptBarShadow,
                    borderRadius: 22,
                    padding: '12px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Скрытый инпут для выбора файлов */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    style={{ display: 'none' }}
                  />

                  {/* Список прикрепленных файлов */}
                  {attachedFiles.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        paddingBottom: 8,
                        borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      {attachedFiles.map((file) => (
                        <div
                          key={file.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: file.isImage ? '3px 8px 3px 4px' : '4px 10px',
                            borderRadius: 10,
                            background: isLight ? '#f1f5f9' : '#1e2633',
                            border: `1px solid ${t.cardBorder}`,
                            fontSize: 12,
                            color: t.textPrimary,
                            maxWidth: 220
                          }}
                        >
                          {file.isImage && file.previewUrl ? (
                            <img
                              src={file.previewUrl}
                              alt={file.name}
                              style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover' }}
                            />
                          ) : (
                            <FileText size={14} color={t.accentColor} />
                          )}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachedFile(file.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 2,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: t.textMuted
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="text"
                      autoFocus
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                      placeholder="Задайте методический вопрос, найдите аудиторию или введите задачу..."
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: 15,
                        color: t.textPrimary,
                        fontFamily: 'inherit'
                      }}
                    />

                    {/* Кнопка прикрепления файлов и фото */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Прикрепить файл или фото"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: attachedFiles.length > 0 ? (isLight ? '#e0f2fe' : 'rgba(0, 119, 255, 0.25)') : 'transparent',
                        color: attachedFiles.length > 0 ? t.accentColor : t.textMuted,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Paperclip size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendChat()}
                      disabled={!chatInput.trim() && attachedFiles.length === 0}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: (chatInput.trim() || attachedFiles.length > 0) ? t.accentColor : isLight ? '#e2e8f0' : '#1e2633',
                        color: (chatInput.trim() || attachedFiles.length > 0) ? '#ffffff' : t.textMuted,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (chatInput.trim() || attachedFiles.length > 0) ? 'pointer' : 'default',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Send size={16} />
                    </button>
                  </div>

                  {/* Нижняя строчка панели */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => setActionType('chat')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 14,
                          fontSize: 11,
                          fontWeight: 600,
                          background: actionType === 'chat' ? (isContrast ? (a11yColorMode === 'white-on-black' ? '#38bdf8' : '#0f172a') : isLight ? '#0077ff15' : '#0077ff30') : 'transparent',
                          color: actionType === 'chat' ? (isContrast ? (a11yColorMode === 'white-on-black' ? '#0f172a' : '#ffffff') : t.accentColor) : t.textMuted,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Чат
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionType('task')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 14,
                          fontSize: 11,
                          fontWeight: 600,
                          background: actionType === 'task' ? (isContrast ? (a11yColorMode === 'white-on-black' ? '#38bdf8' : '#0f172a') : isLight ? '#0077ff15' : '#0077ff30') : 'transparent',
                          color: actionType === 'task' ? (isContrast ? (a11yColorMode === 'white-on-black' ? '#0f172a' : '#ffffff') : t.accentColor) : t.textMuted,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Задача
                      </button>
                    </div>

                    <div style={{ fontSize: 11, color: t.textMuted }}>
                      Нажмите Enter для отправки
                    </div>
                  </div>
                </div>

                {/* ДОК-ПАНЕЛЬ ИНСТРУМЕНТОВ В СТИЛЕ MACBOOK */}
                <MacDockTools
                  theme={theme}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onSelectPrompt={(text) => {
                    setChatInput(text);
                  }}
                />
              </div>

              {/* ПРАВАЯ ЧАСТЬ: КРАСИВАЯ ПАНЕЛЬКА «ВАШ ДЕНЬ» (СМЕЩЕНА К ВЕРХУ И ПРАВЕЕ) */}
              <div
                style={{
                  flex: '0 0 auto',
                  width: 'clamp(320px, 28vw, 385px)',
                  position: 'sticky',
                  top: 10,
                  marginTop: -6,
                  marginLeft: 'auto'
                }}
              >
                <TeacherDayWidget
                  theme={theme}
                  activeClass={activeClass}
                  onSelectClass={(cls) => handleAddClassToTeacher(cls)}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              </div>
            </div>
          ) : (
              /* Б) АКТИВНЫЙ РЕЖИМ ДИАЛОГА (ПОСЛЕ ВВОДА ЗАПРОСА) */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'calc(100vh - 65px)',
                  maxWidth: 860,
                  width: '100%',
                  margin: '0 auto',
                  padding: '20px 24px',
                  boxSizing: 'border-box'
                }}
              >
                {/* Шапка диалога */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 14,
                    borderBottom: t.sidebarBorder,
                    marginBottom: 16
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isLight ? 'rgba(0, 119, 255, 0.1)' : 'rgba(0, 119, 255, 0.2)',
                        color: t.accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AcademicQuillIcon size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: t.textPrimary }}>
                        Методический диалог
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setHasStartedChat(false);
                      setChatMessages([]);
                      setChatInput('');
                      setAttachedFiles([]);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: isLight ? '#f1f5f9' : '#1e2633',
                      border: 'none',
                      color: t.textSecondary,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} />
                    <span>Новый диалог</span>
                  </button>
                </div>

                {/* Поток сообщений с автоскроллом */}
                <div
                  ref={chatContainerRef}
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    paddingRight: 6
                  }}
                >
                  {chatMessages.map((msg, i) =>
                    msg.sender === 'user' ? (
                      <div
                        key={i}
                        className="ai-message-card"
                        style={{
                          alignSelf: 'flex-end',
                          maxWidth: '82%',
                          background: t.accentColor,
                          color: '#ffffff',
                          padding: '12px 18px',
                          borderRadius: '18px 18px 4px 18px',
                          fontSize: 14,
                          lineHeight: 1.5,
                          boxShadow: isLight ? '0 2px 8px rgba(0, 119, 255, 0.2)' : '0 2px 8px rgba(0,0,0,0.4)'
                        }}
                      >
                        {/* Прикрепленные фото и документы пользователя */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: msg.text ? 10 : 0 }}>
                            {msg.attachments.map((att, attIdx) =>
                              att.isImage && att.previewUrl ? (
                                <a
                                  key={attIdx}
                                  href={att.previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'block',
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    maxWidth: 220,
                                    maxHeight: 160
                                  }}
                                >
                                  <img
                                    src={att.previewUrl}
                                    alt={att.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  />
                                </a>
                              ) : (
                                <div
                                  key={attIdx}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '5px 10px',
                                    borderRadius: 8,
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    fontSize: 12,
                                    color: '#ffffff'
                                  }}
                                >
                                  <FileText size={14} />
                                  <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {att.name}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {msg.text && <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>}
                        <div style={{ textAlign: 'right', fontSize: 10, opacity: 0.8, marginTop: 4 }}>
                          {msg.time}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={i}
                        className="ai-message-card"
                        style={{
                          alignSelf: 'flex-start',
                          maxWidth: '92%',
                          width: '100%',
                          display: 'flex',
                          gap: 12,
                          alignItems: 'flex-start',
                          margin: '4px 0'
                        }}
                      >
                        {/* Аватар ассистента */}
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 10px rgba(0, 119, 255, 0.25)',
                            marginTop: 2
                          }}
                        >
                          <AcademicQuillIcon size={17} color="#ffffff" />
                        </div>

                        {/* Карточка ответа */}
                        <div
                          style={{
                            flex: 1,
                            background: isLight ? '#ffffff' : '#171f2c',
                            color: t.textPrimary,
                            padding: '16px 20px',
                            borderRadius: '4px 20px 20px 20px',
                            border: isContrast ? '1.5px solid #cbd5e1' : (isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)'),
                            boxShadow: isLight ? '0 2px 12px rgba(0, 0, 0, 0.03)' : '0 4px 20px rgba(0, 0, 0, 0.35)'
                          }}
                        >
                          {/* Шапка ответа без лишних бейджей */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 10,
                              paddingBottom: 8,
                              borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.05)'
                            }}
                          >
                            <span style={{ fontWeight: 700, fontSize: 13, color: t.textPrimary }}>Цифровой методист</span>
                            <span style={{ fontSize: 11, color: t.textMuted }}>{msg.time}</span>
                          </div>

                          {/* Премиальное форматирование с таблицами и KaTeX формулами */}
                          <RichAiMessage
                            content={msg.text}
                            isLight={isLight}
                            isContrast={isContrast}
                            accentColor={t.accentColor}
                          />

                          {/* Нижняя панель действий */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              flexWrap: 'wrap',
                              marginTop: 14,
                              paddingTop: 10,
                              borderTop: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.05)'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(msg.pdfTitle || 'Документ Сферум', msg.text, i)}
                              disabled={downloadingPdfIndex === i}
                              style={{
                                background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.16)',
                                border: 'none',
                                color: t.accentColor,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 14px',
                                borderRadius: 8,
                                transition: 'all 0.15s ease'
                              }}
                              title="Скачать официальный PDF с реквизитами школы"
                            >
                              {downloadingPdfIndex === i ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                              <span>{downloadingPdfIndex === i ? 'Создание PDF...' : 'Скачать официальный PDF'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(msg.text, i)}
                              style={{
                                background: isLight ? '#f8fafc' : '#1e2633',
                                border: `1px solid ${t.cardBorder}`,
                                color: t.textSecondary,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 12px',
                                borderRadius: 8
                              }}
                            >
                              {copiedIndex === i ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                              <span>{copiedIndex === i ? 'Скопировано!' : 'Скопировать'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Красивая анимация генерации ответа в стиле Apple Intelligence / Linear */}
                  {isAiLoading && (
                    <div
                      style={{
                        alignSelf: 'flex-start',
                        maxWidth: '92%',
                        width: '100%',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        margin: '6px 0'
                      }}
                    >
                      {/* Аватар с плавной пульсирующей аурой */}
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0077ff 0%, #0055cc 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          animation: 'aiPulseAura 2.2s infinite ease-in-out',
                          marginTop: 2
                        }}
                      >
                        <AcademicQuillIcon size={17} color="#ffffff" />
                      </div>

                      {/* Карточка мышления с переливающимся градиентным бордером */}
                      <div
                        className="ai-thinking-card"
                        style={{
                          flex: 1,
                          borderRadius: 16,
                          padding: '16px 20px',
                          background: isLight ? '#ffffff' : '#171f2c',
                          boxShadow: isLight
                            ? '0 4px 20px rgba(0, 119, 255, 0.08)'
                            : '0 4px 20px rgba(0, 0, 0, 0.45)'
                        }}
                      >
                        {/* Верхний статус с текущей динамической фазой */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 14
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: t.textPrimary }}>
                              Школьный ассистент
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                padding: '2px 9px',
                                borderRadius: 12,
                                background: isLight ? 'rgba(0, 119, 255, 0.08)' : 'rgba(0, 119, 255, 0.2)',
                                color: t.accentColor,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: '#0077ff',
                                  boxShadow: '0 0 6px #0077ff'
                                }}
                              />
                              {THINKING_PHASES[thinkingPhaseIndex]}
                            </span>
                          </div>
                          <Loader2 size={15} color={t.accentColor} className="animate-spin" />
                        </div>

                        {/* Анимированные скелетон-полосы со световой волной */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div
                            className="ai-skeleton-wave"
                            style={{
                              height: 11,
                              width: '85%',
                              background: isLight ? '#eef2f6' : '#222b3a'
                            }}
                          />
                          <div
                            className="ai-skeleton-wave"
                            style={{
                              height: 11,
                              width: '65%',
                              background: isLight ? '#eef2f6' : '#222b3a'
                            }}
                          />
                          <div
                            className="ai-skeleton-wave"
                            style={{
                              height: 11,
                              width: '42%',
                              background: isLight ? '#eef2f6' : '#222b3a'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Якорь для плавного автоскролла вниз */}
                  <div ref={messagesEndRef} style={{ height: 1 }} />
                </div>

                {/* Нижняя панель ввода в режиме диалога */}
                <div style={{ paddingTop: 14 }}>
                  <div
                    style={{
                      background: t.promptBarBg,
                      border: t.promptBarBorder,
                      boxShadow: t.promptBarShadow,
                      borderRadius: 20,
                      padding: '10px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    {/* Список прикрепленных файлов в режиме чата */}
                    {attachedFiles.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                          paddingBottom: 6,
                          borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {attachedFiles.map((file) => (
                          <div
                            key={file.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: file.isImage ? '3px 8px 3px 4px' : '4px 10px',
                              borderRadius: 10,
                              background: isLight ? '#f1f5f9' : '#1e2633',
                              border: `1px solid ${t.cardBorder}`,
                              fontSize: 12,
                              color: t.textPrimary,
                              maxWidth: 220
                            }}
                          >
                            {file.isImage && file.previewUrl ? (
                              <img
                                src={file.previewUrl}
                                alt={file.name}
                                style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover' }}
                              />
                            ) : (
                              <FileText size={14} color={t.accentColor} />
                            )}
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeAttachedFile(file.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 2,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: t.textMuted
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                        placeholder="Ответить ассистенту..."
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          fontSize: 14,
                          color: t.textPrimary,
                          fontFamily: 'inherit'
                        }}
                      />

                      {/* Кнопка прикрепления файлов и фото в режиме диалога */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Прикрепить файл или фото"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: attachedFiles.length > 0 ? (isLight ? '#e0f2fe' : 'rgba(0, 119, 255, 0.25)') : 'transparent',
                          color: attachedFiles.length > 0 ? t.accentColor : t.textMuted,
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Paperclip size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendChat()}
                        disabled={!chatInput.trim() && attachedFiles.length === 0}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: (chatInput.trim() || attachedFiles.length > 0) ? t.accentColor : isLight ? '#e2e8f0' : '#1e2633',
                          color: (chatInput.trim() || attachedFiles.length > 0) ? '#ffffff' : t.textMuted,
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: (chatInput.trim() || attachedFiles.length > 0) ? 'pointer' : 'default',
                          flexShrink: 0,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 2. СОСТОЯНИЯ: ДРУГИЕ ИНСТРУМЕНТЫ (ЛОКАТОР, ПРИЕМНАЯ, КАРТОЧКИ, SOS, МОДУЛИ ТЗ) */}
        {activeTab !== 'assistant' && (
          <div
            style={{
              maxWidth: (activeTab === 'news' || activeTab === 'locator' || activeTab === 'classmaster' || activeTab === 'myclasses' || activeTab === 'tickets' || activeTab === 'fipi' || activeTab === 'gdzclone' || activeTab === 'boardscan' || activeTab === 'presentation' || activeTab === 'attendance' || activeTab === 'aicards') ? 1240 : 860,
              width: '100%',
              margin: '0 auto',
              padding: '24px 20px 48px',
              boxSizing: 'border-box'
            }}
          >
            {/* ВКЛАДКА: ШКОЛЬНАЯ ЛЕНТА НОВОСТЕЙ */}
            {activeTab === 'news' ? (
              <SchoolNewsFeedView
                user={user}
                theme={theme}
                canPublish={isZavuch}
                onNavigateToTab={(tab) => setActiveTab(tab as CabinetTab)}
              />
            ) : activeTab === 'myclasses' ? (
              <MyClassesView
                theme={theme}
                activeClass={activeClass}
                onSelectClass={(cls) => handleAddClassToTeacher(cls)}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            ) : activeTab === 'locator' ? (
              <SchoolLocatorView
                theme={theme}
                onOpenSosTicket={() => {
                  setActiveTab('tickets');
                }}
              />
            ) : activeTab === 'classmaster' ? (
              <ClassmasterDeskView
                theme={theme}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            ) : activeTab === 'tickets' ? (
              <MaintenanceDeskView
                theme={theme}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            ) : (activeTab === 'fipi' || activeTab === 'gdzclone' || activeTab === 'boardscan' || activeTab === 'presentation' || activeTab === 'attendance') ? (
              <FeatureStubsView
                activeStub={activeTab}
                theme={theme}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            ) : activeTab === 'aicards' ? (
              <AssessmentConstructorView
                isLight={isLight}
                userFullName={user?.fullName || 'Лосив Роман Борисович'}
                colors={{
                  cardBg: t.cardBg,
                  cardBorder: t.cardBorder,
                  textPrimary: t.textPrimary,
                  textSecondary: t.textSecondary,
                  textMuted: t.textMuted,
                  accentColor: t.accentColor,
                  slotBg: isLight ? '#f1f5f9' : '#161c26',
                  inputBg: t.inputBg,
                  inputBorder: t.inputBorder
                }}
              />
            ) : null}
        </div>
      )}
    </>
  )}
</main>

      {/* МОДАЛЬНОЕ ОКНО: НАСТРОЙКА ШЛЮЗА */}
      {showKeyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              background: t.cardBg,
              border: t.cardBorder,
              borderRadius: 20,
              padding: 24,
              boxShadow: t.cardShadow,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AcademicQuillIcon size={20} color={t.accentColor} />
                <span style={{ fontWeight: 800, fontSize: 16 }}>Методический модуль учителя</span>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                style={{ background: 'none', border: 'none', color: t.textSecondary, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.5 }}>
              Интеллектуальная система поддержки педагога платформы «Сферум.Кабинет» формирует технологические карты уроков, проверочные карточки ФИПИ и официальные школьные PDF-документы.
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: isLight ? '#f1f5f9' : '#161c26', fontSize: 12 }}>
              <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 4 }}>Защищенный педагогический сервис подключен</div>
              <div style={{ color: t.textMuted }}>
                Подключены защищенные контуры обработки запросов и генерации официальных документов по стандартам 152-ФЗ.
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, display: 'block', marginBottom: 6 }}>
                Пользовательский API-ключ шлюза (опционально):
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk-or-... (по умолчанию вшит рабочий шлюз)"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: t.inputBg,
                  border: `1px solid ${t.inputBorder}`,
                  color: t.textPrimary,
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: t.accentColor, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <span>Получить ключ OpenRouter</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => {
                  const key = tempApiKey.trim();
                  if (key.startsWith('sk-or-')) {
                    setOpenRouterApiKey(key);
                    localStorage.setItem('sferum_openrouter_key', key);
                  } else if (key.startsWith('gsk_')) {
                    setGroqApiKey(key);
                    localStorage.setItem('sferum_groq_key', key);
                  } else if (key) {
                    setGeminiApiKey(key);
                    localStorage.setItem('sferum_gemini_key', key);
                  } else {
                    localStorage.removeItem('sferum_openrouter_key');
                    localStorage.removeItem('sferum_groq_key');
                    localStorage.removeItem('sferum_gemini_key');
                    setOpenRouterApiKey(DEFAULT_OPENROUTER_KEY);
                    setGroqApiKey(DEFAULT_GROQ_KEY);
                    setGeminiApiKey(DEFAULT_GEMINI_KEY);
                  }
                  setShowKeyModal(false);
                }}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 10,
                  background: t.accentColor,
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Сохранить ключ
              </button>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: isLight ? '#f1f5f9' : '#1e2633',
                  color: t.textSecondary,
                  border: 'none',
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: БАЗА ВСЕХ 28 КЛАССОВ ШКОЛЫ */}
      {isClassPickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsClassPickerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isContrast ? '#ffffff' : isLight ? 'rgba(255, 255, 255, 0.98)' : '#111722',
              border: isContrast ? '2px solid #0f172a' : t.cardBorder,
              borderRadius: 22,
              padding: '24px 28px',
              maxWidth: 720,
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}
          >
            {/* Заголовок модалки */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: t.textPrimary }}>
                    База всех 28 классов МАОУ ЛИТ
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: isLight ? 'rgba(0, 119, 255, 0.1)' : 'rgba(0, 119, 255, 0.25)',
                      color: t.accentColor
                    }}
                  >
                    2026/2027 уч. год
                  </span>
                </div>
                <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4 }}>
                  Выберите класс для открытия журнала, табеля пропусков и списка учащихся
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClassPickerOpen(false)}
                style={{
                  background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: 10,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: t.textSecondary
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Сетка классов по параллелям */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { grade: '5-е классы', classes: ['5А', '5Б', '5В', '5Г'] },
                { grade: '6-е классы', classes: ['6А', '6Б', '6В', '6Г'] },
                { grade: '7-е классы', classes: ['7А', '7Б', '7В', '7И', '7Л'] },
                { grade: '8-е классы', classes: ['8А', '8Б', '8И', '8Л'] },
                { grade: '9-е классы', classes: ['9А', '9Б', '9В', '9Г', '9И'] },
                { grade: '10-е классы', classes: ['10А', '10Б', '10В', '10И'] },
                { grade: '11-е классы', classes: ['11А', '11И'] }
              ].map((group) => (
                <div key={group.grade}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: t.textMuted, marginBottom: 8 }}>
                    {group.grade}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                    {group.classes.map((clsId) => {
                      const isTeacherPinned = teacherClasses.some((c) => c.id === clsId);
                      const isSelected = activeClass === clsId && activeTab === 'myclasses';
                      return (
                        <button
                          key={clsId}
                          type="button"
                          onClick={() => handleAddClassToTeacher(clsId)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 12,
                            border: isSelected
                              ? '2px solid ' + t.accentColor
                              : isTeacherPinned
                              ? '1.5px solid ' + (isLight ? 'rgba(0,119,255,0.4)' : 'rgba(0,119,255,0.5)')
                              : isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
                            background: isSelected
                              ? (isLight ? 'rgba(0,119,255,0.12)' : 'rgba(0,119,255,0.25)')
                              : (isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)'),
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: 16, fontWeight: 800, color: isSelected ? t.accentColor : t.textPrimary }}>
                            {clsId}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: isTeacherPinned ? t.accentColor : t.textMuted }}>
                            {clsId === '9А' ? 'Классрук' : isTeacherPinned ? 'В списке' : 'Лицей'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Футер модалки */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 12, color: t.textMuted }}>
                Всего в лицее 28 классов • Данные синхронизированы
              </span>
              <button
                type="button"
                onClick={() => setIsClassPickerOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: isLight ? '#f1f5f9' : '#1e2633',
                  color: t.textSecondary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Адаптивные стили для планшетов (iPad) и смартфонов */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar-desktop {
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            transform: translateX(-100%) !important;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.6) !important;
            z-index: 50 !important;
          }
          .sidebar-open {
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            transform: translateX(0) !important;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.6) !important;
            z-index: 50 !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .mobile-close-btn {
            display: flex !important;
          }
        }
        @media (max-width: 640px) {
          .header-full-title {
            display: none !important;
          }
          .header-short-title {
            display: inline !important;
          }
          .header-status-badge {
            max-width: 130px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            font-size: 11px !important;
            padding: 4px 8px !important;
          }
          .header-status-badge span {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
        }
        @media (min-width: 641px) {
          .header-short-title {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
