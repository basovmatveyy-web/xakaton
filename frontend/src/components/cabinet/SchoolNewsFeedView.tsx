import React, { useState, useEffect, useMemo } from 'react';
import {
  Megaphone,
  Pin,
  Plus,
  Search,
  CheckCircle2,
  Eye,
  Share2,
  FileText,
  Trash2,
  X,
  Clock,
  Send,
  Download,
  Check
} from 'lucide-react';
import type { User, AuthThemeMode } from '../../types/auth';
import { useToast } from '../common/ToastContext';

export type NewsCategory = 'all' | 'orders' | 'urgent' | 'events' | 'olympiads' | 'canteen' | 'safety';
export type NewsPriority = 'normal' | 'important' | 'urgent' | 'pinned';
export type NewsAudience = 'all' | 'teachers' | 'students' | 'parents';

export interface NewsPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  categoryLabel: string;
  authorName: string;
  authorRole: string;
  authorAvatarBg?: string;
  date: string;
  timestamp: number;
  priority: NewsPriority;
  isPinned: boolean;
  targetAudience: NewsAudience;
  audienceLabel: string;
  viewsCount: number;
  reactions: {
    like: number;
    heart: number;
    applause: number;
    fire: number;
  };
  userReactions?: string[];
  attachments?: Array<{
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'link';
  }>;
  acknowledgedBy?: string[];
  requiresAcknowledge?: boolean;
  tags: string[];
}

const STORAGE_KEY = 'sferum_school_newsfeed_v2';

