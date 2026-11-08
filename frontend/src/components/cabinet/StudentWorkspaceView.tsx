import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Award,
  Trophy,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Utensils,
  FileText,
  Calculator,
  UploadCloud,
  Send,
  Paperclip,
  Wallet,
  QrCode,
  RotateCcw,
  X,
  Loader2,
  Clock,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Megaphone
} from 'lucide-react';
import type { User, AuthThemeMode } from '../../types/auth';
import { useToast } from '../common/ToastContext';
import { SchoolNewsFeedView } from './SchoolNewsFeedView';

export interface BreakSlot {
  id: string;
  name: string;
  time: string;
  duration: string;
  type: string;
  isMajor?: boolean;
}

export interface FoodMenuItem {
  id: string;
  category: 'hot' | 'bakery' | 'salads' | 'drinks' | 'healthy';
  title: string;
  description: string;
  price: number;
  weight: string;
  calories: string;
  badge?: string;
  icon: string;
}

export interface ActiveFoodOrder {
  id: string;
  orderNumber: string;
  breakName: string;
  time: string;
  pickupMethod: 'table' | 'express';
  tableNumber: string;
  items: Array<{ title: string; count: number; price: number }>;
  totalAmount: number;
  status: 'kitchen' | 'ready' | 'served';
  statusLabel: string;
  orderTime: string;
  qrCodeToken: string;
  comment?: string;
}

export const BREAK_SLOTS: BreakSlot[] = [
  { id: 'break-1', name: '1-я перемена', time: '09:15 – 09:30', duration: '15 мин', type: 'Завтрак / Перекус' },
  { id: 'break-2', name: '2-я перемена', time: '10:15 – 10:35', duration: '20 мин', type: 'Горячий завтрак' },
  { id: 'break-3', name: '3-я перемена', time: '11:20 – 11:35', duration: '15 мин', type: 'Ланч & Выпечка' },
  { id: 'break-4', name: '4-я перемена', time: '12:15 – 12:45', duration: '30 мин', isMajor: true, type: 'Большая перемена • Обед' },
  { id: 'break-5', name: '5-я перемена', time: '13:30 – 13:45', duration: '15 мин', type: 'Полдник & Чай' },
  { id: 'break-6', name: '6-я перемена', time: '14:30 – 14:45', duration: '15 мин', type: 'Послеурочный перекус' }
];

export const CANTEEN_MENU: FoodMenuItem[] = [
  // Горячее & Комплексы
  {
    id: 'food-1',
    category: 'hot',
    title: 'Комплексный обед «Лицеист»',
    description: 'Суп куриный с домашней вермишелью, котлета по-киевски с картофельным пюре, свежий огурец, хлеб',
    price: 185,
    weight: '450 г',
    calories: '680 ккал',
    badge: 'Хит столовой ЛИТ',
    icon: '🍲'
  },
  {
    id: 'food-2',
    category: 'hot',
    title: 'Паста с нежным цыплёнком',
    description: 'Паста пенне в сливочно-сырном соусе с филе цыплёнка и прованскими травами',
    price: 160,
    weight: '260 г',
    calories: '510 ккал',
    badge: 'Выбор учеников',
    icon: '🍝'
  },
  {
    id: 'food-3',
    category: 'hot',
    title: 'Пельмени домашние «Сибирские»',
    description: 'Из отборной говядины и индейки со сливочным маслом, зеленью и сметаной',
    price: 150,
    weight: '230 г',
    calories: '490 ккал',
    icon: '🥟'
  },
  {
    id: 'food-4',
    category: 'hot',
    title: 'Гречневая каша с тефтелями',
    description: 'Рассыпчатая гречка алтайская с мясными тефтелями в густом томатно-овощном соусе',
    price: 135,
    weight: '280 г',
    calories: '430 ккал',
    icon: '🍛'
  },
  {
    id: 'food-5',
    category: 'hot',
    title: 'Творожная запеканка с ягодами',
    description: 'Фермерский творог 5%, сгущённое молоко или ягодный джем на выбор',
    price: 110,
    weight: '190 г',
    calories: '340 ккал',
    icon: '🥮'
  },

  // Выпечка ЛИТ
  {
    id: 'food-6',
    category: 'bakery',
    title: 'Сосиска в слоёном тесте',
    description: 'С сосиской высшего сорта в хрустящем золотистом тесте с кунжутной посыпкой',
    price: 65,
    weight: '90 г',
    calories: '290 ккал',
    badge: 'С пылу с жару',
    icon: '🌭'
  },
  {
    id: 'food-7',
    category: 'bakery',
    title: 'Булочка с маком и глазурью',
    description: 'Пышное сдобное тесто с щедрой маковой начинкой и карамельной помадкой',
    price: 45,
    weight: '80 г',
    calories: '240 ккал',
    badge: 'Фирменная ЛИТ',
    icon: '🥐'
  },
  {
    id: 'food-8',
    category: 'bakery',
    title: 'Мини-пицца школьная',
    description: 'Томатный соус, сыр моцарелла, ветчина индейки, сладкий перец и орегано',
    price: 75,
    weight: '110 г',
    calories: '310 ккал',
    badge: 'Топ 1',
    icon: '🍕'
  },
  {
    id: 'food-9',
    category: 'bakery',
    title: 'Слойка с сочным яблоком и корицей',
    description: 'Ароматная начинка из сибирских яблок с корицей в лёгком слоёном тесте',
    price: 50,
    weight: '85 г',
    calories: '220 ккал',
    icon: '🥟'
  },
  {
    id: 'food-10',
    category: 'bakery',
    title: 'Сырники нежные (2 шт)',
    description: 'Запечённые в пароконвектомате с порционной деревенской сметаной',
    price: 80,
    weight: '140 г',
    calories: '270 ккал',
    icon: '🥞'
  },

  // Салаты
  {
    id: 'food-11',
    category: 'salads',
    title: 'Салат «Витаминный»',
    description: 'Свежая капуста, хрустящая морковь, сладкое яблоко, заправка оливковым маслом',
    price: 45,
    weight: '100 г',
    calories: '95 ккал',
    badge: 'ФГОС ЗОЖ',
    icon: '🥗'
  },
  {
    id: 'food-12',
    category: 'salads',
    title: 'Салат «Оливье» с цыплёнком',
    description: 'Классический лёгкий рецепт со свежим огурцом и нежным куриным филе',
    price: 70,
    weight: '120 г',
    calories: '180 ккал',
    icon: '🥣'
  },
  {
    id: 'food-13',
    category: 'salads',
    title: 'Овощная нарезка хрустящая',
    description: 'Свежие фермерские огурцы, сладкий болгарский перец и сладкие томаты черри',
    price: 55,
    weight: '110 г',
    calories: '50 ккал',
    icon: '🥒'
  },

  // Напитки
  {
    id: 'food-14',
    category: 'drinks',
    title: 'Облепиховый морс (тёплый)',
    description: 'Сварен из натуральной сибирской облепихи с мёдом и имбирём',
    price: 35,
    weight: '250 мл',
    calories: '75 ккал',
    badge: 'Иммунитет',
    icon: '🧃'
  },
  {
    id: 'food-15',
    category: 'drinks',
    title: 'Какао на фермерском молоке',
    description: 'Настоящее какао «Золотой ярлык» с мягкой пенкой и шоколадным ароматом',
    price: 45,
    weight: '250 мл',
    calories: '140 ккал',
    icon: '☕'
  },
  {
    id: 'food-16',
    category: 'drinks',
    title: 'Чай с лимоном и мятой',
    description: 'Свежезаваренный краснодарский чёрный чай с долькой лимона',
    price: 25,
    weight: '250 мл',
    calories: '35 ккал',
    icon: '🍵'
  },
  {
    id: 'food-17',
    category: 'drinks',
    title: 'Сок яблочный прямого отжима',
    description: '100% сок без добавления сахара и консервантов',
    price: 40,
    weight: '200 мл',
    calories: '85 ккал',
    icon: '🧃'
  },

  // Здоровые снеки
  {
    id: 'food-18',
    category: 'healthy',
    title: 'Фруктовый стаканчик ассорти',
    description: 'Ломтики сладкого яблока, спелого банана, киви и белого винограда',
    price: 65,
    weight: '150 г',
    calories: '110 ккал',
    badge: 'Энергия',
    icon: '🍎'
  },
  {
    id: 'food-19',
    category: 'healthy',
    title: 'Йогурт термостатный 2.5%',
    description: 'Натуральный кисломолочный йогурт с бифидобактериями',
    price: 55,
    weight: '150 г',
    calories: '120 ккал',
    icon: '🥛'
  },
  {
    id: 'food-20',
    category: 'healthy',
    title: 'Злаковый батончик с клюквой',
    description: 'Овсяные хлопья, мёд, кедровые орешки и вяленая брусника',
    price: 40,
    weight: '45 г',
    calories: '150 ккал',
    icon: '🍫'
  }
];

interface StudentWorkspaceViewProps {
  user: User | null;
  theme?: AuthThemeMode;
  activeTab?: string;
  initialTab?: 'overview' | 'news' | 'grades' | 'schedule' | 'homework' | 'messages' | 'services' | 'portfolio' | string;
  onNavigateToTab?: (tab: string) => void;
}

interface SubjectGradeRecord {
  id: string;
  name: string;
  teacher: string;
  classroom: string;
  grades: { val: number; weight: number; date: string; type: string }[];
  avg: number;
  forecast: number;
  category: 'exact' | 'humanitarian' | 'natural' | 'general';
}

interface HomeworkSubmission {
  submittedAt: string;
  comment: string;
  files: string[];
}

interface HomeworkItem {
  id: string;
  subject: string;
  teacher: string;
  classroom: string;
  dueDate: string;
  dueDayLabel: string;
  title: string;
  description: string;
  isCompleted: boolean;
  hasAttachment: boolean;
  submittedOnline: boolean;
  submission?: HomeworkSubmission;
}

interface TeacherContact {
  id: string;
  name: string;
  role: string;
  subject: string;
  classroom: string;
  online: boolean;
  avatarLetter: string;
  avatarColor: string;
}

interface ChatMessage {
  id: string;
  teacherId: string;
  sender: 'student' | 'teacher';
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  attachmentName?: string;
}

const TEACHER_CONTACTS: TeacherContact[] = [
  {
    id: 'losiv',
    name: 'Лосив Роман Борисович',
    role: 'Классный руководитель 9А',
    subject: 'Информатика и ИКТ',
    classroom: 'Каб. 311',
    online: true,
    avatarLetter: 'Л',
    avatarColor: '#007aff'
  },
  {
    id: 'smirnova',
    name: 'Смирнова Елена Васильевна',
    role: 'Учитель высшей категории',
    subject: 'Русский язык и литература',
    classroom: 'Каб. 108',
    online: true,
    avatarLetter: 'С',
    avatarColor: '#8b5cf6'
  },
  {
    id: 'kuznetsov',
    name: 'Кузнецов Андрей Павлович',
    role: 'Руководитель олимпиадного кружка',
    subject: 'Физика',
    classroom: 'Каб. 204',
    online: false,
    avatarLetter: 'К',
    avatarColor: '#f59e0b'
  },
  {
    id: 'morozova',
    name: 'Морозова Ольга Игоревна',
    role: 'Учитель математики',
    subject: 'Алгебра и геометрия',
    classroom: 'Каб. 211',
    online: true,
    avatarLetter: 'М',
    avatarColor: '#10b981'
  },
  {
    id: 'gromova',
    name: 'Громова Анна Сергеевна',
    role: 'Заместитель директора по УВР',
    subject: 'Учебная часть / ВсОШ',
    classroom: 'Каб. 201',
    online: true,
    avatarLetter: 'Г',
    avatarColor: '#ec4899'
  }
];

