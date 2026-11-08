import type { DemoPersona, User } from '../../types/auth';

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'losiv',
    role: 'class_teacher',
    fullName: 'Лосив Роман Борисович',
    shortName: 'Лосив Р.Б.',
    roleTitle: 'Классный руководитель 9А • Учитель математики',
    subject: 'Математика / Алгебра и Геометрия',
    assignedClass: '9А',
    classroom: '311',
    school: 'МАОУ ЛИТ г. Новосибирска',
    email: 'losiv@maou-lit.ru',
    sferumUserId: 'sferum_teacher_1',
    badge: 'Основная роль • Классрук',
    badgeColor: '#2d82ec',
    features: [
      'Живой локатор школы и занятость каб. 311',
      'Приемная 9А: заявления родителей с фото подписи',
      'Печать проверочных карточек на А4 (без телефонов)',
      'Адресный директ в личный чат-бот ученика',
      'SOS-тикеты завхозу в 1 клик'
    ],
    description: 'Полный рабочий день педагога и классного руководителя. Управление уроками, заявлениями и печать раздаточных материалов на урок.',
    recommendedFor: 'Оценка основного пользовательского сценария учителя'
  },
  {
    id: 'gromova',
    role: 'zavuch',
    fullName: 'Громова Александра Сергеевна',
    shortName: 'Громова А.С.',
    roleTitle: 'Заместитель директора по УВР (Завуч)',
    subject: 'Учебно-воспитательная работа',
    assignedClass: null,
    classroom: '201 (Учительская)',
    school: 'МАОУ ЛИТ г. Новосибирска',
    email: 'gromova@maou-lit.ru',
    sferumUserId: 'sferum_zavuch_1',
    badge: 'Администрация школы',
    badgeColor: '#8b5cf6',
    features: [
      'Сводный мониторинг пропусков и больничных по всей параллели',
      'Официальный экспорт реестра заявлений в PDF с ЭЦП',
      'Контроль замен и оперативный перенос уроков',
      'Надзор исполнения заявок на ремонт оборудования'
    ],
    description: 'Управление школой: сводный табель пропусков, перенос уроков и оперативная отчетность завуча.',
    recommendedFor: 'Проверка административной отчетности и сводок'
  },
  {
    id: 'sidorov',
    role: 'staff',
    fullName: 'Сидоров Виктор Павлович',
    shortName: 'Сидоров В.П.',
    roleTitle: 'Заместитель директора по АХЧ (Завхоз / Инженер)',
    subject: 'Административно-хозяйственная часть',
    assignedClass: null,
    classroom: 'Мастерская / АХЧ',
    school: 'МАОУ ЛИТ г. Новосибирска',
    email: 'sidorov@maou-lit.ru',
    sferumUserId: 'sferum_staff_1',
    badge: 'Техническая служба',
    badgeColor: '#f59e0b',
    features: [
      'Мгновенный прием SOS-тикетов от учителей из кабинетов',
      'Управление статусами ремонта (Проекторы NEC, лампы, стулья)',
      'Учет расходных материалов и заправка картриджей',
      'Технический паспорт и готовность кабинетов'
    ],
    description: 'Хозяйственная и инженерная служба. Мгновенная реакция на сбои техники во время уроков без бумажных заявлений.',
    recommendedFor: 'Демонстрация оперативного устранения неполадок'
  },
  {
    id: 'ivanov',
    role: 'student',
    fullName: 'Иванов Иван',
    shortName: 'Иванов И.',
    roleTitle: 'Обучающийся 9А класса',
    subject: '9А класс',
    assignedClass: '9А',
    classroom: '311',
    school: 'МАОУ ЛИТ г. Новосибирска',
    email: 'ivanov@lit.ru',
    sferumUserId: 'sferum_student_1',
    badge: 'Обучающийся',
    badgeColor: '#10b981',
    features: [
      'Статус больничного листа и заявления от родителей',
      'Адресное расписание уроков и кабинетов (каб. 311)',
      'Уведомления «Анти-Хвост»: дата пересдачи лабораторной',
      'Защищенный просмотр без отвлекающих соцсетей'
    ],
    description: 'Личный кабинет школьника. Получение персональных назначений на консультации и пересдачи от классного руководителя.',
    recommendedFor: 'Проверка обратной связи ученика и push-уведомлений'
  }
];

export const SCHOOLS_LIST = [
  { id: 'lit', name: 'МАОУ ЛИТ г. Новосибирска', code: '54-001' },
  { id: 'gym1', name: 'МБОУ Гимназия №1 г. Новосибирска', code: '54-002' },
  { id: 'lic130', name: 'МБОУ Лицей №130 им. Лаврентьева', code: '54-003' },
  { id: 'sch216', name: 'МАОУ СОШ №216 г. Новосибирска', code: '54-004' },
  { id: 'gym2', name: 'Вторая Новосибирская Гимназия', code: '54-005' },
  { id: 'sch9', name: 'Лицей НГТУ г. Новосибирска', code: '54-006' }
];

export function personaToUser(persona: DemoPersona, authMethod: 'demo' | 'sferum_id' | 'snils' | 'esia' = 'demo'): User {
  return {
    id: persona.id === 'losiv' ? 1 : persona.id === 'gromova' ? 2 : persona.id === 'sidorov' ? 3 : 5,
    fullName: persona.fullName,
    shortName: persona.shortName,
    role: persona.role,
    roleTitle: persona.roleTitle,
    subject: persona.subject,
    assignedClass: persona.assignedClass,
    school: persona.school,
    email: persona.email,
    sferumUserId: persona.sferumUserId,
    authMethod
  };
}