const INITIAL_NEWS_POSTS: NewsPost[] = [
  {
    id: 'news-1',
    title: 'Приказ №184-УВР: Изменения в графике ВПР и пробных ОГЭ/ЕГЭ на ноябрь',
    summary: 'Утверждён скорректированный регламент проведения пробных экзаменов по математике и информатике для 9-х классов.',
    content:
      'Уважаемые коллеги и учащиеся 9-х и 11-х классов!\n\nВ соответствии с распоряжением Министерства образования Новосибирской области и решением педагогического совета МАОУ ЛИТ:\n\n1. Пробный экзамен ОГЭ по математике переносится со среды 12 ноября на субботу 15 ноября (аудитории №311, 312, 214) с 09:00.\n2. Учителям-предметникам сдать списки распределения ассистентов в каб. 201 до 10 ноября включительно.\n3. Вход в аудитории строго по паспортам без электронных устройств согласно регламенту Федерального закона №618-ФЗ.\n\nПрошу классных руководителей 9А, 10Б и 11А классов довести информацию до родителей и подтвердить ознакомление кнопкой ниже.',
    category: 'orders',
    categoryLabel: 'Приказы & Регламенты',
    authorName: 'Зверева Елена Николаевна',
    authorRole: 'Завуч по учебно-воспитательной работе',
    authorAvatarBg: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
    date: 'Сегодня, 08:30',
    timestamp: Date.now() - 3600000 * 2,
    priority: 'urgent',
    isPinned: true,
    targetAudience: 'all',
    audienceLabel: 'Для всех (Учителя, 9–11 кл.)',
    viewsCount: 384,
    reactions: { like: 42, heart: 18, applause: 12, fire: 8 },
    userReactions: ['like'],
    attachments: [
      { name: 'Приказ_184_УВР_График_ОГЭ_2026.pdf', size: '384 КБ', type: 'pdf' },
      { name: 'Инструкция_для_ассистентов_ППЭ.pdf', size: '210 КБ', type: 'pdf' }
    ],
    requiresAcknowledge: true,
    acknowledgedBy: ['u-1', 'u-2', 'u-3', 'teacher-losiv'],
    tags: ['#Приказ_184', '#ОГЭ_2026', '#ВПР', '#ФГОС', '#УВР']
  },
  {
    id: 'news-2',
    title: 'Триумф команды «Девелопы» (МАОУ ЛИТ) на региональном хакатоне «Идея фикс»!',
    summary: 'Лицеисты 9А класса заняли 1-е место в треке «Продвинутая разработка» с цифровой экосистемой «Сферум.Кабинет».',
    content:
      'Гордость лицея! 🏆\n\nКоманда №23 «Девелопы» (учащиеся 9А класса МАОУ «Лицей Информационных Технологий» г. Новосибирска) одержала блестящую победу в финале регионального хакатона «Идея фикс» в номинации «Продвинутая разработка»!\n\nРебята разработали инновационную экосистему «Сферум.Кабинет», объединяющую умного ассистента учителя, прямого бота в мессенджере MAX (@ideya_fiks_23_bot), анти-ГДЗ банк заданий ФИПИ и моментальный предзаказ лицейского питания по карте «Кенгу.Детям».\n\nТоржественное награждение и вручение почётных дипломов состоится в пятницу на общелицейской линейке в актовом зале в 13:30. Поздравляем победителей и наставников!',
    category: 'events',
    categoryLabel: 'Достижения & События',
    authorName: 'Администрация МАОУ ЛИТ',
    authorRole: 'Пресс-служба лицея',
    authorAvatarBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    date: 'Вчера, 16:45',
    timestamp: Date.now() - 3600000 * 18,
    priority: 'pinned',
    isPinned: true,
    targetAudience: 'all',
    audienceLabel: 'Для всего лицея',
    viewsCount: 612,
    reactions: { like: 88, heart: 142, applause: 96, fire: 54 },
    userReactions: ['heart', 'applause'],
    attachments: [
      { name: 'Диплом_Победителей_Хакатон_ИдеяФикс.pdf', size: '1.2 МБ', type: 'pdf' }
    ],
    tags: ['#ИдеяФикс', '#Победа', '#МАОУ_ЛИТ', '#СферумКабинет', '#Хакатон2026']
  },
  {
    id: 'news-3',
    title: 'Регламент актированных дней при наступлении морозов ниже -25°C в Новосибирске',
    summary: 'Порядок организации учебного процесса и посещения занятий при экстремально низких температурах воздуха.',
    content:
      'Вниманию родителей, классных руководителей и учащихся 1–11 классов:\n\nВ связи с прогнозируемым понижением температуры воздуха по г. Новосибирску напоминаем температурные нормативы отмены занятий:\n• 1–4 классы: при температуре -25°C и ниже (с ветром от -24°C);\n• 5–9 классы: при температуре -30°C и ниже;\n• 10–11 классы: при температуре -35°C и ниже.\n\nДля учащихся, оставшихся дома по согласованию с родителями, учебные материалы и задания оперативно размещаются в электронном дневнике «Сферум.Кабинет». Лицей работает в штатном режиме, отопление и горячее питание предоставляются в полном объёме.',
    category: 'safety',
    categoryLabel: 'Безопасность & Режим',
    authorName: 'Колсанова Марина Владимировна',
    authorRole: 'Заместитель директора по безопасности',
    authorAvatarBg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    date: '05 ноя, 11:20',
    timestamp: Date.now() - 3600000 * 36,
    priority: 'important',
    isPinned: false,
    targetAudience: 'all',
    audienceLabel: 'Ученики, Родители, Учителя',
    viewsCount: 450,
    reactions: { like: 56, heart: 24, applause: 8, fire: 4 },
    tags: ['#Безопасность', '#Морозы', '#АктированныеДни', '#РежимРаботы']
  },
  {
    id: 'news-4',
    title: 'Всероссийская олимпиада школьников (ВсОШ): муниципальный этап по информатике и физике',
    summary: 'График проведения туров, списки допущенных участников и регистрация в тестирующей системе.',
    content:
      'Уважаемые лицеисты и учителя!\n\nОпубликованы списки участников муниципального этапа ВсОШ по информатике (14 ноября) и физике (18 ноября).\n\nВсем участникам необходимо:\n1. Проверить регистрационные данные в системе ВсОШ НСО до 11 ноября.\n2. Получить маршрутные листы и бланки согласий у своих учителей-предметников в каб. №311 (Лосив Р.Б.) и каб. №214.\n3. В день олимпиады прибыть на пункт проведения к 08:30 со второй обувью, паспортом и чёрными гелевыми ручками.\n\nЖелаем уверенности, точных алгоритмов и высоких баллов!',
    category: 'olympiads',
    categoryLabel: 'Олимпиады & Наука',
    authorName: 'Лосив Роман Борисович',
    authorRole: 'Руководитель кафедры информатики и ИКТ',
    authorAvatarBg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    date: '04 ноя, 14:10',
    timestamp: Date.now() - 3600000 * 60,
    priority: 'normal',
    isPinned: false,
    targetAudience: 'students',
    audienceLabel: 'Для 8–11 классов',
    viewsCount: 295,
    reactions: { like: 64, heart: 32, applause: 45, fire: 18 },
    attachments: [
      { name: 'Списки_участников_ВсОШ_МАОУ_ЛИТ_2026.pdf', size: '240 КБ', type: 'pdf' }
    ],
    tags: ['#ВсОШ', '#Информатика', '#Физика', '#Олимпиады', '#КафедраИКТ']
  },
  {
    id: 'news-5',
    title: 'Запущен предзаказ школьного питания по карте «Кенгу.Детям» к конкретной перемене',
    summary: 'Сервис предварительного заказа горячих обедов и фирменной выпечки ЛИТ к звонку без очередей.',
    content:
      'Рады сообщить, что в личном кабинете ученика и родителя заработал сервис моментального предзаказа блюд к любой из 6 школьных перемен!\n\nТеперь учащиеся могут выбрать удобную перемену (включая большую 4-ю перемену 12:15–12:45) и заказать горячий комплекс, пасту с цыплёнком, свежую булочку с маком или тёплый облепиховый морс. Повара сервируют заказ на Стол №4 к первой секунде перемены, либо выдадут за 15 секунд на стойке экспресс-выдачи по цифровому QR-талону.\n\nОплата списывается моментально с карты «Кенгу.Детям» без очередей у кассы.',
    category: 'canteen',
    categoryLabel: 'Питание & Кенгу.Детям',
    authorName: 'Служба питания «Кенгу.Детям»',
    authorRole: 'Комбинат школьного питания',
    authorAvatarBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    date: '03 ноя, 12:00',
    timestamp: Date.now() - 3600000 * 84,
    priority: 'normal',
    isPinned: false,
    targetAudience: 'all',
    audienceLabel: 'Для всего лицея',
    viewsCount: 520,
    reactions: { like: 92, heart: 78, applause: 36, fire: 42 },
    tags: ['#КенгуДетям', '#ШкольноеПитание', '#СтоловаяЛИТ', '#Предзаказ']
  }
];