const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  losiv: [
    {
      id: 'm-1',
      teacherId: 'losiv',
      sender: 'teacher',
      text: 'Иван, привет! Напоминаю, что к завтрашнему уроку нужно дописать модуль проверки графов на Python. Практическая работа №4 будет на оценку.',
      time: '14:20',
      status: 'read'
    },
    {
      id: 'm-2',
      teacherId: 'losiv',
      sender: 'student',
      text: 'Здравствуйте, Роман Борисович! Да, я уже прикрепил и отправил решение. Посмотрите, пожалуйста, алгоритм поиска кратчайшего пути.',
      time: '15:05',
      status: 'read'
    },
    {
      id: 'm-3',
      teacherId: 'losiv',
      sender: 'teacher',
      text: 'Отлично, посмотрел. Код написан аккуратно, асимптотика O(V+E) соблюдена. Завтра поставлю 5 в электронный журнал!',
      time: '15:18',
      status: 'read'
    }
  ],
  smirnova: [
    {
      id: 'm-4',
      teacherId: 'smirnova',
      sender: 'student',
      text: 'Елена Васильевна, здравствуйте! Отправил сочинение по "Герою нашего времени" на проверку через систему.',
      time: 'Вчера 18:30',
      status: 'read'
    },
    {
      id: 'm-5',
      teacherId: 'smirnova',
      sender: 'teacher',
      text: 'Здравствуй, Ваня. Сочинение прочитала, аргументация сильная! Обрати внимание на обособление деепричастных оборотов во втором абзаце.',
      time: 'Вчера 19:45',
      status: 'read'
    }
  ],
  kuznetsov: [
    {
      id: 'm-6',
      teacherId: 'kuznetsov',
      sender: 'teacher',
      text: 'Иван, по результатам школьного тура ВсОШ ты проходишь на муниципальный этап! В четверг в 15:30 собираемся в 204 каб. на разбор олимпиадных задач по механике.',
      time: '04 ноя 16:10',
      status: 'read'
    }
  ],
  morozova: [
    {
      id: 'm-7',
      teacherId: 'morozova',
      sender: 'student',
      text: 'Ольга Игоревна, здравствуйте! В номере 415 во втором уравнении получился отрицательный дискриминант. Так и задумано?',
      time: '03 ноя 17:00',
      status: 'read'
    },
    {
      id: 'm-8',
      teacherId: 'morozova',
      sender: 'teacher',
      text: 'Да, в пункте "б" действительных корней нет. Молодец, что заметил и не растерялся!',
      time: '03 ноя 17:22',
      status: 'read'
    }
  ],
  gromova: [
    {
      id: 'm-9',
      teacherId: 'gromova',
      sender: 'teacher',
      text: 'Иван, приказом директора №142 от 03.11 ты включен в состав сборной лицея на региональный IT-хакатон. Готовь команду!',
      time: '03 ноя 11:30',
      status: 'read'
    }
  ]
};

const INITIAL_SUBJECTS: SubjectGradeRecord[] = [
  {
    id: 'algebra',
    name: 'Алгебра',
    teacher: 'Лосив Р.Б.',
    classroom: '311',
    category: 'exact',
    grades: [
      { val: 5, weight: 2, date: '10 фев', type: 'Контрольная работа №4' },
      { val: 5, weight: 1, date: '06 фев', type: 'Самостоятельная работа' },
      { val: 4, weight: 1, date: '04 фев', type: 'Ответ у доски' },
      { val: 5, weight: 1.5, date: '29 янв', type: 'Тестирование' },
      { val: 5, weight: 1, date: '24 янв', type: 'Домашнее задание' }
    ],
    avg: 4.83,
    forecast: 5
  },
  {
    id: 'geometry',
    name: 'Геометрия',
    teacher: 'Лосив Р.Б.',
    classroom: '311',
    category: 'exact',
    grades: [
      { val: 5, weight: 1.5, date: '07 фев', type: 'Теорема Пифагора (практикум)' },
      { val: 5, weight: 1, date: '03 фев', type: 'Решение задач' },
      { val: 4, weight: 1, date: '28 янв', type: 'Устный опрос' },
      { val: 5, weight: 2, date: '21 янв', type: 'Контрольная работа' }
    ],
    avg: 4.78,
    forecast: 5
  },
  {
    id: 'informatics',
    name: 'Информатика и ИКТ',
    teacher: 'Лосив Р.Б.',
    classroom: '311',
    category: 'exact',
    grades: [
      { val: 5, weight: 2, date: '09 фев', type: 'Проект Python / Алгоритмы' },
      { val: 5, weight: 1, date: '05 фев', type: 'Лабораторная работа' },
      { val: 5, weight: 1, date: '30 янв', type: 'Практикум на ПК' },
      { val: 5, weight: 1.5, date: '23 янв', type: 'Проверочный тест' }
    ],
    avg: 5.0,
    forecast: 5
  },
  {
    id: 'physics',
    name: 'Физика',
    teacher: 'Смирнов В.А.',
    classroom: '204',
    category: 'natural',
    grades: [
      { val: 4, weight: 2, date: '08 фев', type: 'Лабораторная работа №3' },
      { val: 5, weight: 1, date: '02 фев', type: 'Закон Ома' },
      { val: 4, weight: 1, date: '27 янв', type: 'Физический диктант' },
      { val: 5, weight: 1.5, date: '20 янв', type: 'Контрольная работа' }
    ],
    avg: 4.45,
    forecast: 4
  },
  {
    id: 'russian',
    name: 'Русский язык',
    teacher: 'Васильева Е.Н.',
    classroom: '108',
    category: 'humanitarian',
    grades: [
      { val: 5, weight: 1, date: '10 фев', type: 'Словарный диктант' },
      { val: 4, weight: 1.5, date: '05 фев', type: 'Синтаксический разбор' },
      { val: 5, weight: 2, date: '29 янв', type: 'Контрольный диктант' },
      { val: 4, weight: 1, date: '22 янв', type: 'Упражнение' }
    ],
    avg: 4.47,
    forecast: 4
  },
  {
    id: 'literature',
    name: 'Литература',
    teacher: 'Васильева Е.Н.',
    classroom: '108',
    category: 'humanitarian',
    grades: [
      { val: 5, weight: 2, date: '06 фев', type: 'Сочинение по М.Ю. Лермонтову' },
      { val: 5, weight: 1, date: '31 янв', type: 'Чтение наизусть' },
      { val: 5, weight: 1, date: '24 янв', type: 'Анализ эпизода' }
    ],
    avg: 5.0,
    forecast: 5
  },
  {
    id: 'english',
    name: 'Английский язык',
    teacher: 'Белова Т.С.',
    classroom: '315',
    category: 'humanitarian',
    grades: [
      { val: 5, weight: 1.5, date: '10 фев', type: 'Лексический тест Unit 5' },
      { val: 5, weight: 1, date: '04 фев', type: 'Монологическая речь' },
      { val: 4, weight: 1, date: '27 янв', type: 'Аудирование' },
      { val: 5, weight: 2, date: '19 янв', type: 'Модульная контрольная' }
    ],
    avg: 4.81,
    forecast: 5
  },
  {
    id: 'history',
    name: 'История России',
    teacher: 'Федоров Д.М.',
    classroom: '212',
    category: 'humanitarian',
    grades: [
      { val: 4, weight: 1.5, date: '07 фев', type: 'Тест: Эпоха Александра II' },
      { val: 5, weight: 1, date: '30 янв', type: 'Работа с картой' },
      { val: 4, weight: 1, date: '23 янв', type: 'Семинар' }
    ],
    avg: 4.29,
    forecast: 4
  },
  {
    id: 'biology',
    name: 'Биология',
    teacher: 'Григорьева Н.С.',
    classroom: '205',
    category: 'natural',
    grades: [
      { val: 5, weight: 1, date: '08 фев', type: 'Строение клетки (микроскоп)' },
      { val: 5, weight: 1.5, date: '01 фев', type: 'Проверочный тест' },
      { val: 5, weight: 1, date: '25 янв', type: 'Ответ у доски' }
    ],
    avg: 5.0,
    forecast: 5
  },
  {
    id: 'chemistry',
    name: 'Химия',
    teacher: 'Миронова К.В.',
    classroom: '304',
    category: 'natural',
    grades: [
      { val: 4, weight: 2, date: '05 фев', type: 'Лабораторный опыт: Окисление' },
      { val: 4, weight: 1, date: '29 янв', type: 'Уравнения реакций' },
      { val: 5, weight: 1, date: '22 янв', type: 'Таблица Менделеева' }
    ],
    avg: 4.25,
    forecast: 4
  },
  {
    id: 'pe',
    name: 'Физическая культура',
    teacher: 'Ковалев С.И.',
    classroom: 'Спортзал',
    category: 'general',
    grades: [
      { val: 5, weight: 1, date: '09 фев', type: 'Сдача норматива (прыжок)' },
      { val: 5, weight: 1, date: '02 фев', type: 'Волейбол (подача)' },
      { val: 5, weight: 1, date: '26 янв', type: 'Норматив ГТО' }
    ],
    avg: 5.0,
    forecast: 5
  }
];

const INITIAL_HOMEWORK: HomeworkItem[] = [
  {
    id: 'hw-1',
    subject: 'Алгебра',
    teacher: 'Лосив Р.Б.',
    classroom: 'Каб. 311',
    dueDate: 'Завтра, 12 фев (к 08:30)',
    dueDayLabel: 'Завтра',
    title: '№ 412 (а, в), № 415 из учебника Макарычева',
    description: 'Решить системы квадратных уравнений способом подстановки. Прикрепить фото тетради или чистовое решение.',
    isCompleted: false,
    hasAttachment: false,
    submittedOnline: false
  },
  {
    id: 'hw-2',
    subject: 'Физика',
    teacher: 'Смирнов В.А.',
    classroom: 'Каб. 204',
    dueDate: 'Пятница, 13 фев',
    dueDayLabel: 'Через 2 дня',
    title: 'Подготовка к лаб. работе №4 «Закон Ома для участка цепи»',
    description: 'Повторить параграфы 42–43, перечертить таблицу измерений в тетрадь для практических работ, подготовить формулы расчета.',
    isCompleted: false,
    hasAttachment: true,
    submittedOnline: false
  },
  {
    id: 'hw-3',
    subject: 'Информатика и ИКТ',
    teacher: 'Лосив Р.Б.',
    classroom: 'Каб. 311',
    dueDate: 'Понедельник, 16 фев',
    dueDayLabel: 'На след. неделе',
    title: 'Практическая задача на Python (ОГЭ, задание 15.2)',
    description: 'Написать программу поиска минимального кратного 4 числа в последовательности. Файл .py отправить в систему.',
    isCompleted: true,
    hasAttachment: true,
    submittedOnline: true,
    submission: {
      submittedAt: '10 фев в 19:42',
      comment: 'Код написан на Python 3.12, протестирован на 5 тест-кейсах ФИПИ. Время работы O(N).',
      files: ['solution_15_2.py (2.4 КБ)', 'tests_results.png (1.1 МБ)']
    }
  },
  {
    id: 'hw-4',
    subject: 'Русский язык',
    teacher: 'Васильева Е.Н.',
    classroom: 'Каб. 108',
    dueDate: 'Завтра, 12 фев',
    dueDayLabel: 'Завтра',
    title: 'Упражнение 194 (1–4 предложения)',
    description: 'Сложноподчиненные предложения с придаточными времени. Выделить грамматические основы, составить схемы.',
    isCompleted: true,
    hasAttachment: false,
    submittedOnline: false
  }
];

