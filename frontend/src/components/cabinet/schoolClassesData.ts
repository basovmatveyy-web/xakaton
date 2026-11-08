export interface StudentRecord {
  id: number;
  name: string;
  gender: 'M' | 'F';
  birthDate: string;
  statusToday: 'present' | 'sick' | 'olympiad' | 'excused' | 'unexcused';
  statusReason?: string;
  averageGrade: number;
  recentGrades: number[];
  parentName: string;
  parentRelation: string;
  parentPhone: string;
  notes?: string;
  address?: string;
}

export interface SchoolClass {
  id: string; // '9А', '10Б', '11А', '8Б', etc.
  name: string;
  role: string;
  room: string;
  leaderTeacher: string;
  studentsCount: number;
  students: StudentRecord[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ВСЕ 28 КЛАССОВ МАОУ ЛИТ (г. Новосибирск) ПО ОФИЦИАЛЬНОЙ СЕТКЕ РАСПИСАНИЯ
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_SCHOOL_CLASS_IDS = [
  '5А', '5Б', '5В', '5Г',
  '6А', '6Б', '6В', '6Г',
  '7А', '7Б', '7В', '7И', '7Л',
  '8А', '8Б', '8И', '8Л',
  '9А', '9Б', '9В', '9Г', '9И',
  '10А', '10Б', '10В', '10И',
  '11А', '11И'
] as const;

export type SchoolClassId = typeof ALL_SCHOOL_CLASS_IDS[number];

// Справочник классных руководителей и кабинетов
const CLASS_TEACHERS_MAP: Record<string, { teacher: string; room: string; role: string }> = {
  '9А': { teacher: 'Лосив Роман Борисович', room: 'Кабинет 311', role: 'Классное руководство' },
  '10Б': { teacher: 'Лосив Роман Борисович', room: 'Кабинет 311', role: 'Информатика и ИКТ' },
  '11А': { teacher: 'Лосив Роман Борисович', room: 'Кабинет 311', role: 'Профиль IT' },
  '8Б': { teacher: 'Лосив Роман Борисович', room: 'Кабинет 311', role: 'Информатика и программирование' },
  '9Б': { teacher: 'Смирнова Елена Васильевна', room: 'Кабинет 108', role: 'Информатика и ИКТ' },
  '10А': { teacher: 'Кузнецов Андрей Павлович', room: 'Кабинет 204', role: 'Физмат IT' },
  '11И': { teacher: 'Лосив Роман Борисович', room: 'Кабинет 311', role: 'Информатика КЕГЭ' },
  '7А': { teacher: 'Морозова Ольга Игоревна', room: 'Кабинет 211', role: 'Базовый курс алгоритмики' },
  '7И': { teacher: 'Лосив Роман Борисович', room: 'Кабинет 311', role: 'IT-вертикаль' },
  '6А': { teacher: 'Григорьева Надежда Семеновна', room: 'Кабинет 205', role: 'Робототехника и логика' },
  '5А': { teacher: 'Васильева Екатерина Николаевна', room: 'Кабинет 105', role: 'Введение в цифровой мир' },
  '5Б': { teacher: 'Миронова Ксения Владимировна', room: 'Кабинет 304', role: 'Информатика (младшие)' },
  '5В': { teacher: 'Белова Татьяна Сергеевна', room: 'Кабинет 315', role: 'Информатика (младшие)' },
  '5Г': { teacher: 'Ковалев Сергей Иванович', room: 'Кабинет 121', role: 'Информатика (младшие)' },
  '6Б': { teacher: 'Федоров Денис Михайлович', room: 'Кабинет 212', role: 'Основы алгоритмов' },
  '6В': { teacher: 'Павлова Мария Викторовна', room: 'Кабинет 114', role: 'Основы алгоритмов' },
  '6Г': { teacher: 'Степанов Илья Олегович', room: 'Кабинет 312', role: 'Основы алгоритмов' },
  '7Б': { teacher: 'Николаева Анна Юрьевна', room: 'Кабинет 306', role: 'Информатика' },
  '7В': { teacher: 'Орлов Виктор Андреевич', room: 'Кабинет 111', role: 'Информатика' },
  '7Л': { teacher: 'Борисова Светлана Петровна', room: 'Кабинет 105', role: 'Лингво-IT' },
  '8А': { teacher: 'Захаров Константин Павлович', room: 'Кабинет 112', role: 'Программирование Python' },
  '8И': { teacher: 'Лосив Роман Борисович', room: 'Кабинет 311', role: 'IT-класс (интенсив)' },
  '8Л': { teacher: 'Алексеева Дарья Владимировна', room: 'Кабинет 308', role: 'Информатика' },
  '9В': { teacher: 'Семенов Артем Игоревич', room: 'Кабинет 116', role: 'Информатика ОГЭ' },
  '9Г': { teacher: 'Егорова Ирина Геннадьевна', room: 'Кабинет 305', role: 'Информатика ОГЭ' },
  '9И': { teacher: 'Лосив Роман Борисович', room: 'Кабинет 311', role: 'IT-лицей ОГЭ' },
  '10В': { teacher: 'Дмитриев Николай Сергеевич', room: 'Кабинет 207', role: 'Информатика' },
  '10И': { teacher: 'Лосив Роман Борисович', room: 'Кабинет 311', role: 'Углубленная информатика' }
};

// Банк реалистичных ФИО и данных для Новосибирска
const SURNAMES_M = [
  'Астахов', 'Баранов', 'Григорьев', 'Дмитриев', 'Жуков', 'Иванов', 'Ковалев',
  'Медведев', 'Новиков', 'Орлов', 'Павлов', 'Романов', 'Смирнов', 'Тарасов',
  'Устинов', 'Федоров', 'Харитонов', 'Цветков', 'Чернов', 'Шестаков', 'Щукин',
  'Юдин', 'Яковлев', 'Аверин', 'Богданов', 'Волков', 'Голубев', 'Дроздов',
  'Ерохин', 'Зайцев', 'Зиновьев', 'Казанцев', 'Колесников', 'Королев', 'Лазарев'
];

const NAMES_M = [
  'Владислав', 'Максим', 'Никита', 'Егор', 'Артем', 'Иван', 'Дмитрий',
  'Михаил', 'Александр', 'Матвей', 'Тимофей', 'Ярослав', 'Даниил', 'Кирилл',
  'Арсений', 'Платон', 'Роман', 'Глеб', 'Илья', 'Марк', 'Константин'
];

const SURNAMES_F = [
  'Астахова', 'Баранова', 'Васильева', 'Григорьева', 'Дмитриева', 'Елисеева',
  'Иванова', 'Ильина', 'Козлова', 'Морозова', 'Новикова', 'Орлова', 'Павлова',
  'Романова', 'Смирнова', 'Тарасова', 'Устинова', 'Федорова', 'Чернова',
  'Киселева', 'Белова', 'Григорьева', 'Миронова', 'Сорокина', 'Полякова'
];

const NAMES_F = [
  'Дарья', 'Полина', 'София', 'Виктория', 'Анастасия', 'Екатерина',
  'Мария', 'Анна', 'Алиса', 'Ксения', 'Вероника', 'Арина', 'Елизавета',
  'Диана', 'Ольга', 'Светлана', 'Татьяна', 'Елена'
];

const STREETS_NSK = [
  'Красный проспект', 'ул. Ленина', 'ул. Советская', 'ул. Сибирская',
  'ул. Гоголя', 'ул. Фрунзе', 'ул. Державина', 'ул. Нарымская',
  'ул. Челюскинцев', 'ул. Орджоникидзе', 'ул. Мичурина', 'ул. Крылова',
  'ул. Семьи Шамшиных', 'ул. Каменская', 'ул. Депутатская', 'ул. Щетинкина',
  'ул. Горького', 'ул. Чаплыгина', 'ул. Октябрьская', 'ул. Коммунистическая',
  'ул. Свердлова', 'ул. Спартака', 'ул. Серебренниковская', 'ул. Урицкого',
  'ул. Революции', 'ул. 1905 года', 'Вокзальная магистраль'
];

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Генератор полного класса
function generateClassRoster(classId: string, count: number = 26): SchoolClass {
  const meta = CLASS_TEACHERS_MAP[classId] || {
    teacher: 'Лосив Роман Борисович',
    room: 'Кабинет 311',
    role: 'Информатика и ИКТ'
  };

  const gradeNumber = parseInt(classId, 10) || 9;
  const birthYear = 2026 - gradeNumber - 7; // e.g. 9th grade -> 2010

  const students: StudentRecord[] = [];

  for (let i = 0; i < count; i++) {
    const seed = classId.charCodeAt(0) * 1000 + (classId.charCodeAt(1) || 0) * 100 + i;
    const isMale = pseudoRandom(seed + 1) > 0.45;

    const surname = isMale
      ? SURNAMES_M[(Math.floor(pseudoRandom(seed + 2) * SURNAMES_M.length) + i) % SURNAMES_M.length]
      : SURNAMES_F[(Math.floor(pseudoRandom(seed + 3) * SURNAMES_F.length) + i) % SURNAMES_F.length];

    const name = isMale
      ? NAMES_M[(Math.floor(pseudoRandom(seed + 4) * NAMES_M.length) + i) % NAMES_M.length]
      : NAMES_F[(Math.floor(pseudoRandom(seed + 5) * NAMES_F.length) + i) % NAMES_F.length];

    const day = Math.floor(pseudoRandom(seed + 6) * 28) + 1;
    const month = Math.floor(pseudoRandom(seed + 7) * 12) + 1;
    const birthDate = `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${birthYear}`;

    // Статус посещаемости
    const statusRoll = pseudoRandom(seed + 8);
    let statusToday: StudentRecord['statusToday'] = 'present';
    let statusReason: string | undefined = undefined;

    if (statusRoll > 0.94) {
      statusToday = 'sick';
      statusReason = 'ОРВИ (справка с ' + (day < 10 ? '0' + day : day) + '.11)';
    } else if (statusRoll > 0.89) {
      statusToday = 'excused';
      statusReason = 'Заявление родителей (по семейным обстоятельствам)';
    } else if (statusRoll > 0.86) {
      statusToday = 'olympiad';
      statusReason = 'Участие во ВсОШ';
    }

    // Оценки
    const baseScore = 3.5 + pseudoRandom(seed + 9) * 1.5;
    const averageGrade = parseFloat(baseScore.toFixed(2));
    const recentGrades = [
      Math.min(5, Math.max(3, Math.round(baseScore + (pseudoRandom(seed + 10) - 0.5)))),
      Math.min(5, Math.max(3, Math.round(baseScore + (pseudoRandom(seed + 11) - 0.4)))),
      Math.min(5, Math.max(3, Math.round(baseScore + (pseudoRandom(seed + 12) - 0.3)))),
      Math.min(5, Math.max(3, Math.round(baseScore + (pseudoRandom(seed + 13) - 0.2))))
    ];

    // Родители
    const parentIsMother = pseudoRandom(seed + 14) > 0.35;
    const parentName = parentIsMother
      ? `${surname} ${NAMES_F[(i * 3) % NAMES_F.length]} Сергеевна`
      : `${surname} ${NAMES_M[(i * 3) % NAMES_M.length]} Викторович`;
    const parentRelation = parentIsMother ? 'Мама' : 'Папа';
    const parentPhone = `+7 (${pseudoRandom(seed + 15) > 0.5 ? '913' : '923'}) ${Math.floor(100 + pseudoRandom(seed + 16) * 899)}-${Math.floor(10 + pseudoRandom(seed + 17) * 89)}-${Math.floor(10 + pseudoRandom(seed + 18) * 89)}`;

    const street = STREETS_NSK[(i * 2 + seed) % STREETS_NSK.length];
    const house = Math.floor(pseudoRandom(seed + 19) * 110) + 1;
    const apt = Math.floor(pseudoRandom(seed + 20) * 140) + 1;
    const address = `${street}, д. ${house}, кв. ${apt}`;

    let notes = '';
    if (averageGrade >= 4.8) notes = 'Кандидат на аттестат с отличием / Олимпиадник';
    else if (averageGrade < 4.0) notes = 'Требуется консультация по лабораторной работе';
    else if (i % 7 === 0) notes = 'Проект по информатике (Python)';

    students.push({
      id: i + 1,
      name: `${surname} ${name}`,
      gender: isMale ? 'M' : 'F',
      birthDate,
      statusToday,
      statusReason,
      averageGrade,
      recentGrades,
      parentName,
      parentRelation,
      parentPhone,
      notes,
      address
    });
  }

  // Сортировка по алфавиту фамилии
  students.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  students.forEach((s, idx) => {
    s.id = idx + 1;
  });

  return {
    id: classId,
    name: `${classId} класс`,
    role: meta.role,
    room: meta.room,
    leaderTeacher: meta.teacher,
    studentsCount: students.length,
    students
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ПОЛНАЯ БАЗА ВСЕХ КЛАССОВ ШКОЛЫ (С ПРЕМИАЛЬНЫМИ НАБОРАМИ ДЛЯ ОСНОВНЫХ КЛАССОВ)
// ─────────────────────────────────────────────────────────────────────────────

export const buildFullSchoolClassesRegistry = (): Record<string, SchoolClass> => {
  const registry: Record<string, SchoolClass> = {};

  for (const classId of ALL_SCHOOL_CLASS_IDS) {
    const studentCount = classId.startsWith('11') ? 24 : classId.startsWith('10') ? 26 : classId.startsWith('9') ? 28 : 29;
    registry[classId] = generateClassRoster(classId, studentCount);
  }

  // Для 9А гарантируем ключевых учеников лицея
  if (registry['9А']) {
    registry['9А'].role = 'Классное руководство';
    registry['9А'].leaderTeacher = 'Лосив Роман Борисович';
    registry['9А'].room = 'Кабинет 311';
    // Особый ученик Иванов Иван Денисович (лицеист, персонаж профиля ученика)
    const ivan = registry['9А'].students.find(s => s.name.includes('Иванов'));
    if (ivan) {
      ivan.name = 'Иванов Иван Денисович';
      ivan.notes = 'Староста IT-направления • Проект «Цифровой кабинет»';
      ivan.averageGrade = 4.84;
      ivan.parentName = 'Иванова Ольга Николаевна';
      ivan.parentPhone = '+7 (913) 921-44-12';
    }
  }

  return registry;
};