export interface SchoolNewsFeedViewProps {
  user: User | null;
  theme?: AuthThemeMode;
  canPublish?: boolean;
  onNavigateToTab?: (tab: string) => void;
}

export const SchoolNewsFeedView: React.FC<SchoolNewsFeedViewProps> = ({
  user,
  theme = 'light',
  canPublish = false
}) => {
  const isLight = theme === 'light';
  const isContrast = theme === 'contrast';
  const toast = useToast();

  const isZavuchUser = canPublish || user?.role === 'zavuch' || user?.fullName?.toLowerCase().includes('зверев') || user?.fullName?.toLowerCase().includes('завуч');

  // Загрузка постов из localStorage или дефолтных
  const [posts, setPosts] = useState<NewsPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_NEWS_POSTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {}
  }, [posts]);

  // Состояния фильтрации и поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [onlyPinned, setOnlyPinned] = useState(false);

  // Состояние создания новой публикации (для завуча)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<NewsCategory>('orders');
  const [newPriority, setNewPriority] = useState<NewsPriority>('important');
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [newAudience, setNewAudience] = useState<NewsAudience>('all');
  const [newRequiresAcknowledge, setNewRequiresAcknowledge] = useState(true);
  const [newTagsInput, setNewTagsInput] = useState('#Приказ, #МАОУ_ЛИТ, #УВР');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // Цветовая система Apple Cupertino
  const colors = {
    cardBg: isContrast ? '#ffffff' : isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.04)',
    cardBorder: isContrast ? '1.5px solid #cbd5e1' : isLight ? 'rgba(0, 0, 0, 0.07)' : 'rgba(255, 255, 255, 0.08)',
    textPrimary: isContrast ? '#0a0f1d' : isLight ? '#0f172a' : '#f8fafc',
    textSecondary: isContrast ? '#1e293b' : isLight ? '#334155' : '#cbd5e1',
    textMuted: isContrast ? '#334155' : isLight ? '#64748b' : '#94a3b8',
    accentColor: '#007aff',
    accentSoft: isLight ? 'rgba(0, 122, 255, 0.08)' : 'rgba(0, 122, 255, 0.16)',
    slotBg: isContrast ? '#f8fafc' : isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)',
    emerald: '#10b981',
    emeraldSoft: isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.18)',
    amber: '#f59e0b',
    amberSoft: isLight ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.18)',
    rose: '#ef4444',
    roseSoft: isLight ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.18)'
  };

  // Реакция на публикацию
  const handleToggleReaction = (postId: string, reactionType: 'like' | 'heart' | 'applause' | 'fire') => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const userReactions = p.userReactions || [];
        const hasReacted = userReactions.includes(reactionType);
        const updatedReactions = hasReacted
          ? userReactions.filter((r) => r !== reactionType)
          : [...userReactions, reactionType];

        return {
          ...p,
          userReactions: updatedReactions,
          reactions: {
            ...p.reactions,
            [reactionType]: hasReacted
              ? Math.max(0, p.reactions[reactionType] - 1)
              : p.reactions[reactionType] + 1
          }
        };
      })
    );
  };

  // Подтверждение ознакомления с приказом
  const handleAcknowledge = (postId: string) => {
    const currentUserId = String(user?.id || 'current-user');
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const currentAcks = p.acknowledgedBy || [];
        if (currentAcks.includes(currentUserId)) {
          toast.info('Вы уже подтвердили ознакомление с данным документом', 'Статус сохранён');
          return p;
        }
        toast.success('Ваша отметка об ознакомлении с приказом зафиксирована в журнале УВР', 'Ознакомление подтверждено');
        return {
          ...p,
          acknowledgedBy: [...currentAcks, currentUserId]
        };
      })
    );
  };

  // Закрепление/открепление поста завучем
  const handleTogglePin = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextPinned = !p.isPinned;
        toast.info(nextPinned ? 'Публикация закреплена вверху ленты лицея' : 'Публикация откреплена', 'Статус обновлен');
        return { ...p, isPinned: nextPinned };
      })
    );
  };

  // Удаление поста завучем
  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    toast.success('Публикация удалена из ленты лицея', 'Удалено');
  };

  // Создание новой публикации завучем
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.warning('Заполните заголовок и текст публикации', 'Поля обязательны');
      return;
    }

    const categoryLabels: Record<NewsCategory, string> = {
      all: 'Общие новости',
      orders: 'Приказы & Регламенты',
      urgent: 'Срочные объявления',
      events: 'События & Мероприятия',
      olympiads: 'Олимпиады & Наука',
      canteen: 'Школьное питание',
      safety: 'Безопасность & Режим'
    };

    const audienceLabels: Record<NewsAudience, string> = {
      all: 'Для всего лицея',
      teachers: 'Только для учителей',
      students: 'Для учащихся 5–11 классов',
      parents: 'Для родителей и семей'
    };

    const tags = newTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const attachments = newAttachmentName.trim()
      ? [
          {
            name: newAttachmentName.trim().endsWith('.pdf') ? newAttachmentName.trim() : `${newAttachmentName.trim()}.pdf`,
            size: '340 КБ',
            type: 'pdf' as const
          }
        ]
      : [];

    const newPost: NewsPost = {
      id: `news-${Date.now()}`,
      title: newTitle.trim(),
      summary: newSummary.trim() || newContent.trim().slice(0, 120) + '...',
      content: newContent.trim(),
      category: newCategory,
      categoryLabel: categoryLabels[newCategory] || 'Объявление',
      authorName: user?.fullName || 'Зверева Елена Николаевна',
      authorRole: isZavuchUser ? 'Завуч по УВР • МАОУ ЛИТ' : 'Педагог МАОУ ЛИТ',
      authorAvatarBg: isZavuchUser
        ? 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)'
        : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      date: 'Сегодня, только что',
      timestamp: Date.now(),
      priority: newPriority,
      isPinned: newIsPinned,
      targetAudience: newAudience,
      audienceLabel: audienceLabels[newAudience] || 'Для всех',
      viewsCount: 1,
      reactions: { like: 0, heart: 0, applause: 0, fire: 0 },
      userReactions: [],
      attachments,
      requiresAcknowledge: newRequiresAcknowledge,
      acknowledgedBy: isZavuchUser ? [String(user?.id || 'current-user')] : [],
      tags: tags.length > 0 ? tags : ['#МАОУ_ЛИТ', '#Сферум']
    };

    setPosts((prev) => [newPost, ...prev]);
    setIsCreateModalOpen(false);

    // Сброс формы
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setNewAttachmentName('');
    setNewIsPinned(false);

    toast.success('Новость успешно опубликована в ленте лицея и доступна всем пользователям!', 'Опубликовано');
  };

  // Фильтрация новостей
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        if (onlyPinned && !post.isPinned) return false;
        if (selectedCategory !== 'all' && post.category !== selectedCategory) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q) ||
          post.authorName.toLowerCase().includes(q) ||
          post.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Сначала закрепленные, затем по новизне
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.timestamp - a.timestamp;
      });
  }, [posts, selectedCategory, onlyPinned, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. ШАПКА ЛЕНТЫ В СТИЛЕ APPLE HIG С ПАНЕЛЬЮ ПОИСКА И КНОПКОЙ ПУБЛИКАЦИИ
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 22,
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.04)' : '0 4px 24px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0, 122, 255, 0.35)'
              }}
            >
              <Megaphone size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: colors.textPrimary, letterSpacing: -0.4 }}>
                Лента новостей
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textMuted }}>
                Официальные объявления, приказы и события лицея
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Кнопка публикации */}
            {isZavuchUser && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(0, 122, 255, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Plus size={16} />
                <span>+ Новая публикация</span>
              </button>
            )}
          </div>
        </div>

        {/* Строка поиска и фильтр закрепленных */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Поле поиска */}
          <div
            style={{
              flex: '1 1 260px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 14px',
              borderRadius: 12,
              background: colors.slotBg,
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <Search size={16} color={colors.textMuted} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по приказам, темам, олимпиадам или фамилии автора..."
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                color: colors.textPrimary
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Фильтр «Только закрепленные» */}
          <button
            type="button"
            onClick={() => setOnlyPinned(!onlyPinned)}
            style={{
              padding: '9px 14px',
              borderRadius: 12,
              border: onlyPinned ? '1.5px solid #007aff' : `1px solid ${colors.cardBorder}`,
              background: onlyPinned ? colors.accentSoft : colors.slotBg,
              color: onlyPinned ? colors.accentColor : colors.textMuted,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Pin size={14} />
            <span>Закрепленные</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. СПИСОК ПУБЛИКАЦИЙ В СТИЛЕ APPLE HIG (FEED CARDS)
      ───────────────────────────────────────────────────────────────────────────── */}
      {filteredPosts.length === 0 ? (
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 20,
            padding: 48,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 18, background: colors.slotBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
            <Search size={26} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: colors.textPrimary }}>
            Публикаций по выбранным критериям не найдено
          </div>
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            Попробуйте изменить поисковый запрос или переключить категорию
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyPinned(false);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: `1px solid ${colors.cardBorder}`,
              background: colors.slotBg,
              color: colors.accentColor,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredPosts.map((post) => {
            const currentUserId = String(user?.id || 'current-user');
            const isAcknowledged = (post.acknowledgedBy || []).includes(currentUserId);
            const acksCount = (post.acknowledgedBy || []).length;

            return (
              <article
                key={post.id}
                style={{
                  background: colors.cardBg,
                  border: post.isPinned
                    ? `1.5px solid ${colors.accentColor}`
                    : `1px solid ${colors.cardBorder}`,
                  borderRadius: 22,
                  padding: 24,
                  boxShadow: isLight
                    ? post.isPinned
                      ? '0 6px 24px rgba(0, 122, 255, 0.12)'
                      : '0 4px 18px rgba(0, 0, 0, 0.03)'
                    : '0 4px 24px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  position: 'relative'
                }}
              >
                {/* Верхняя плашка: Закреплено + Категория + Дата */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {post.isPinned && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#007aff',
                          background: colors.accentSoft,
                          padding: '3px 8px',
                          borderRadius: 6
                        }}
                      >
                        <Pin size={11} />
                        Закреплено
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: colors.textMuted,
                        background: colors.slotBg,
                        padding: '3px 8px',
                        borderRadius: 6
                      }}
                    >
                      {post.categoryLabel}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: colors.textMuted }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} />
                      {post.date}
                    </span>

                    {/* Действия завуча (Закрепить / Удалить) */}
                    {isZavuchUser && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePin(post.id)}
                          title={post.isPinned ? 'Открепить' : 'Закрепить вверху'}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: post.isPinned ? colors.accentColor : colors.textMuted,
                            cursor: 'pointer',
                            padding: 4
                          }}
                        >
                          <Pin size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          title="Удалить новость"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: 4
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Автор публикации */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: post.authorAvatarBg || 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 15,
                      flexShrink: 0
                    }}
                  >
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: colors.textPrimary }}>
                      {post.authorName}
                    </div>
                    <div style={{ fontSize: 11.5, color: colors.textMuted }}>
                      {post.authorRole}
                    </div>
                  </div>
                </div>

                {/* Заголовок и содержание */}
                <div>
                  <h2 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 900, color: colors.textPrimary, lineHeight: 1.35, letterSpacing: -0.2 }}>
                    {post.title}
                  </h2>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: colors.textSecondary,
                      lineHeight: 1.65,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {post.content}
                  </div>
                </div>

                {/* Прикрепленные документы (PDF / Приказы) */}
                {post.attachments && post.attachments.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                      Официальные приложения к публикации:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                      {post.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 12,
                            background: colors.slotBg,
                            border: `1px solid ${colors.cardBorder}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                            <FileText size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {att.name}
                              </div>
                              <div style={{ fontSize: 10.5, color: colors.textMuted }}>
                                Документ PDF • {att.size}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toast.success(`Документ "${att.name}" открыт для просмотра`, 'Файл загружен')}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 8,
                              border: `1px solid ${colors.cardBorder}`,
                              background: colors.cardBg,
                              color: colors.accentColor,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              flexShrink: 0
                            }}
                          >
                            <Download size={12} />
                            <span>Скачать</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Хештеги */}
                {post.tags && post.tags.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        onClick={() => setSearchQuery(tag.replace('#', ''))}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: colors.accentColor,
                          background: colors.accentSoft,
                          padding: '2px 8px',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Блок обязательного ознакомления с приказом для учителей */}
                {post.requiresAcknowledge && (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      background: isAcknowledged ? colors.emeraldSoft : colors.slotBg,
                      border: isAcknowledged ? '1px solid #10b981' : `1px solid ${colors.cardBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle2 size={18} color={isAcknowledged ? '#10b981' : colors.textMuted} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: isAcknowledged ? '#10b981' : colors.textPrimary }}>
                          {isAcknowledged ? 'Вы подтвердили ознакомление с приказом' : 'Требуется подтверждение ознакомления'}
                        </div>
                        <div style={{ fontSize: 11.5, color: colors.textMuted }}>
                          Ознакомлены: <strong style={{ color: colors.textPrimary }}>{acksCount} сотрудников</strong> лицея
                        </div>
                      </div>
                    </div>

                    {!isAcknowledged && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(post.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          border: 'none',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Check size={14} />
                        <span>Подтвердить ознакомление</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Нижняя панель реакций в стиле Apple / Telegram */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: `1px solid ${colors.cardBorder}`,
                    flexWrap: 'wrap',
                    gap: 10
                  }}
                >
                  {/* Кнопки реакций */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { type: 'like' as const, emoji: '👍', count: post.reactions.like },
                      { type: 'heart' as const, emoji: '❤️', count: post.reactions.heart },
                      { type: 'applause' as const, emoji: '👏', count: post.reactions.applause },
                      { type: 'fire' as const, emoji: '🔥', count: post.reactions.fire }
                    ].map((r) => {
                      const active = (post.userReactions || []).includes(r.type);
                      return (
                        <button
                          key={r.type}
                          type="button"
                          onClick={() => handleToggleReaction(post.id, r.type)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 10,
                            border: active ? '1.5px solid #007aff' : `1px solid ${colors.cardBorder}`,
                            background: active ? colors.accentSoft : colors.slotBg,
                            color: active ? colors.accentColor : colors.textPrimary,
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: 13 }}>{r.emoji}</span>
                          <span>{r.count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Просмотры и шеринг */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: colors.textMuted }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={14} />
                      {post.viewsCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(`${window.location.origin}?tab=news#${post.id}`);
                        }
                        toast.success('Ссылка на новость скопирована в буфер обмена', 'Поделиться');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: colors.textMuted,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Share2 size={14} />
                      <span>Ссылка</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ПУБЛИКАЦИИ ЗАВУЧЕМ (APPLE FORM)
      ───────────────────────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 24,
              maxWidth: 680,
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 24,
              boxShadow: '0 25px 65px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18
            }}
          >
            {/* Заголовок модалки */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: `1px solid ${colors.cardBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Megaphone size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: colors.textPrimary }}>
                    Новая публикация в ленту лицея
                  </div>
                  <div style={{ fontSize: 11.5, color: colors.textMuted }}>
                    Автор: {user?.fullName || 'Администрация лицея'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: `1px solid ${colors.cardBorder}`,
                  background: colors.slotBg,
                  color: colors.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Заголовок */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Заголовок объявления / приказа *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Например: Приказ №185: Расписание консультаций перед ОГЭ..."
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 12,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 13.5,
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Категория, Приоритет и Целевая аудитория */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Категория:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: `1px solid ${colors.cardBorder}`,
                      background: colors.slotBg,
                      color: colors.textPrimary,
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="orders">📜 Приказы & Регламенты</option>
                    <option value="urgent">⚠️ Срочное объявление</option>
                    <option value="events">🏆 События & Достижения</option>
                    <option value="olympiads">🔬 Олимпиады & Наука</option>
                    <option value="safety">❄️ Безопасность & Режим</option>
                    <option value="canteen">🥐 Питание & Столовая</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Приоритет оформления:
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: `1px solid ${colors.cardBorder}`,
                      background: colors.slotBg,
                      color: colors.textPrimary,
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="important">Важный (Синий акцент)</option>
                    <option value="urgent">Срочный (Красный акцент)</option>
                    <option value="normal">Обычный (Информационный)</option>
                    <option value="pinned">Закрепить вверху ленты</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Целевая аудитория:
                  </label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: `1px solid ${colors.cardBorder}`,
                      background: colors.slotBg,
                      color: colors.textPrimary,
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="all">Для всего лицея</option>
                    <option value="teachers">Только для учителей</option>
                    <option value="students">Для учащихся (5–11 классы)</option>
                    <option value="parents">Для родителей</option>
                  </select>
                </div>
              </div>

              {/* Текст публикации */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>
                    Текст новости / распоряжения *
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setNewTitle('Распоряжение по итогам учебной недели (МАОУ ЛИТ)');
                        setNewContent('Уважаемые коллеги!\n\n1. Прошу учителей-предметников закрыть все текущие двойки и пропуски в электронном журнале до 18:00 пятницы.\n2. Классным руководителям провести классные часы по теме безопасного поведения на водоемах в зимний период.\n3. Справки от родителей передавать в каб. 311 Лосиву Р.Б.');
                        setNewCategory('orders');
                      }}
                      style={{ fontSize: 11, color: colors.accentColor, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + Шаблон приказа
                    </button>
                  </div>
                </div>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Введите подробный текст объявления, регламент или пункты приказа..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textPrimary,
                    fontSize: 13,
                    lineHeight: 1.5,
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Прикрепление документа и тегов */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Название PDF-приложения:
                  </label>
                  <input
                    type="text"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    placeholder="Например: Приказ_185_УВР.pdf"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: `1px solid ${colors.cardBorder}`,
                      background: colors.slotBg,
                      color: colors.textPrimary,
                      fontSize: 12.5,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Хештеги (через запятую):
                  </label>
                  <input
                    type="text"
                    value={newTagsInput}
                    onChange={(e) => setNewTagsInput(e.target.value)}
                    placeholder="#Приказ, #ВПР, #УВР"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: `1px solid ${colors.cardBorder}`,
                      background: colors.slotBg,
                      color: colors.textPrimary,
                      fontSize: 12.5,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Чекбоксы: Закрепить вверху + Требовать ознакомление */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 12, background: colors.slotBg, border: `1px solid ${colors.cardBorder}` }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: colors.textPrimary }}>
                  <input
                    type="checkbox"
                    checked={newIsPinned}
                    onChange={(e) => setNewIsPinned(e.target.checked)}
                    style={{ accentColor: '#007aff' }}
                  />
                  <span>📌 <strong>Закрепить вверху ленты</strong> (важное объявление)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: colors.textPrimary }}>
                  <input
                    type="checkbox"
                    checked={newRequiresAcknowledge}
                    onChange={(e) => setNewRequiresAcknowledge(e.target.checked)}
                    style={{ accentColor: '#007aff' }}
                  />
                  <span>✅ <strong>Требовать подтверждение ознакомления</strong> от учителей</span>
                </label>
              </div>

              {/* Кнопка отправки */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(0, 122, 255, 0.35)',
                  marginTop: 6
                }}
              >
                <Send size={18} />
                <span>Опубликовать в ленту лицея</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