export const StudentWorkspaceView: React.FC<StudentWorkspaceViewProps> = ({
  user,
  theme = 'light',
  activeTab: propActiveTab,
  initialTab = 'overview',
  onNavigateToTab
}) => {
  const toast = useToast();
  const isLight = theme === 'light' || theme === 'contrast';
  const isContrast = theme === 'contrast';

  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'grades' | 'schedule' | 'homework' | 'messages' | 'services' | 'portfolio'>((propActiveTab as any) || initialTab);

  React.useEffect(() => {
    const current = (propActiveTab || initialTab) as any;
    if (current && ['overview', 'news', 'grades', 'schedule', 'homework', 'messages', 'services', 'portfolio'].includes(current)) {
      setActiveTab(current);
    }
  }, [propActiveTab, initialTab]);

  const [selectedQuarter, setSelectedQuarter] = useState<'q1' | 'q2' | 'q3' | 'q4' | 'year'>('q3');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'exact' | 'humanitarian' | 'natural'>('all');
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(INITIAL_HOMEWORK);

  // ─── СОСТОЯНИЯ КАЛЬКУЛЯТОРА ОЦЕНОК («ХОЧУ 5 / ХОЧУ 4») ───
  const [calculatorSubjectId, setCalculatorSubjectId] = useState<string>('physics');
  const [targetGrade, setTargetGrade] = useState<5 | 4>(5);
  const [simulatedGrades, setSimulatedGrades] = useState<{ id: string; val: number; weight: number; label: string }[]>([]);

  // ─── СОСТОЯНИЯ СДАЧИ ДОМАШНЕГО ЗАДАНИЯ ───
  const [submissionModalItem, setSubmissionModalItem] = useState<HomeworkItem | null>(null);
  const [submissionComment, setSubmissionComment] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState<string[]>([]);

  // ─── СОСТОЯНИЯ ПЕРЕПИСКИ С УЧИТЕЛЯМИ (СФЕРУМ) ───
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('losiv');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);
  const [chatDraft, setChatDraft] = useState('');
  const [isSimulatingTeacherReply, setIsSimulatingTeacherReply] = useState(false);

  // ─── СОСТОЯНИЯ КАРТЫ ПИТАНИЯ «КЕНГУ ДЕТЯМ» ───
  const [kenguBalance, setKenguBalance] = useState<number>(840);
  const [isKenguModalOpen, setIsKenguModalOpen] = useState(false);
  const [kenguAmount, setKenguAmount] = useState<number>(500);
  const [customKenguAmount, setCustomKenguAmount] = useState<string>('');
  const [kenguPaymentMethod, setKenguPaymentMethod] = useState<'sbp' | 'card' | 'sberpay' | 'tpay'>('sbp');
  const [isKenguProcessing, setIsKenguProcessing] = useState(false);
  const [kenguHistory, setKenguHistory] = useState<Array<{ id: string; title: string; amount: string; date: string; type: 'topup' | 'meal'; status: string }>>([
    { id: 'tx-1', title: 'Обед комплексный (Столовая ЛИТ)', amount: '-165,00 ₽', date: 'Сегодня, 12:18', type: 'meal', status: 'Списано' },
    { id: 'tx-2', title: 'Булочка с маком и сок', amount: '-65,00 ₽', date: 'Вчера, 10:25', type: 'meal', status: 'Списано' },
    { id: 'tx-3', title: 'Пополнение через СБП (Тинькофф)', amount: '+1 000,00 ₽', date: '08 фев, 19:40', type: 'topup', status: 'Зачислено' },
    { id: 'tx-4', title: 'Обед комплексный + напиток', amount: '-180,00 ₽', date: '08 фев, 12:20', type: 'meal', status: 'Списано' }
  ]);

  // ─── СОСТОЯНИЯ ПРЕДЗАКАЗА ЕДЫ НА ПЕРЕМЕНУ (APPLE CUERTINO DESIGN) ───
  const [isFoodOrderModalOpen, setIsFoodOrderModalOpen] = useState(false);
  const [selectedBreakId, setSelectedBreakId] = useState<string>('break-4');
  const [pickupMethod, setPickupMethod] = useState<'table' | 'express'>('table');
  const [foodCategory, setFoodCategory] = useState<'all' | 'hot' | 'bakery' | 'salads' | 'drinks' | 'healthy'>('all');
  const [foodCart, setFoodCart] = useState<Record<string, number>>({});
  const [kitchenComment, setKitchenComment] = useState('');
  const [selectedOrderTicket, setSelectedOrderTicket] = useState<ActiveFoodOrder | null>(null);
  const [isFoodOrderProcessing, setIsFoodOrderProcessing] = useState(false);

  const [activeFoodOrders, setActiveFoodOrders] = useState<ActiveFoodOrder[]>([
    {
      id: 'ord-init-1',
      orderNumber: '#412-КЕНГУ',
      breakName: '4-я перемена (12:15 – 12:45)',
      time: '12:15',
      pickupMethod: 'table',
      tableNumber: 'Стол №4 (9А класс)',
      items: [
        { title: 'Комплексный обед «Лицеист»', count: 1, price: 185 },
        { title: 'Облепиховый морс (тёплый)', count: 1, price: 35 }
      ],
      totalAmount: 220,
      status: 'kitchen',
      statusLabel: 'Готовится на кухне к 12:15',
      orderTime: 'Сегодня, 10:14',
      qrCodeToken: 'KENGU-MEAL-412-LIT9A'
    }
  ]);

  const totalCartCount = Object.values(foodCart).reduce((sum, count) => sum + count, 0);
  const totalCartPrice = Object.entries(foodCart).reduce((sum, [id, count]) => {
    const item = CANTEEN_MENU.find((m) => m.id === id);
    return sum + (item ? item.price * count : 0);
  }, 0);

  const handleAddToCart = (itemId: string) => {
    setFoodCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setFoodCart((prev) => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  const handleClearCart = () => {
    setFoodCart({});
    setKitchenComment('');
  };

  const handlePlaceFoodOrder = () => {
    if (totalCartCount === 0) {
      toast.warning('Выберите хотя бы одно блюдо для предзаказа', 'Корзина пуста');
      return;
    }

    if (kenguBalance < totalCartPrice) {
      toast.error(
        `На карте питания ${kenguBalance} ₽. Не хватает ${(totalCartPrice - kenguBalance).toLocaleString('ru-RU')} ₽ для оплаты.`,
        'Недостаточно средств'
      );
      setCustomKenguAmount(String(totalCartPrice - kenguBalance));
      setIsKenguModalOpen(true);
      return;
    }

    setIsFoodOrderProcessing(true);

    setTimeout(() => {
      const currentBreak = BREAK_SLOTS.find((b) => b.id === selectedBreakId) || BREAK_SLOTS[3];
      const orderItems = Object.entries(foodCart).map(([id, count]) => {
        const item = CANTEEN_MENU.find((m) => m.id === id)!;
        return { title: item.title, count, price: item.price };
      });

      const newOrderNum = `#${Math.floor(Math.random() * 800 + 100)}-КЕНГУ`;
      const tableLabel = pickupMethod === 'table' ? 'Стол №4 (9А класс)' : 'Окно экспресс-выдачи №1';

      const newOrder: ActiveFoodOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: newOrderNum,
        breakName: `${currentBreak.name} (${currentBreak.time})`,
        time: currentBreak.time.split(' – ')[0],
        pickupMethod,
        tableNumber: tableLabel,
        items: orderItems,
        totalAmount: totalCartPrice,
        status: 'kitchen',
        statusLabel: `Готовится на кухне к ${currentBreak.time.split(' – ')[0]}`,
        orderTime: 'Сегодня, только что',
        qrCodeToken: `KENGU-MEAL-${Date.now()}`,
        comment: kitchenComment.trim() || undefined
      };

      setKenguBalance((prev) => prev - totalCartPrice);
      setActiveFoodOrders((prev) => [newOrder, ...prev]);
      setKenguHistory((prev) => [
        {
          id: `tx-${Date.now()}`,
          title: `Предзаказ: ${currentBreak.name} (${orderItems.map((i) => i.title).slice(0, 2).join(', ')}${orderItems.length > 2 ? '...' : ''})`,
          amount: `-${totalCartPrice.toLocaleString('ru-RU')},00 ₽`,
          date: 'Сегодня, только что',
          type: 'meal',
          status: 'Оплачено'
        },
        ...prev
      ]);

      setIsFoodOrderProcessing(false);
      setIsFoodOrderModalOpen(false);
      handleClearCart();

      toast.success(
        `Заказ ${newOrderNum} на сумму ${totalCartPrice} ₽ оплачен с карты «Кенгу.Детям». ${
          pickupMethod === 'table'
            ? `Горячее будет накрыто на Стол №4 к звонку (${currentBreak.time})`
            : `Заберите по QR-коду на стойке №1 (${currentBreak.time})`
        }`,
        'Предзаказ отправлен на кухню'
      );

      setSelectedOrderTicket(newOrder);
    }, 450);
  };

  // Цветовая система Apple / Linear
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
    amberSoft: isLight ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.18)'
  };

  const toggleHomeworkStatus = (id: string) => {
    setHomeworkList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = !item.isCompleted;
          if (updated) {
            toast.success(`Задание по предмету "${item.subject}" отмечено выполненным`, 'Статус обновлен');
          }
          return { ...item, isCompleted: updated };
        }
        return item;
      })
    );
  };

  // ─── ЛОГИКА СДАЧИ ДОМАШНЕГО ЗАДАНИЯ ───
  const handleOpenSubmissionModal = (item: HomeworkItem) => {
    setSubmissionModalItem(item);
    setSubmissionComment('');
    setSubmissionFiles(['тетрадь_стр_42_решение.jpg (2.6 МБ)']);
  };

  const handleSubmitHomework = () => {
    if (!submissionModalItem) return;
    const nowStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + ' в ' +
      new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    setHomeworkList((prev) =>
      prev.map((h) => {
        if (h.id === submissionModalItem.id) {
          return {
            ...h,
            isCompleted: true,
            submittedOnline: true,
            submission: {
              submittedAt: nowStr,
              comment: submissionComment.trim() || 'Решение выполнено чисто и в полном объёме.',
              files: submissionFiles.length > 0 ? submissionFiles : ['домашняя_работа.pdf (1.8 МБ)']
            }
          };
        }
        return h;
      })
    );

    const subjectName = submissionModalItem.subject;
    const teacherName = submissionModalItem.teacher;
    setSubmissionModalItem(null);
    toast.success(
      `Домашнее задание по предмету "${subjectName}" успешно отправлено на проверку учителю (${teacherName})!`,
      'Работа сдана'
    );
  };

  // ─── ЛОГИКА КАЛЬКУЛЯТОРА ОЦЕНОК («ХОЧУ 5 / ХОЧУ 4») ───
  const selectedCalcSubject = INITIAL_SUBJECTS.find((s) => s.id === calculatorSubjectId) || INITIAL_SUBJECTS[0];

  // Сумма текущих оценок с весами
  const currentSum = selectedCalcSubject.grades.reduce((acc, g) => acc + g.val * g.weight, 0);
  const currentWeight = selectedCalcSubject.grades.reduce((acc, g) => acc + g.weight, 0);
  const baseAvg = currentWeight > 0 ? currentSum / currentWeight : 5.0;

  // Сумма с учетом симулированных оценок
  const simSum = currentSum + simulatedGrades.reduce((acc, s) => acc + s.val * s.weight, 0);
  const simWeight = currentWeight + simulatedGrades.reduce((acc, s) => acc + s.weight, 0);
  const simulatedAvg = simWeight > 0 ? simSum / simWeight : baseAvg;

  // Порог желаемой оценки (ГОСТ / школы РФ): 5 = >= 4.60; 4 = >= 3.60
  const targetThreshold = targetGrade === 5 ? 4.60 : 3.60;

  // Сколько пятёрок (с весом 1) еще нужно получить от текущего симулированного балла?
  // (simSum + 5*N) / (simWeight + N) >= targetThreshold
  // N * (5 - targetThreshold) >= targetThreshold * simWeight - simSum
  const neededFivesCount = Math.max(
    0,
    Math.ceil((targetThreshold * simWeight - simSum) / (5 - targetThreshold))
  );

  // Сколько контрольных (вес 2) на 5 нужно?
  const neededControlsCount = Math.max(
    0,
    Math.ceil((targetThreshold * simWeight - simSum) / (2 * (5 - targetThreshold)))
  );

  const isTargetAchieved = simulatedAvg >= targetThreshold;

  const handleAddSimGrade = (val: number, weight: number, label: string) => {
    const newGrade = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      val,
      weight,
      label
    };
    setSimulatedGrades((prev) => [...prev, newGrade]);
    toast.info(`В симулятор добавлена оценка "${val}" (${label})`, 'Симуляция обновлена');
  };

  const handleRemoveSimGrade = (id: string) => {
    setSimulatedGrades((prev) => prev.filter((g) => g.id !== id));
  };

  const handleResetSimGrades = () => {
    setSimulatedGrades([]);
    toast.info('Все смоделированные оценки сброшены', 'Сброс симулятора');
  };

  // ─── ЛОГИКА ЧАТА С УЧИТЕЛЯМИ ───
  const activeTeacher = TEACHER_CONTACTS.find((t) => t.id === selectedTeacherId) || TEACHER_CONTACTS[0];
  const activeMessages = chatMessages[selectedTeacherId] || [];

  const handleSendMessage = (textToSend?: string) => {
    const msg = textToSend || chatDraft;
    if (!msg.trim()) return;

    const timeStr = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      teacherId: selectedTeacherId,
      sender: 'student',
      text: msg.trim(),
      time: timeStr,
      status: 'delivered'
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedTeacherId]: [...(prev[selectedTeacherId] || []), newMsg]
    }));

    setChatDraft('');
    toast.success(`Сообщение отправлено педагогу ${activeTeacher.name} через Сферум`, 'Доставлено');

    // Автоматическая симуляция ответа учителя через 1.8 сек для живого опыта
    setIsSimulatingTeacherReply(true);
    setTimeout(() => {
      const teacherReplyMap: Record<string, string> = {
        losiv: 'Здравствуй, Иван! Сообщение принято. По твоему вопросу: алгоритм отличный, завтра разберём на уроке.',
        smirnova: 'Здравствуй, Ваня! Спасибо за обращение. Твой черновик я уже посмотрела, замечания учтены.',
        kuznetsov: 'Иван, привет! Приходи в 204 каб. на перемене, выдам методичку к олимпиаде.',
        morozova: 'Здравствуй! Всё верно, продолжай решать по этой формуле.',
        gromova: 'Иван, информация зафиксирована в учебной части. Удачи на защите проекта!'
      };

      const replyText = teacherReplyMap[selectedTeacherId] || 'Здравствуй, Иван! Сообщение принято, скоро отвечу подробнее.';
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        teacherId: selectedTeacherId,
        sender: 'teacher',
        text: replyText,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };

      setChatMessages((prev) => ({
        ...prev,
        [selectedTeacherId]: [...(prev[selectedTeacherId] || []), replyMsg]
      }));
      setIsSimulatingTeacherReply(false);
      toast.info(`Новое сообщение от ${activeTeacher.name}`, 'Ответ в Сферум');
    }, 1800);
  };

  // ─── ЛОГИКА ПОПОЛНЕНИЯ КАРТЫ «КЕНГУ ДЕТЯМ» ───
  const handleTopupKengu = () => {
    const finalAmount = customKenguAmount ? parseFloat(customKenguAmount) : kenguAmount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      toast.error('Пожалуйста, укажите корректную сумму пополнения', 'Ошибка ввода');
      return;
    }

    setIsKenguProcessing(true);

    setTimeout(() => {
      const newBal = kenguBalance + finalAmount;
      setKenguBalance(newBal);
      setIsKenguProcessing(false);
      setIsKenguModalOpen(false);
      setCustomKenguAmount('');

      const nowTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      setKenguHistory((prev) => [
        {
          id: `tx-${Date.now()}`,
          title: `Пополнение через СБП (+${finalAmount} ₽)`,
          amount: `+${finalAmount.toLocaleString('ru-RU')},00 ₽`,
          date: `Сегодня, ${nowTime}`,
          type: 'topup',
          status: 'Зачислено'
        },
        ...prev
      ]);

      toast.success(
        `Карта питания "Кенгу.Детям" успешно пополнена на ${finalAmount.toLocaleString('ru-RU')} ₽! Текущий баланс: ${newBal.toLocaleString('ru-RU')},00 ₽`,
        'Оплата прошла'
      );
    }, 950);
  };

  // Фильтр предметов
  const filteredSubjects = INITIAL_SUBJECTS.filter((s) => {
    if (subjectFilter === 'all') return true;
    return s.category === subjectFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. ШАПКА ПРОФИЛЯ УЧЕНИКА (APPLE INSET GLASS HERO)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 20,
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.04)' : '0 4px 24px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 22,
              boxShadow: '0 4px 14px rgba(0, 122, 255, 0.35)',
              flexShrink: 0
            }}
          >
            {user?.fullName ? user.fullName[0] : 'И'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.4 }}>
                {user?.fullName || 'Иванов Иван Денисович'}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: colors.emeraldSoft,
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                ● 9А Класс • IT-Профиль
              </span>
            </div>

            <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>МАОУ ЛИТ г. Новосибирска</span>
              <span>•</span>
              <span>Классрук: Лосив Роман Борисович</span>
              <span>•</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>ЕСИА подтверждено</span>
            </div>
          </div>
        </div>

        {/* Быстрые метрики ученика */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => setActiveTab('grades')}
            title="Открыть калькулятор оценок"
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              background: colors.slotBg,
              border: `1px solid ${colors.cardBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Calculator size={16} color={colors.accentColor} />
            <div>
              <div style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>
                Ср. балл (Калькулятор)
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: colors.textPrimary }}>
                4.84 <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>● Отличник</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setIsKenguModalOpen(true)}
            title="Пополнить карту питания Кенгу.Детям"
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.18) 100%)',
              border: '1px solid rgba(0, 122, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <Wallet size={16} color={colors.accentColor} />
            <div>
              <div style={{ fontSize: 10, color: colors.accentColor, textTransform: 'uppercase', fontWeight: 700 }}>
                Кенгу.Детям (Питание)
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: colors.textPrimary }}>
                {kenguBalance.toLocaleString('ru-RU')} ₽ <span style={{ fontSize: 11, color: colors.accentColor, fontWeight: 700 }}>+ Пополнить</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. ПЕРЕКЛЮЧАТЕЛЬ РАЗДЕЛОВ (APPLE SEGMENTED PILL BAR)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div
        className="horizontal-scroll-pills"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
          padding: 5,
          borderRadius: 14,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          border: `1px solid ${colors.cardBorder}`
        }}
      >
        {[
          { id: 'overview', label: 'Обзор и день', icon: Sparkles },
          { id: 'news', label: 'Новости', icon: Megaphone },
          { id: 'grades', label: 'Дневник и калькулятор', icon: BookOpen },
          { id: 'schedule', label: 'Расписание уроков', icon: Calendar },
          {
            id: 'homework',
            label: 'Домашние задания',
            icon: FileText,
            badge: `${homeworkList.filter((h) => !h.isCompleted).length}`
          },
          { id: 'messages', label: 'Чат с учителями (Сферум)', icon: MessageSquare, badge: '2' },
          { id: 'services', label: 'СКУД и Кенгу.Детям', icon: CreditCard },
          { id: 'portfolio', label: 'Олимпиады и ВсОШ', icon: Award }
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                onNavigateToTab?.(tab.id);
              }}
              style={{
                flexShrink: 0,
                minWidth: 'max-content',
                padding: '9px 16px',
                borderRadius: 10,
                border: 'none',
                background: active ? (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.14)') : 'transparent',
                color: active ? colors.textPrimary : colors.textMuted,
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
                boxShadow: active ? (isLight ? '0 2px 8px rgba(0, 0, 0, 0.06)' : '0 2px 8px rgba(0, 0, 0, 0.3)') : 'none'
              }}
            >
              <Icon size={15} color={active ? colors.accentColor : 'currentColor'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: active ? colors.accentColor : 'rgba(0, 0, 0, 0.1)',
                    color: active ? '#ffffff' : colors.textSecondary
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. ВКЛАДКА 1: ОБЗОР И ДЕНЬ (OVERVIEW)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Текущий статус ученика */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              borderRadius: 18,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              boxShadow: '0 8px 30px rgba(15, 23, 42, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(16, 185, 129, 0.4)'
                }}
              >
                <ShieldCheck size={24} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: 0.5 }}>
                  Текущий статус в лицее
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                  Идёт 4-й урок: Информатика и ИКТ (Каб. 311)
                </div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 2 }}>
                  Тема: Алгоритмы на графах • Учитель: Лосив Р.Б. • До перемены 18 минут
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedTeacherId('losiv');
                  setActiveTab('messages');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <MessageSquare size={14} />
                <span>Написать в Сферум</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('grades')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: colors.accentColor,
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Calculator size={14} />
                <span>Калькулятор среднего балла</span>
              </button>
            </div>
          </div>

          {/* Плашка важных новостей лицея (Apple News Card) */}
          <div
            onClick={() => setActiveTab('news')}
            style={{
              padding: '14px 18px',
              borderRadius: 16,
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              cursor: 'pointer',
              boxShadow: isLight ? '0 2px 12px rgba(0, 0, 0, 0.03)' : '0 2px 14px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Megaphone size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: '#f59e0b', padding: '2px 6px', borderRadius: 5 }}>
                    ГОРДОСТЬ ЛИЦЕЯ
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Победа команды 9А «Девелопы» на хакатоне «Идея фикс»!
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>
                  Официальные приказы, олимпиады и мероприятия в школьной ленте
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.accentColor, fontWeight: 700, fontSize: 12.5, flexShrink: 0 }}>
              <span>Открыть ленту</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Быстрые карточки дня */}
          <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Домашнее задание на завтра */}
            <div
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 18,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: colors.textPrimary }}>
                  Домашнее задание на завтра
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('homework')}
                  style={{ background: 'none', border: 'none', color: colors.accentColor, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <span>Все задания ({homeworkList.length})</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {homeworkList.slice(0, 2).map((hw) => (
                  <div
                    key={hw.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: colors.textPrimary }}>
                        {hw.subject} • {hw.classroom}
                      </span>
                      <span style={{ fontSize: 11, color: hw.isCompleted ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                        {hw.isCompleted ? '✓ Сдано' : hw.dueDayLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: colors.textSecondary }}>
                      {hw.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => handleOpenSubmissionModal(hw)}
                        style={{
                          background: colors.accentSoft,
                          border: `1px solid ${colors.accentColor}`,
                          color: colors.accentColor,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <UploadCloud size={12} />
                        <span>{hw.isCompleted ? 'Сдать повторно' : 'Сдать решение'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Свежие оценки в журнале */}
            <div
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 18,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: colors.textPrimary }}>
                  Свежие оценки в электронном журнале
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('grades')}
                  style={{ background: 'none', border: 'none', color: colors.accentColor, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <span>Калькулятор</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { subject: 'Алгебра', val: 5, weight: 2, label: 'Контрольная работа №4', date: '10 фев' },
                  { subject: 'Английский язык', val: 5, weight: 1.5, label: 'Лексический тест Unit 5', date: '10 фев' },
                  { subject: 'Информатика', val: 5, weight: 2, label: 'Проект Python', date: '09 фев' },
                  { subject: 'Физика', val: 4, weight: 2, label: 'Лабораторная работа №3', date: '08 фев' }
                ].map((g, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: colors.textPrimary }}>
                        {g.subject}
                      </div>
                      <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                        {g.label} ({g.date}) {g.weight > 1 ? `• Вес ${g.weight}` : ''}
                      </div>
                    </div>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: g.val === 5 ? colors.emeraldSoft : colors.accentSoft,
                        color: g.val === 5 ? '#10b981' : colors.accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14
                      }}
                    >
                      {g.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Карточка питания «Кенгу Детям» */}
            <div
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 18,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: colors.textPrimary }}>
                  Школьное питание • Кенгу.Детям
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: colors.emeraldSoft, padding: '2px 8px', borderRadius: 6 }}>
                  ● Активно
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${colors.cardBorder}` }}>
                  <span style={{ color: colors.textMuted }}>Баланс карты питания</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: colors.accentColor }}>{kenguBalance.toLocaleString('ru-RU')},00 ₽</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${colors.cardBorder}` }}>
                  <span style={{ color: colors.textMuted }}>Предзаказ к перемене</span>
                  {activeFoodOrders.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setSelectedOrderTicket(activeFoodOrders[0])}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: colors.accentColor,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span>{activeFoodOrders[0].time} • Талон</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <span style={{ color: '#10b981', fontWeight: 700 }}>Обед сегодня (12:15)</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: colors.textMuted }}>СКУД турникет</span>
                  <span style={{ color: colors.textPrimary, fontWeight: 600 }}>Вход в 08:14 (Пост №2)</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsFoodOrderModalOpen(true)}
                  style={{
                    padding: '10px 0',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)'
                  }}
                >
                  <Utensils size={14} />
                  <span>Заказ на перемену</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsKenguModalOpen(true)}
                  style={{
                    padding: '10px 0',
                    borderRadius: 12,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textPrimary,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Wallet size={14} />
                  <span>Пополнить</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          3.1. ВКЛАДКА: ШКОЛЬНАЯ ЛЕНТА НОВОСТЕЙ (NEWS)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'news' && (
        <SchoolNewsFeedView
          user={user}
          theme={theme}
          canPublish={false}
          onNavigateToTab={onNavigateToTab}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. ВКЛАДКА 2: ДНЕВНИК И ИНТЕЛЛЕКТУАЛЬНЫЙ КАЛЬКУЛЯТОР ОЦЕНОК (GRADES)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'grades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Панель периода четверти и фильтра предметов */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 16,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            {/* Переключатель четвертей */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, marginRight: 4 }}>
                Период:
              </span>
              {[
                { id: 'q1', label: '1 четверть' },
                { id: 'q2', label: '2 четверть' },
                { id: 'q3', label: '3 четверть (сейчас)' },
                { id: 'q4', label: '4 четверть' },
                { id: 'year', label: 'Годовая' }
              ].map((q) => {
                const active = selectedQuarter === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedQuarter(q.id as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: active ? `1px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                      background: active ? colors.accentSoft : colors.slotBg,
                      color: active ? colors.accentColor : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>

            {/* Фильтр по циклу предметов */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {[
                { id: 'all', label: `Все предметы (${INITIAL_SUBJECTS.length})` },
                { id: 'exact', label: 'Точные науки' },
                { id: 'humanitarian', label: 'Гуманитарные' },
                { id: 'natural', label: 'Естественные' }
              ].map((f) => {
                const active = subjectFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSubjectFilter(f.id as any)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 8,
                      border: active ? `1px solid ${colors.accentColor}` : 'none',
                      background: active ? (isLight ? '#0f172a' : '#ffffff') : 'transparent',
                      color: active ? (isLight ? '#ffffff' : '#0f172a') : colors.textMuted,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ИНТЕЛЛЕКТУАЛЬНЫЙ КАЛЬКУЛЯТОР ОЦЕНОК («ХОЧУ 5 / ХОЧУ 4») */}
          <div
            style={{
              background: colors.cardBg,
              border: `1.5px solid ${isTargetAchieved ? '#10b981' : colors.accentColor}`,
              borderRadius: 20,
              padding: 22,
              boxShadow: isLight ? '0 6px 24px rgba(0, 122, 255, 0.08)' : '0 6px 24px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: colors.accentSoft,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Calculator size={20} color={colors.accentColor} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: colors.textPrimary }}>
                    Интеллектуальный калькулятор оценок • «Хочу {targetGrade}»
                  </div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>
                    Рассчитывает, сколько и каких оценок нужно получить до заветного четвертного балла
                  </div>
                </div>
              </div>

              {/* Переключатели цели (Хочу 5 / Хочу 4) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: colors.slotBg, padding: 4, borderRadius: 10, border: `1px solid ${colors.cardBorder}` }}>
                <button
                  type="button"
                  onClick={() => setTargetGrade(5)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: targetGrade === 5 ? '#10b981' : 'transparent',
                    color: targetGrade === 5 ? '#ffffff' : colors.textMuted,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Хочу 5 (≥ 4.60)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetGrade(4)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: targetGrade === 4 ? colors.accentColor : 'transparent',
                    color: targetGrade === 4 ? '#ffffff' : colors.textMuted,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Хочу 4 (≥ 3.60)
                </button>
              </div>
            </div>

            {/* Селектор предмета для моделирования */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted }}>Предмет для расчёта:</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {INITIAL_SUBJECTS.map((sub) => {
                  const active = sub.id === calculatorSubjectId;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setCalculatorSubjectId(sub.id);
                        setSimulatedGrades([]);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: active ? `1.5px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                        background: active ? colors.accentSoft : colors.slotBg,
                        color: active ? colors.accentColor : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: active ? 800 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {sub.name} ({sub.avg.toFixed(2)})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Индикатор результатов и прогресс-бар */}
            <div
              style={{
                background: colors.slotBg,
                borderRadius: 14,
                padding: '16px 18px',
                border: `1px solid ${colors.cardBorder}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', color: colors.textMuted, fontWeight: 700 }}>
                    {selectedCalcSubject.name} • Текущие оценки: {selectedCalcSubject.grades.map((g) => g.val).join(', ')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 14, color: colors.textSecondary }}>Текущий балл:</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary }}>{baseAvg.toFixed(2)}</span>
                    <span style={{ fontSize: 16, color: colors.textMuted }}>→</span>
                    <span style={{ fontSize: 14, color: colors.textSecondary }}>С учётом симуляции:</span>
                    <span
                      style={{
                        fontSize: 24,
                        fontWeight: 900,
                        color: isTargetAchieved ? '#10b981' : colors.accentColor
                      }}
                    >
                      {simulatedAvg.toFixed(2)}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: isTargetAchieved ? colors.emeraldSoft : colors.accentSoft,
                        color: isTargetAchieved ? '#10b981' : colors.accentColor
                      }}
                    >
                      {isTargetAchieved ? `Четвертная ${targetGrade}! 🎉` : `Пока выходит ${Math.floor(simulatedAvg)}`}
                    </span>
                  </div>
                </div>

                {/* Рекомендация калькулятора */}
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: isTargetAchieved ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 122, 255, 0.1)',
                    border: `1px solid ${isTargetAchieved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0, 122, 255, 0.3)'}`,
                    fontSize: 12,
                    fontWeight: 700,
                    color: isTargetAchieved ? '#10b981' : colors.accentColor,
                    maxWidth: 380
                  }}
                >
                  {isTargetAchieved ? (
                    <span>Отлично! Текущий средний балл гарантирует оценку {targetGrade} за четверть. Главное — не получать троек.</span>
                  ) : (
                    <span>
                      Чтобы получить {targetGrade}, нужно получить ещё <strong>{neededFivesCount} пятёрки</strong> (вес 1) или{' '}
                      <strong>{neededControlsCount} пятёрки</strong> за контрольные (вес 2).
                    </span>
                  )}
                </div>
              </div>

              {/* Прогресс-бар до цели */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>
                  <span>3.00</span>
                  <span>3.60 (Четвёрка)</span>
                  <span style={{ fontWeight: 800, color: colors.accentColor }}>4.60 (Пятёрка)</span>
                  <span>5.00</span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(0, ((simulatedAvg - 3.0) / 2.0) * 100))}%`,
                      background: isTargetAchieved ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #007aff, #3b82f6)',
                      borderRadius: 4,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Интерактивные кнопки симуляции */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, paddingTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary }}>Примерить оценку:</span>
                  <button
                    type="button"
                    onClick={() => handleAddSimGrade(5, 1, 'Ответ')}
                    style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    +5 (Ответ, вес 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSimGrade(5, 2, 'Контрольная')}
                    style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                  >
                    +5 (Контрольная, вес 2)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSimGrade(4, 1, 'Ответ')}
                    style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: colors.accentColor, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    +4 (Ответ, вес 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSimGrade(3, 1, 'Ответ')}
                    style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    +3 (Ответ, вес 1)
                  </button>
                </div>

                {simulatedGrades.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetSimGrades}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '5px 10px',
                      borderRadius: 8,
                      border: `1px solid ${colors.cardBorder}`,
                      background: 'transparent',
                      color: colors.textMuted,
                      fontSize: 11,
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={12} />
                    <span>Сбросить симуляцию ({simulatedGrades.length})</span>
                  </button>
                )}
              </div>

              {/* Список смоделированных оценок */}
              {simulatedGrades.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingTop: 4 }}>
                  <span style={{ fontSize: 11, color: colors.textMuted }}>Добавленные в расчёт:</span>
                  {simulatedGrades.map((g) => (
                    <span
                      key={g.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: g.val === 5 ? colors.emeraldSoft : g.val === 4 ? colors.accentSoft : colors.amberSoft,
                        color: g.val === 5 ? '#10b981' : g.val === 4 ? colors.accentColor : '#f59e0b',
                        fontSize: 12,
                        fontWeight: 800
                      }}
                    >
                      {g.val} ({g.label}, в.{g.weight})
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveSimGrade(g.id)} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Таблица оценок */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: isLight ? '0 4px 16px rgba(0, 0, 0, 0.03)' : '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div className="responsive-table-scroll" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: 720 }}>
                {/* Заголовок таблицы */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(200px, 1.8fr) minmax(260px, 3fr) 110px 100px 110px',
                padding: '12px 20px',
                background: colors.slotBg,
                borderBottom: `1px solid ${colors.cardBorder}`,
                fontSize: 11,
                fontWeight: 700,
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              <span>Предмет и преподаватель</span>
              <span>Текущие оценки за 3 четверть</span>
              <span style={{ textAlign: 'center' }}>Средний балл</span>
              <span style={{ textAlign: 'center' }}>Прогноз</span>
              <span style={{ textAlign: 'center' }}>Действие</span>
            </div>

            {/* Строки предметов */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredSubjects.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(200px, 1.8fr) minmax(260px, 3fr) 110px 100px 110px',
                    padding: '14px 20px',
                    alignItems: 'center',
                    borderBottom: idx < filteredSubjects.length - 1 ? `1px solid ${colors.cardBorder}` : 'none',
                    background: item.id === calculatorSubjectId ? colors.accentSoft : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* Предмет */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: colors.textPrimary }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      {item.teacher} • Каб. {item.classroom}
                    </div>
                  </div>

                  {/* Лента оценок */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {item.grades.map((g, gIdx) => (
                      <div
                        key={gIdx}
                        title={`${g.type} (${g.date})${g.weight > 1 ? `, вес ${g.weight}` : ''}`}
                        style={{
                          position: 'relative',
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: g.val === 5 ? colors.emeraldSoft : g.val === 4 ? colors.accentSoft : colors.amberSoft,
                          color: g.val === 5 ? '#10b981' : g.val === 4 ? colors.accentColor : '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 14,
                          cursor: 'pointer'
                        }}
                      >
                        {g.val}
                        {g.weight > 1 && (
                          <span
                            style={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              fontSize: 9,
                              fontWeight: 900,
                              background: colors.textPrimary,
                              color: colors.cardBg,
                              borderRadius: '50%',
                              width: 14,
                              height: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {g.weight}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Средний балл */}
                  <div style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: item.avg >= 4.6 ? colors.emeraldSoft : colors.accentSoft,
                        color: item.avg >= 4.6 ? '#10b981' : colors.accentColor,
                        fontWeight: 800,
                        fontSize: 14
                      }}
                    >
                      {item.avg.toFixed(2)}
                    </span>
                  </div>

                  {/* Прогноз четверти */}
                  <div style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: item.forecast === 5 ? '#10b981' : colors.accentColor,
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 15,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {item.forecast}
                    </span>
                  </div>

                  {/* Кнопка запуска калькулятора */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setCalculatorSubjectId(item.id);
                        setSimulatedGrades([]);
                        toast.info(`Калькулятор переключен на предмет "${item.name}"`, 'Выбор предмета');
                      }}
                      title="Открыть в симуляторе оценок"
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: `1px solid ${colors.cardBorder}`,
                        background: item.id === calculatorSubjectId ? colors.accentColor : colors.slotBg,
                        color: item.id === calculatorSubjectId ? '#ffffff' : colors.textSecondary,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Calculator size={13} />
                      <span>{item.id === calculatorSubjectId ? 'Выбран' : 'Расчёт'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. ВКЛАДКА 3: РАСПИСАНИЕ УРОКОВ (SCHEDULE)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary }}>
                Расписание уроков на сегодня (Четверг, 12 февраля)
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: colors.accentColor, background: colors.accentSoft, padding: '4px 10px', borderRadius: 8 }}>
                6 уроков • 1 смена
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { num: 1, time: '08:30 – 09:15', name: 'Разговоры о важном', teacher: 'Лосив Р.Б.', room: 'Каб. 311', isDone: true, current: false },
                { num: 2, time: '09:25 – 10:10', name: 'Алгебра', teacher: 'Лосив Р.Б.', room: 'Каб. 311', isDone: true, current: false },
                { num: 3, time: '10:25 – 11:10', name: 'Русский язык', teacher: 'Васильева Е.Н.', room: 'Каб. 108', isDone: true, current: false },
                { num: 4, time: '11:30 – 12:15', name: 'Информатика и ИКТ (Практикум Python)', teacher: 'Лосив Р.Б.', room: 'Каб. 311', isDone: false, current: true },
                { num: 5, time: '12:35 – 13:20', name: 'Физика (Закон Ома)', teacher: 'Смирнов В.А.', room: 'Каб. 204', isDone: false, current: false },
                { num: 6, time: '13:30 – 14:15', name: 'Английский язык', teacher: 'Белова Т.С.', room: 'Каб. 315', isDone: false, current: false }
              ].map((lesson) => (
                <div
                  key={lesson.num}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 14,
                    background: lesson.current ? 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.2) 100%)' : colors.slotBg,
                    border: lesson.current ? '2px solid #007aff' : `1px solid ${colors.cardBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: lesson.current ? colors.accentColor : 'rgba(0,0,0,0.06)',
                        color: lesson.current ? '#ffffff' : colors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 15
                      }}
                    >
                      {lesson.num}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: colors.textPrimary }}>
                        {lesson.name}
                      </div>
                      <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                        {lesson.time} • {lesson.teacher} • <strong>{lesson.room}</strong>
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: lesson.current ? '#007aff' : lesson.isDone ? colors.emeraldSoft : 'transparent',
                      color: lesson.current ? '#ffffff' : lesson.isDone ? '#10b981' : colors.textMuted
                    }}
                  >
                    {lesson.current ? '● Идёт сейчас (до 12:15)' : lesson.isDone ? 'Завершён' : 'Предстоит'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. ВКЛАДКА 4: ДОМАШНИЕ ЗАДАНИЯ (HOMEWORK) + СДАЧА РАБОТЫ
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'homework' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary }}>
                Домашние задания и онлайн-сдача
              </div>
              <div style={{ fontSize: 13, color: colors.textSecondary }}>
                Прикрепляйте фото тетрадей, документы и код напрямую в систему электронного лицея
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted }}>
              Осталось сдать: <strong style={{ color: colors.accentColor }}>{homeworkList.filter((h) => !h.isCompleted).length} задания</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {homeworkList.map((item) => (
              <div
                key={item.id}
                style={{
                  background: colors.cardBg,
                  border: `1.5px solid ${item.isCompleted ? (item.submittedOnline ? '#10b981' : colors.cardBorder) : 'rgba(0, 122, 255, 0.3)'}`,
                  borderRadius: 18,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: item.isCompleted ? 'none' : '0 4px 18px rgba(0, 122, 255, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: colors.textPrimary }}>
                      {item.subject}
                    </span>
                    <span style={{ fontSize: 11, color: colors.textMuted }}>
                      {item.classroom}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: item.isCompleted ? colors.emeraldSoft : colors.amberSoft,
                      color: item.isCompleted ? '#10b981' : '#f59e0b'
                    }}
                  >
                    {item.dueDayLabel}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 1.45 }}>
                    {item.description}
                  </div>
                </div>

                {/* Инфо об отправленном решении */}
                {item.submission && (
                  <div
                    style={{
                      background: colors.slotBg,
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      fontSize: 12
                    }}
                  >
                    <div style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={13} />
                      <span>Сдано {item.submission.submittedAt}</span>
                    </div>
                    <div style={{ color: colors.textSecondary, marginTop: 4 }}>
                      «{item.submission.comment}»
                    </div>
                    {item.submission.files.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        {item.submission.files.map((f, fIdx) => (
                          <span
                            key={fIdx}
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: 'rgba(0,0,0,0.06)',
                              fontSize: 11,
                              fontWeight: 600,
                              color: colors.textPrimary
                            }}
                          >
                            📎 {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: `1px solid ${colors.cardBorder}`,
                    marginTop: 'auto',
                    gap: 8,
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ fontSize: 12, color: colors.textMuted }}>
                    Срок: {item.dueDate}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenSubmissionModal(item)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: colors.accentColor,
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <UploadCloud size={14} />
                      <span>{item.isCompleted ? 'Сдать повторно' : 'Прикрепить и сдать'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleHomeworkStatus(item.id)}
                      title="Быстрое переключение статуса"
                      style={{
                        padding: '7px 10px',
                        borderRadius: 8,
                        border: `1px solid ${colors.cardBorder}`,
                        background: colors.slotBg,
                        color: colors.textSecondary,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {item.isCompleted ? 'Снять отметку' : 'Готово'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          7. ВКЛАДКА 5: ЧАТ С УЧИТЕЛЯМИ И ОФИЦИАЛЬНЫЕ ПИСЬМА (СФЕРУМ)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'messages' && (
        <div
          className="responsive-split-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 18,
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 20,
            overflow: 'hidden',
            minHeight: 620,
            boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.04)' : '0 4px 24px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Левая колонка: Список учителей-предметников */}
          <div
            style={{
              borderRight: `1px solid ${colors.cardBorder}`,
              background: colors.slotBg,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${colors.cardBorder}` }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: colors.textPrimary }}>
                Учителя лицея (Сферум)
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                Официальные обращения и консультации
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {TEACHER_CONTACTS.map((teacher) => {
                const active = teacher.id === selectedTeacherId;
                const msgs = chatMessages[teacher.id] || [];
                const lastMsg = msgs[msgs.length - 1];

                return (
                  <div
                    key={teacher.id}
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      background: active ? (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.08)') : 'transparent',
                      borderLeft: active ? `3px solid ${colors.accentColor}` : '3px solid transparent',
                      borderBottom: `1px solid ${colors.cardBorder}`,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: teacher.avatarColor,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 16
                        }}
                      >
                        {teacher.avatarLetter}
                      </div>
                      {teacher.online && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: '#10b981',
                            border: '2px solid #ffffff'
                          }}
                        />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {teacher.name}
                        </div>
                        {lastMsg && (
                          <span style={{ fontSize: 11, color: colors.textMuted }}>{lastMsg.time}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: colors.accentColor, fontWeight: 600 }}>
                        {teacher.subject} • {teacher.classroom}
                      </div>
                      {lastMsg && (
                        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lastMsg.sender === 'student' ? 'Вы: ' : ''}{lastMsg.text}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Правая колонка: Диалог с выбранным учителем */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: colors.cardBg }}>
            {/* Шапка диалога */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: `1px solid ${colors.cardBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: colors.slotBg
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: activeTeacher.avatarColor,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 16
                  }}
                >
                  {activeTeacher.avatarLetter}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: colors.textPrimary }}>
                    {activeTeacher.name}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>
                    {activeTeacher.role} • {activeTeacher.classroom} • {activeTeacher.online ? <span style={{ color: '#10b981' }}>● В сети Сферум</span> : 'Не в сети'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Здравствуйте! Хотел бы подойти на консультацию по олимпиадному этапу.')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: colors.accentSoft,
                    border: `1px solid ${colors.accentColor}`,
                    color: colors.accentColor,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Запись на консультацию
                </button>
              </div>
            </div>

            {/* Быстрые шаблоны официальных писем */}
            <div style={{ padding: '8px 16px', background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${colors.cardBorder}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, alignSelf: 'center', marginRight: 4 }}>Шаблоны:</span>
              {[
                { title: 'Вопрос по задаче', text: 'Здравствуйте! Подскажите, пожалуйста, по задаче №415: как правильно составить уравнение?' },
                { title: 'Справка о болезни', text: 'Здравствуйте! Направляю электронную справку формы 095/у об уважительной причине отсутствия.' },
                { title: 'Сдача долга', text: 'Здравствуйте! Я доделал практическую работу, решение прикреплено в электронном дневнике.' }
              ].map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setChatDraft(tmpl.text)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.slotBg,
                    color: colors.textSecondary,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>

            {/* Лента сообщений */}
            <div
              style={{
                flex: 1,
                padding: '20px 22px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              {activeMessages.map((msg) => {
                const isStudent = msg.sender === 'student';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isStudent ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '12px 16px',
                        borderRadius: isStudent ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isStudent ? colors.accentColor : colors.slotBg,
                        color: isStudent ? '#ffffff' : colors.textPrimary,
                        border: isStudent ? 'none' : `1px solid ${colors.cardBorder}`,
                        fontSize: 13.5,
                        lineHeight: 1.45,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      {msg.text}
                    </div>
                    <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{msg.time}</span>
                      {isStudent && <span>• Доставлено в Сферум ✓✓</span>}
                    </div>
                  </div>
                );
              })}

              {isSimulatingTeacherReply && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.textMuted, fontSize: 12, fontStyle: 'italic' }}>
                  <Loader2 size={13} className="spin" />
                  <span>{activeTeacher.name} печатает ответ в Сферуме...</span>
                </div>
              )}
            </div>

            {/* Поле ввода сообщения */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: `1px solid ${colors.cardBorder}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: colors.slotBg
              }}
            >
              <button
                type="button"
                onClick={() => {
                  toast.info('Файл "решение_задачи.py" прикреплен к сообщению', 'Вложение');
                  setChatDraft((prev) => (prev ? `${prev} [Прикреплен файл solution.py]` : '[Прикреплен файл solution.py]'));
                }}
                title="Прикрепить файл или фото"
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  padding: 6
                }}
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={`Написать официальное сообщение для ${activeTeacher.name}...`}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: `1px solid ${colors.cardBorder}`,
                  background: colors.cardBg,
                  color: colors.textPrimary,
                  fontSize: 13,
                  outline: 'none'
                }}
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!chatDraft.trim()}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: chatDraft.trim() ? colors.accentColor : 'rgba(0,0,0,0.1)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: chatDraft.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Send size={14} />
                <span>Отправить</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          8. ВКЛАДКА 6: СКУД И КАРТА ПИТАНИЯ «КЕНГУ ДЕТЯМ» (SERVICES)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'services' && (
        <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Карта школьного питания «Кенгу Детям» */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 20,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.04)' : '0 4px 24px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary }}>
                  Школьное питание • «Кенгу.Детям»
                </div>
                <div style={{ fontSize: 12, color: colors.textSecondary }}>
                  Единая платёжная система питания школ и лицеев
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', background: colors.emeraldSoft, padding: '4px 10px', borderRadius: 8 }}>
                ● Лицевой счёт активен
              </span>
            </div>

            {/* Премиальная карта питания с кнопкой моментального пополнения */}
            <div
              style={{
                background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
                color: '#ffffff',
                borderRadius: 18,
                padding: 22,
                boxShadow: '0 10px 28px rgba(0, 122, 255, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                    К
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.2 }}>КЕНГУ.ДЕТЯМ</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: 6 }}>
                  МАОУ ЛИТ • 9А
                </span>
              </div>

              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.85, fontWeight: 600 }}>Текущий баланс карты</div>
                <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -0.5 }}>{kenguBalance.toLocaleString('ru-RU')},00 ₽</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 12, opacity: 0.95, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>ИВАНОВ ИВАН ДЕНИСОВИЧ</div>
                  <div style={{ fontFamily: 'monospace', marginTop: 3, letterSpacing: 1 }}>5401 3110 8842</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBreakId('break-4');
                      setIsFoodOrderModalOpen(true);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#ffffff',
                      color: '#007aff',
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
                    }}
                  >
                    <Utensils size={14} />
                    <span>Заказать на перемену</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsKenguModalOpen(true)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.18)',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Пополнить
                  </button>
                </div>
              </div>
            </div>

            {/* ─── СЕКЦИЯ ПРЕДЗАКАЗА ЕДЫ НА ПЕРЕМЕНУ В ЭПЛ СТИЛЕ ─── */}
            <div
              style={{
                background: colors.slotBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 18,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Utensils size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: colors.textPrimary }}>
                      Предзаказ еды на конкретную перемену
                    </div>
                    <div style={{ fontSize: 11.5, color: colors.textMuted }}>
                      Блюда будут приготовлены и накрыты на Стол №4 точно к звонку (без очередей)
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFoodOrderModalOpen(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
                    color: '#ffffff',
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 3px 12px rgba(0, 122, 255, 0.28)'
                  }}
                >
                  <Plus size={14} />
                  <span>Сделать заказ</span>
                </button>
              </div>

              {/* Быстрый выбор перемены (Apple Pill Selector) */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>
                  Выберите перемену для заказа:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 6 }}>
                  {BREAK_SLOTS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBreakId(b.id);
                        setIsFoodOrderModalOpen(true);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 12,
                        border: b.isMajor ? `1.5px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                        background: colors.cardBg,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, fontSize: 12, color: colors.textPrimary }}>
                          {b.name}
                        </span>
                        {b.isMajor && (
                          <span style={{ fontSize: 8.5, fontWeight: 800, color: '#fff', background: '#f59e0b', padding: '1px 4px', borderRadius: 4 }}>
                            Обед
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: colors.accentColor }}>
                        {b.time}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Активные предзаказы на сегодня */}
              {activeFoodOrders.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                    Активные предзаказы на сегодня ({activeFoodOrders.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeFoodOrders.map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          padding: 14,
                          borderRadius: 14,
                          background: colors.cardBg,
                          border: `1px solid ${colors.cardBorder}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 13, color: colors.textPrimary }}>
                              {ord.orderNumber}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: colors.accentColor, background: colors.accentSoft, padding: '2px 8px', borderRadius: 6 }}>
                              {ord.breakName}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', background: colors.amberSoft, padding: '2px 8px', borderRadius: 6 }}>
                            ● {ord.statusLabel}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: colors.textSecondary }}>
                          <div>
                            <div style={{ fontWeight: 600, color: colors.textPrimary }}>
                              {ord.items.map((i) => `${i.title} (${i.count} шт.)`).join(', ')}
                            </div>
                            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                              Способ: {ord.tableNumber}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: 14, color: colors.textPrimary }}>
                              {ord.totalAmount} ₽
                            </div>
                            <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700 }}>
                              Оплачено
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6, borderTop: `1px solid ${colors.cardBorder}` }}>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderTicket(ord)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 8,
                              border: `1px solid ${colors.cardBorder}`,
                              background: colors.slotBg,
                              color: colors.accentColor,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <QrCode size={13} />
                            <span>Показать QR-код и талон</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Меню столовой на сегодня */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Utensils size={15} color={colors.accentColor} />
                  <span>Меню лицейской столовой (Обед 12:15):</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFoodOrderModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.accentColor,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>Заказать из меню</span>
                  <ChevronRight size={13} />
                </button>
              </div>
              <div style={{ background: colors.slotBg, borderRadius: 12, padding: 14, fontSize: 13, color: colors.textSecondary, lineHeight: 1.6, border: `1px solid ${colors.cardBorder}` }}>
                • Суп куриный с домашней вермишелью (250 г) — 65 ₽<br />
                • Котлета по-киевски с картофельным пюре (180 г) — 110 ₽<br />
                • Салат из свежих огурцов с оливковым маслом (100 г) — 45 ₽<br />
                • Чай с сахаром и лимоном (250 мл) — 25 ₽<br />
                • Булочка с маком (собственная выпечка ЛИТ) — 45 ₽
              </div>
            </div>

            {/* История списаний и пополнений */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: colors.textPrimary, marginBottom: 8 }}>
                История операций «Кенгу.Детям»:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {kenguHistory.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12.5
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: colors.textPrimary }}>
                        {tx.title}
                      </div>
                      <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                        {tx.date}
                      </div>
                    </div>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        color: tx.type === 'topup' ? '#10b981' : colors.textPrimary
                      }}
                    >
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Журнал турникетов СКУД */}
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 20,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.04)' : '0 4px 24px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary }}>
              История проходов через СКУД (Турникеты)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { date: 'Сегодня, 12 фев', time: '08:14:22', type: 'Вход', post: 'Главный вход (Турникет №2)', status: 'ok' },
                { date: 'Вчера, 11 фев', time: '14:32:05', type: 'Выход', post: 'Главный вход (Турникет №1)', status: 'out' },
                { date: 'Вчера, 11 фев', time: '08:16:11', type: 'Вход', post: 'Главный вход (Турникет №2)', status: 'ok' },
                { date: '10 фев', time: '14:35:50', type: 'Выход', post: 'Главный вход (Турникет №1)', status: 'out' },
                { date: '10 фев', time: '08:12:04', type: 'Вход', post: 'Главный вход (Турникет №3)', status: 'ok' }
              ].map((ev, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 13
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: colors.textPrimary }}>
                      {ev.type} • {ev.time}
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      {ev.post}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: ev.type === 'Вход' ? colors.emeraldSoft : colors.slotBg,
                      color: ev.type === 'Вход' ? '#10b981' : colors.textMuted
                    }}
                  >
                    {ev.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          9. ВКЛАДКА 7: ОЛИМПИАДЫ И ПОРТФОЛИО (PORTFOLIO)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'portfolio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 20,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary }}>
              Олимпиадные достижения и ВсОШ • Портфолио
            </div>
            <div className="responsive-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {[
                { title: 'ВсОШ по Информатике • Школьный этап', place: '1 место (Победитель)', points: '100 / 100 баллов', date: 'Октябрь 2026', cert: 'Диплом №ВСОШ-54-098' },
                { title: 'ВсОШ по Математике • Школьный этап', place: 'Призёр (2 место)', points: '86 / 100 баллов', date: 'Октябрь 2026', cert: 'Грамота №МАТ-54-112' },
                { title: 'Региональный хакатон IT-Куб (Python)', place: '1 место в треке Data Science', points: 'Проект «Цифровой помощник»', date: 'Ноябрь 2026', cert: 'Диплом победителя' }
              ].map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    background: colors.slotBg,
                    border: `1px solid ${colors.cardBorder}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: colors.textPrimary }}>
                      {p.title}
                    </span>
                    <Trophy size={16} color="#f59e0b" />
                  </div>
                  <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>
                    {p.place} • {p.points}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted }}>
                    {p.date} • {p.cert}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          МОДАЛКА: СДАЧА ДОМАШНЕГО ЗАДАНИЯ
      ───────────────────────────────────────────────────────────────────────────── */}
      {submissionModalItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
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
              borderRadius: 20,
              maxWidth: 540,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary }}>
                  Сдача домашнего задания
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  {submissionModalItem.subject} • Преподаватель: {submissionModalItem.teacher}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionModalItem(null)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: colors.slotBg, borderRadius: 12, padding: 12, fontSize: 12.5, color: colors.textSecondary, border: `1px solid ${colors.cardBorder}` }}>
              <strong>Задание:</strong> {submissionModalItem.title}
              <div style={{ marginTop: 4, color: colors.textMuted }}>{submissionModalItem.description}</div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary, display: 'block', marginBottom: 6 }}>
                Комментарий учителю / Ход решения:
              </label>
              <textarea
                value={submissionComment}
                onChange={(e) => setSubmissionComment(e.target.value)}
                placeholder="Опишите, как решали задачу, какие возникли вопросы или приложите ссылку..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${colors.cardBorder}`,
                  background: colors.cardBg,
                  color: colors.textPrimary,
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary, display: 'block', marginBottom: 6 }}>
                Прикреплённые файлы с решением:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {submissionFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: colors.slotBg,
                      border: `1px solid ${colors.cardBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12
                    }}
                  >
                    <span>📎 {file}</span>
                    <X
                      size={14}
                      style={{ cursor: 'pointer', color: colors.textMuted }}
                      onClick={() => setSubmissionFiles((prev) => prev.filter((_, i) => i !== idx))}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionFiles((prev) => [...prev, `фото_тетради_стр_${Math.floor(Math.random() * 50 + 10)}.jpg (3.1 МБ)`]);
                      toast.info('Фото разворота тетради добавлено', 'Вложение');
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: `1px dashed ${colors.accentColor}`,
                      background: colors.accentSoft,
                      color: colors.accentColor,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Добавить фото тетради
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionFiles((prev) => [...prev, 'код_программы_solution.py (4 КБ)']);
                      toast.info('Файл с кодом добавлен', 'Вложение');
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: `1px dashed ${colors.cardBorder}`,
                      background: colors.slotBg,
                      color: colors.textSecondary,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Файл Python (.py)
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setSubmissionModalItem(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  border: `1px solid ${colors.cardBorder}`,
                  background: 'transparent',
                  color: colors.textSecondary,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSubmitHomework}
                style={{
                  padding: '9px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: colors.accentColor,
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <UploadCloud size={15} />
                <span>Отправить учителю</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          МОДАЛКА: ПОПОЛНЕНИЕ КАРТЫ ПИТАНИЯ «КЕНГУ ДЕТЯМ»
      ───────────────────────────────────────────────────────────────────────────── */}
      {isKenguModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
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
              borderRadius: 22,
              maxWidth: 480,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#007aff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                  К
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: colors.textPrimary }}>
                    Пополнение «Кенгу.Детям»
                  </div>
                  <div style={{ fontSize: 12, color: colors.textMuted }}>
                    Лицевой счёт: 5401 3110 8842 (Иванов И.Д., 9А)
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKenguModalOpen(false)}
                style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Выбор суммы */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Выберите сумму пополнения:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[300, 500, 1000, 1500, 2000].map((amt) => {
                  const active = !customKenguAmount && kenguAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setKenguAmount(amt);
                        setCustomKenguAmount('');
                      }}
                      style={{
                        padding: '10px 0',
                        borderRadius: 10,
                        border: active ? `2px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                        background: active ? colors.accentSoft : colors.slotBg,
                        color: active ? colors.accentColor : colors.textPrimary,
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {amt} ₽
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 10 }}>
                <input
                  type="number"
                  value={customKenguAmount}
                  onChange={(e) => setCustomKenguAmount(e.target.value)}
                  placeholder="Или введите другую сумму (₽)..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.cardBg,
                    color: colors.textPrimary,
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Способ оплаты */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Способ оплаты:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { id: 'sbp', title: 'СБП (Система быстрых платежей)', desc: '0% комиссии • Мгновенное зачисление', badge: 'Рекомендуется' },
                  { id: 'card', title: 'Банковская карта (МИР / Сбер / Т-Банк)', desc: 'Безопасная оплата 3D-Secure', badge: 'Без комиссии' },
                  { id: 'sberpay', title: 'SberPay / СберБанк Онлайн', desc: 'В 1 клик через приложение', badge: '' },
                  { id: 'tpay', title: 'T-Pay / Т-Банк', desc: 'Моментальная оплата', badge: '' }
                ].map((m) => {
                  const active = kenguPaymentMethod === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setKenguPaymentMethod(m.id as any)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: active ? `2px solid ${colors.accentColor}` : `1px solid ${colors.cardBorder}`,
                        background: active ? colors.accentSoft : colors.slotBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: colors.textPrimary }}>
                          {m.title}
                        </div>
                        <div style={{ fontSize: 11, color: colors.textMuted }}>
                          {m.desc}
                        </div>
                      </div>
                      {m.badge && (
                        <span style={{ fontSize: 10, fontWeight: 800, background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: 6 }}>
                          {m.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Кнопка оплаты */}
            <button
              type="button"
              onClick={handleTopupKengu}
              disabled={isKenguProcessing}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 800,
                cursor: isKenguProcessing ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(0, 122, 255, 0.35)'
              }}
            >
              {isKenguProcessing ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Связь с банком-эквайером и СБП...</span>
                </>
              ) : (
                <>
                  <QrCode size={18} />
                  <span>
                    Оплатить {(customKenguAmount ? parseFloat(customKenguAmount) || 0 : kenguAmount).toLocaleString('ru-RU')} ₽ через СБП
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          11. МОДАЛЬНОЕ ОКНО: ЗАКАЗ ЕДЫ НА ПЕРЕМЕНУ В ЭПЛ СТИЛЕ (FOOD PRE-ORDER)
      ───────────────────────────────────────────────────────────────────────────── */}
      {isFoodOrderModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.68)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 20px'
          }}
        >
          <div
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 24,
              maxWidth: 720,
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: 24,
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18
            }}
          >
            {/* Заголовок в стиле Apple macOS / iPadOS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: `1px solid ${colors.cardBorder}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0, 122, 255, 0.35)' }}>
                  <Utensils size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: colors.textPrimary, letterSpacing: -0.3 }}>
                    Заказ еды на перемену • Столовая ЛИТ
                  </div>
                  <div style={{ fontSize: 12, color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Карта «Кенгу.Детям»:</span>
                    <strong style={{ color: colors.accentColor }}>{kenguBalance.toLocaleString('ru-RU')},00 ₽</strong>
                    <span>• Иванов И.Д. (9А)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFoodOrderModalOpen(false)}
                style={{
                  width: 34,
                  height: 34,
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
                <X size={18} />
              </button>
            </div>

            {/* ШАГ 1: ВЫБОР КОНКРЕТНОЙ ПЕРЕМЕНЫ */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  1. На какую перемену приготовить:
                </label>
                <span style={{ fontSize: 11, color: colors.accentColor, fontWeight: 700 }}>
                  ⏰ Точно к звонку
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: 6 }}>
                {BREAK_SLOTS.map((b) => {
                  const isSelected = selectedBreakId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBreakId(b.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 14,
                        border: isSelected ? '2px solid #007aff' : `1px solid ${colors.cardBorder}`,
                        background: isSelected ? colors.accentSoft : colors.slotBg,
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 12.5, color: isSelected ? colors.accentColor : colors.textPrimary }}>
                          {b.name.replace(' перемена', '')}
                        </span>
                        {b.isMajor && (
                          <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: '#f59e0b', padding: '1px 4px', borderRadius: 4 }}>
                            Обед
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: isSelected ? colors.textPrimary : colors.textMuted }}>
                        {b.time.split(' – ')[0]}
                      </span>
                      <span style={{ fontSize: 9.5, color: colors.textMuted }}>
                        {b.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ШАГ 2: СПОСОБ ПОЛУЧЕНИЯ БЛЮД */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                2. Способ подачи в столовой:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div
                  onClick={() => setPickupMethod('table')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: pickupMethod === 'table' ? '2px solid #007aff' : `1px solid ${colors.cardBorder}`,
                    background: pickupMethod === 'table' ? colors.accentSoft : colors.slotBg,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: pickupMethod === 'table' ? '#007aff' : colors.cardBg, color: pickupMethod === 'table' ? '#fff' : colors.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Utensils size={17} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: pickupMethod === 'table' ? colors.accentColor : colors.textPrimary }}>
                      Накрыть на Стол №4 (9А)
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 1.3 }}>
                      Горячие блюда будут сервированы на закреплённый стол к первой минуте перемены (без очередей)
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPickupMethod('express')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: pickupMethod === 'express' ? '2px solid #007aff' : `1px solid ${colors.cardBorder}`,
                    background: pickupMethod === 'express' ? colors.accentSoft : colors.slotBg,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: pickupMethod === 'express' ? '#007aff' : colors.cardBg, color: pickupMethod === 'express' ? '#fff' : colors.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShoppingBag size={17} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: pickupMethod === 'express' ? colors.accentColor : colors.textPrimary }}>
                      Экспресс-выдача (Стойка №1)
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 1.3 }}>
                      Забрать горячий упакованный заказ по QR-коду за 15 секунд в любое время перемены
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ШАГ 3: ФИЛЬТР КАТЕГОРИЙ И МЕНЮ БЛЮД */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  3. Выберите блюда из меню столовой:
                </label>
                {totalCartCount > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 800, color: colors.accentColor }}>
                    Выбрано: {totalCartCount} шт. • {totalCartPrice} ₽
                  </span>
                )}
              </div>

              {/* Категории блюд (Apple Pill Bar) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
                {[
                  { id: 'all', label: 'Все блюда', icon: '🍽' },
                  { id: 'hot', label: 'Горячее & Комплексы', icon: '🍲' },
                  { id: 'bakery', label: 'Выпечка ЛИТ', icon: '🥐' },
                  { id: 'salads', label: 'Салаты & Овощи', icon: '🥗' },
                  { id: 'drinks', label: 'Напитки & Морсы', icon: '🧃' },
                  { id: 'healthy', label: 'ЗОЖ & Снеки', icon: '🍎' }
                ].map((cat) => {
                  const active = foodCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFoodCategory(cat.id as any)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 18,
                        border: active ? '1.5px solid #007aff' : `1px solid ${colors.cardBorder}`,
                        background: active ? '#007aff' : colors.slotBg,
                        color: active ? '#ffffff' : colors.textPrimary,
                        fontWeight: active ? 700 : 500,
                        fontSize: 12,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Сетка блюд */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, maxHeight: 320, overflowY: 'auto', paddingRight: 4, marginTop: 8 }}>
                {CANTEEN_MENU.filter((m) => foodCategory === 'all' || m.category === foodCategory).map((item) => {
                  const count = foodCart[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        background: colors.cardBg,
                        border: count > 0 ? '1.5px solid #007aff' : `1px solid ${colors.cardBorder}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 10,
                        boxShadow: count > 0 ? '0 4px 14px rgba(0, 122, 255, 0.12)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: colors.slotBg, border: `1px solid ${colors.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                          {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                            <span style={{ fontWeight: 800, fontSize: 13, color: colors.textPrimary, lineHeight: 1.25 }}>
                              {item.title}
                            </span>
                            {item.badge && (
                              <span style={{ fontSize: 9, fontWeight: 700, background: colors.emeraldSoft, color: '#10b981', padding: '1px 5px', borderRadius: 5, flexShrink: 0 }}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.description}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 10.5, color: colors.textMuted }}>
                            <span>⚖️ {item.weight}</span>
                            <span>•</span>
                            <span>🔥 {item.calories}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: `1px solid ${colors.cardBorder}` }}>
                        <div style={{ fontWeight: 900, fontSize: 15, color: colors.textPrimary }}>
                          {item.price} ₽
                        </div>
                        {count === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 10,
                              border: 'none',
                              background: colors.slotBg,
                              color: colors.accentColor,
                              fontWeight: 800,
                              fontSize: 12,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Plus size={14} />
                            <span>В заказ</span>
                          </button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: colors.accentSoft, borderRadius: 10, padding: 3 }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.id)}
                              style={{ width: 26, height: 26, borderRadius: 8, border: 'none', background: '#ffffff', color: colors.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <Minus size={13} />
                            </button>
                            <span style={{ fontWeight: 800, fontSize: 13, color: colors.accentColor, minWidth: 18, textAlign: 'center' }}>
                              {count}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(item.id)}
                              style={{ width: 26, height: 26, borderRadius: 8, border: 'none', background: '#007aff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ПОЖЕЛАНИЕ ПОВАРАМ */}
            <div>
              <input
                type="text"
                value={kitchenComment}
                onChange={(e) => setKitchenComment(e.target.value)}
                placeholder="Пожелание поварам (например: без лука, погорячее, чай без сахара)..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
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

            {/* ИТОГОВАЯ ПАНЕЛЬ ОПЛАТЫ КАРТОЙ КЕНГУ.ДЕТЯМ (APPLE PAY СТИЛЬ) */}
            <div style={{ background: colors.slotBg, borderRadius: 16, padding: '14px 18px', border: `1px solid ${colors.cardBorder}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.textSecondary }}>
                  <Clock size={15} color={colors.accentColor} />
                  <span>К звонку на {(BREAK_SLOTS.find((b) => b.id === selectedBreakId) || BREAK_SLOTS[3]).name} ({(BREAK_SLOTS.find((b) => b.id === selectedBreakId) || BREAK_SLOTS[3]).time})</span>
                </div>
                <div style={{ fontWeight: 800, color: colors.textPrimary, fontSize: 14 }}>
                  {totalCartCount} {totalCartCount === 1 ? 'блюдо' : totalCartCount < 5 ? 'блюда' : 'блюд'} • {totalCartPrice} ₽
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: colors.textMuted }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Wallet size={14} />
                  <span>Баланс карты «Кенгу.Детям»:</span>
                </div>
                <span style={{ fontWeight: 700, color: kenguBalance >= totalCartPrice ? '#10b981' : '#ef4444' }}>
                  {kenguBalance.toLocaleString('ru-RU')} ₽ {kenguBalance >= totalCartPrice ? `(останется ${(kenguBalance - totalCartPrice).toLocaleString('ru-RU')} ₽)` : `(не хватает ${(totalCartPrice - kenguBalance).toLocaleString('ru-RU')} ₽)`}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {totalCartCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCart}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: `1px solid ${colors.cardBorder}`,
                      background: colors.cardBg,
                      color: colors.textMuted,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Очистить корзину"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePlaceFoodOrder}
                  disabled={isFoodOrderProcessing || totalCartCount === 0}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: 14,
                    border: 'none',
                    background: totalCartCount === 0 ? colors.slotBg : 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
                    color: totalCartCount === 0 ? colors.textMuted : '#ffffff',
                    fontWeight: 800,
                    fontSize: 14.5,
                    cursor: totalCartCount === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: totalCartCount > 0 ? '0 4px 18px rgba(0, 122, 255, 0.35)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isFoodOrderProcessing ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      <span>Отправка заказа на кухню столовой...</span>
                    </>
                  ) : totalCartCount === 0 ? (
                    <span>Выберите блюда для заказа</span>
                  ) : kenguBalance < totalCartPrice ? (
                    <span>Пополнить баланс и оплатить {totalCartPrice} ₽</span>
                  ) : (
                    <>
                      <Utensils size={18} />
                      <span>Оплатить {totalCartPrice} ₽ картой «Кенгу.Детям»</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          12. ЭЛЕКТРОННЫЙ ТАЛОН ПРЕДЗАКАЗА (APPLE WALLET PASS СТИЛЬ)
      ───────────────────────────────────────────────────────────────────────────── */}
      {selectedOrderTicket && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 10001,
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
              maxWidth: 440,
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Верхний градиентный бейдж в стиле Apple Wallet Pass */}
            <div
              style={{
                background: 'linear-gradient(135deg, #007aff 0%, #004ecc 100%)',
                color: '#ffffff',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, opacity: 0.85, textTransform: 'uppercase' }}>
                  МАОУ ЛИТ • СТОЛОВАЯ
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 6 }}>
                  Кенгу.Детям
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Талон предзаказа к перемене</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>
                    {selectedOrderTicket.orderNumber}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Сумма заказа</div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>{selectedOrderTicket.totalAmount} ₽</div>
                </div>
              </div>
            </div>

            {/* Тело талона с QR-кодом */}
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* QR-код для сканирования на кассе столовой */}
              <div
                style={{
                  background: '#ffffff',
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                }}
              >
                <QrCode size={110} color="#0f172a" />
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b', letterSpacing: 1.5, fontWeight: 700 }}>
                  {selectedOrderTicket.qrCodeToken}
                </div>
                <span style={{ fontSize: 11, color: '#007aff', fontWeight: 700 }}>
                  ● Сканируйте на кассе или покажите дежурному
                </span>
              </div>

              {/* Детали заказа в стиле Apple iOS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                <div style={{ background: colors.slotBg, padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.cardBorder}` }}>
                  <div style={{ color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>Перемена</div>
                  <div style={{ fontWeight: 800, color: colors.textPrimary, marginTop: 2 }}>{selectedOrderTicket.breakName}</div>
                </div>
                <div style={{ background: colors.slotBg, padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.cardBorder}` }}>
                  <div style={{ color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>Подача</div>
                  <div style={{ fontWeight: 800, color: colors.textPrimary, marginTop: 2 }}>{selectedOrderTicket.tableNumber}</div>
                </div>
                <div style={{ background: colors.slotBg, padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.cardBorder}` }}>
                  <div style={{ color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>Ученик</div>
                  <div style={{ fontWeight: 800, color: colors.textPrimary, marginTop: 2 }}>Иванов И.Д. (9А)</div>
                </div>
                <div style={{ background: colors.slotBg, padding: '10px 12px', borderRadius: 12, border: `1px solid ${colors.cardBorder}` }}>
                  <div style={{ color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>Статус</div>
                  <div style={{ fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>{selectedOrderTicket.statusLabel}</div>
                </div>
              </div>

              {/* Список блюд */}
              <div style={{ background: colors.slotBg, padding: 12, borderRadius: 12, border: `1px solid ${colors.cardBorder}` }}>
                <div style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                  Состав предзаказа:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selectedOrderTicket.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                      <span style={{ color: colors.textPrimary, fontWeight: 600 }}>• {it.title} × {it.count}</span>
                      <span style={{ color: colors.textSecondary, fontWeight: 700 }}>{it.price * it.count} ₽</span>
                    </div>
                  ))}
                  {selectedOrderTicket.comment && (
                    <div style={{ fontSize: 11, color: colors.accentColor, marginTop: 4, fontStyle: 'italic' }}>
                      Пожелание: «{selectedOrderTicket.comment}»
                    </div>
                  )}
                </div>
              </div>

              {/* Кнопки закрытия */}
              <button
                type="button"
                onClick={() => setSelectedOrderTicket(null)}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #007aff 0%, #0056d6 100%)',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)'
                }}
              >
                Закрыть талон
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
