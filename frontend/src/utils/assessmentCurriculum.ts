import type { AssessmentVariant, AssessmentTask } from './pdfExport';

export interface SubjectPreset {
  id: string;
  name: string;
  iconName: string;
  topics: {
    id: string;
    title: string;
    grade: string;
    defaultTasksCount: number;
    defaultMinutes: number;
    difficulty: 'Базовый' | 'Стандартный' | 'Повышенный';
    generator: (variantsCount: number, tasksCount: number, difficulty: string) => AssessmentVariant[];
  }[];
}

export const CURRICULUM_PRESETS: SubjectPreset[] = [
  {
    id: 'algebra',
    name: 'Алгебра / Математика',
    iconName: 'Calculator',
    topics: [
      {
        id: 'alg-quad',
        title: 'Квадратные уравнения и теорема Виета',
        grade: '9 класс',
        defaultTasksCount: 3,
        defaultMinutes: 20,
        difficulty: 'Стандартный',
        generator: (vCount, tCount) => {
          // Банк выверенных троек (корни p, q)
          const roots = [
            [-3, 5],
            [-4, 2],
            [1, 6],
            [-5, -2],
            [3, 7],
            [-6, 4]
          ];
          return Array.from({ length: vCount }, (_, idx) => {
            const [r1, r2] = roots[idx % roots.length];
            const b = -(r1 + r2);
            const c = r1 * r2;
            const bStr = b === 0 ? '' : b > 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`;
            const cStr = c === 0 ? '' : c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`;

            const tasks: AssessmentTask[] = [
              {
                num: 1,
                text: 'Решите неполное квадратное уравнение:',
                formula: `2x^2 ${-(idx + 2) * 8} = 0`,
                answer: `x = \\pm ${idx + 2}`,
                solution: `x^2 = ${(idx + 2) ** 2} \\implies x = \\pm ${idx + 2}`
              },
              {
                num: 2,
                text: 'Найдите корни приведенного уравнения через дискриминант или теорему Виета:',
                formula: `x^2 ${bStr} ${cStr} = 0`,
                answer: `x_1 = ${Math.min(r1, r2)}, x_2 = ${Math.max(r1, r2)}`,
                solution: `D = b^2 - 4ac = ${b * b - 4 * c}; x_{1,2} = ${r1}, ${r2}`
              }
            ];

            if (tCount >= 3) {
              const k = idx + 2;
              tasks.push({
                num: 3,
                text: 'Найдите значение параметра или решите дробно-рациональное уравнение:',
                formula: `\\frac{x^2 - ${k * k}}{x - ${k}} = 2x - ${k + 3}`,
                answer: `x = ${k + 3} (при x \\neq ${k})`,
                solution: `ОДЗ: x \\neq ${k}. x + ${k} = 2x - ${k + 3} \\implies x = ${2 * k + 3}`
              });
            }

            if (tCount >= 4) {
              tasks.push({
                num: 4,
                text: 'Определите знаки корней уравнения без его решения по теореме Виета:',
                formula: `3x^2 + ${(idx + 4) * 5}x - 12 = 0`,
                answer: 'Корни разных знаков, больший по модулю — отрицательный',
                solution: 'c/a < 0 \\implies корни разных знаков; -b/a < 0 \\implies отрицательный корень больше по модулю'
              });
            }

            return {
              num: idx + 1,
              tasks: tasks.slice(0, tCount)
            };
          });
        }
      },
      {
        id: 'alg-prog',
        title: 'Арифметическая и геометрическая прогрессии',
        grade: '9 класс',
        defaultTasksCount: 3,
        defaultMinutes: 20,
        difficulty: 'Стандартный',
        generator: (vCount, tCount) => {
          return Array.from({ length: vCount }, (_, idx) => {
            const a1 = 3 + idx * 2;
            const d = 4 + idx;
            const n = 10;
            const an = a1 + (n - 1) * d;
            const sn = ((a1 + an) * n) / 2;

            const tasks: AssessmentTask[] = [
              {
                num: 1,
                text: 'Дана арифметическая прогрессия (a_n), в которой a_1 = ' + a1 + ' и разность d = ' + d + '. Найдите десятый член прогрессии:',
                formula: `a_{10} = ?`,
                answer: `${an}`,
                solution: `a_{10} = a_1 + 9d = ${a1} + 9 \\cdot ${d} = ${an}`
              },
              {
                num: 2,
                text: 'Вычислите сумму первых 10 членов данной арифметической прогрессии:',
                formula: `S_{10} = \\frac{a_1 + a_{10}}{2} \\cdot 10`,
                answer: `${sn}`,
                solution: `S_{10} = \\frac{${a1} + ${an}}{2} \\cdot 10 = ${sn}`
              }
            ];

            if (tCount >= 3) {
              const b1 = idx + 2;
              const q = 2;
              const b5 = b1 * Math.pow(q, 4);
              tasks.push({
                num: 3,
                text: `В геометрической прогрессии (b_n) известно, что b_1 = ${b1}, знаменатель q = ${q}. Найдите пятый член:`,
                formula: `b_5 = b_1 \\cdot q^4`,
                answer: `${b5}`,
                solution: `b_5 = ${b1} \\cdot 2^4 = ${b1} \\cdot 16 = ${b5}`
              });
            }

            if (tCount >= 4) {
              tasks.push({
                num: 4,
                text: 'Найдите номер члена прогрессии, равного числу:',
                formula: `a_n = ${an + d * 3}`,
                answer: `n = 13`,
                solution: `${a1} + (n - 1) \\cdot ${d} = ${an + d * 3} \\implies n = 13`
              });
            }

            return {
              num: idx + 1,
              tasks: tasks.slice(0, tCount)
            };
          });
        }
      },
      {
        id: 'alg-ineq',
        title: 'Системы неравенств и метод интервалов',
        grade: '9 класс',
        defaultTasksCount: 3,
        defaultMinutes: 20,
        difficulty: 'Стандартный',
        generator: (vCount, tCount) => {
          return Array.from({ length: vCount }, (_, idx) => {
            const p1 = idx + 2;
            const p2 = idx + 5;
            const tasks: AssessmentTask[] = [
              {
                num: 1,
                text: 'Решите линейное неравенство и укажите наибольшее целое решение:',
                formula: `3x - ${(idx + 1) * 4} \\leq 5x + ${(idx + 2) * 2}`,
                answer: `x \\geq ${-((idx + 1) * 4 + (idx + 2) * 2) / 2}`,
                solution: `-2x \\leq ${(idx + 1) * 4 + (idx + 2) * 2} \\implies x \\geq ${-((idx + 1) * 4 + (idx + 2) * 2) / 2}`
              },
              {
                num: 2,
                text: 'Решите квадратное неравенство методом интервалов:',
                formula: `(x - ${p1})(x + ${p2}) < 0`,
                answer: `(-${p2}; ${p1})`,
                solution: `Нули функции: x = ${p1}, x = -${p2}. Знаки: + - +. Ответ: x \\in (-${p2}; ${p1})`
              }
            ];

            if (tCount >= 3) {
              tasks.push({
                num: 3,
                text: 'Найдите область определения выражения с корнем:',
                formula: `y = \\sqrt{\\frac{x - ${idx + 1}}{x + ${idx + 4}}}`,
                answer: `(-\\infty; -${idx + 4}) \\cup [${idx + 1}; +\\infty)`,
                solution: `Дробь \\geq 0, знаменатель \\neq 0. Интервалы: (- \\infty; -${idx + 4}) \\cup [${idx + 1}; +\\infty)`
              });
            }

            return {
              num: idx + 1,
              tasks: tasks.slice(0, tCount)
            };
          });
        }
      }
    ]
  },
  {
    id: 'geometry',
    name: 'Геометрия',
    iconName: 'Shapes',
    topics: [
      {
        id: 'geom-pyth',
        title: 'Теорема Пифагора и пропорциональные отрезки',
        grade: '8–9 класс',
        defaultTasksCount: 3,
        defaultMinutes: 20,
        difficulty: 'Стандартный',
        generator: (vCount, tCount) => {
          const triples = [
            { a: 6, b: 8, c: 10 },
            { a: 5, b: 12, c: 13 },
            { a: 9, b: 12, c: 15 },
            { a: 8, b: 15, c: 17 }
          ];

          return Array.from({ length: vCount }, (_, idx) => {
            const tr = triples[idx % triples.length];
            const tasks: AssessmentTask[] = [
              {
                num: 1,
                text: `В прямоугольном треугольнике катеты равны ${tr.a} см и ${tr.b} см. Найдите длину гипотенузы:`,
                formula: `c = \\sqrt{a^2 + b^2}`,
                answer: `${tr.c} см`,
                solution: `c = \\sqrt{${tr.a}^2 + ${tr.b}^2} = \\sqrt{${tr.a * tr.a + tr.b * tr.b}} = ${tr.c} см`
              },
              {
                num: 2,
                text: `Найдите площадь этого прямоугольного треугольника:`,
                formula: `S = \\frac{1}{2} a b`,
                answer: `${(tr.a * tr.b) / 2} см²`,
                solution: `S = 0.5 \\cdot ${tr.a} \\cdot ${tr.b} = ${(tr.a * tr.b) / 2} см²`
              }
            ];

            if (tCount >= 3) {
              const h = ((tr.a * tr.b) / tr.c).toFixed(1);
              tasks.push({
                num: 3,
                text: `Вычислите высоту, проведенную к гипотенузе из вершины прямого угла:`,
                formula: `h_c = \\frac{a \\cdot b}{c}`,
                answer: `${h} см`,
                solution: `h = (a \\cdot b) / c = (${tr.a} \\cdot ${tr.b}) / ${tr.c} = ${h} см`
              });
            }

            if (tCount >= 4) {
              tasks.push({
                num: 4,
                text: `Определите радиус описанной около треугольника окружности:`,
                formula: `R = \\frac{c}{2}`,
                answer: `${tr.c / 2} см`,
                solution: `R = c / 2 = ${tr.c} / 2 = ${tr.c / 2} см`
              });
            }

            return {
              num: idx + 1,
              tasks: tasks.slice(0, tCount)
            };
          });
        }
      },
      {
        id: 'geom-area',
        title: 'Площади многоугольников (треугольник, трапеция)',
        grade: '8–9 класс',
        defaultTasksCount: 3,
        defaultMinutes: 20,
        difficulty: 'Стандартный',
        generator: (vCount, tCount) => {
          return Array.from({ length: vCount }, (_, idx) => {
            const a = 6 + idx * 2;
            const b = 10 + idx * 2;
            const h = 4 + idx;
            const sTrap = ((a + b) / 2) * h;

            const tasks: AssessmentTask[] = [
              {
                num: 1,
                text: `Основания трапеции равны ${a} см и ${b} см, а высота равна ${h} см. Найдите её площадь:`,
                formula: `S = \\frac{a + b}{2} \\cdot h`,
                answer: `${sTrap} см²`,
                solution: `S = ((${a} + ${b}) / 2) \\cdot ${h} = ${sTrap} см²`
              },
              {
                num: 2,
                text: `В параллелограмме сторона равна ${b + 2} см, а проведенная к ней высота равна ${h + 1} см. Вычислите площадь:`,
                formula: `S = a \\cdot h_a`,
                answer: `${(b + 2) * (h + 1)} см²`,
                solution: `S = ${b + 2} \\cdot ${h + 1} = ${(b + 2) * (h + 1)} см²`
              }
            ];

            if (tCount >= 3) {
              tasks.push({
                num: 3,
                text: `Сторона ромба равна ${10 + idx} см, а острый угол равен 30°. Найдите площадь ромба:`,
                formula: `S = a^2 \\sin 30^\\circ`,
                answer: `${((10 + idx) ** 2) / 2} см²`,
                solution: `S = ${10 + idx}^2 \\cdot 0.5 = ${((10 + idx) ** 2) / 2} см²`
              });
            }

            return {
              num: idx + 1,
              tasks: tasks.slice(0, tCount)
            };
          });
        }
      }
    ]
  },
  {
    id: 'physics',
    name: 'Физика',
    iconName: 'Zap',
    topics: [
      {
        id: 'phys-newton',
        title: 'Законы Ньютона и сила тяжести',
        grade: '9 класс',
        defaultTasksCount: 3,
        defaultMinutes: 20,
        difficulty: 'Стандартный',
        generator: (vCount, tCount) => {
          return Array.from({ length: vCount }, (_, idx) => {
            const m = 4 + idx * 2;
            const a = 2.5 + idx * 0.5;
            const f = m * a;

            const tasks: AssessmentTask[] = [
              {
                num: 1,
                text: `Тело массой ${m} кг движется под действием постоянной силы с ускорением ${a} м/с². Найдите модуль действующей силы:`,
                formula: `F = m \\cdot a`,
                answer: `${f} Н`,
                solution: `F = ${m} \\cdot ${a} = ${f} Н`
              },
              {
                num: 2,
                text: `Какую скорость приобретет это тело через ${4 + idx} секунд движения из состояния покоя?`,
                formula: `v = v_0 + a \\cdot t`,
                answer: `${a * (4 + idx)} м/с`,
                solution: `v = 0 + ${a} \\cdot ${4 + idx} = ${a * (4 + idx)} м/с`
              }
            ];

            if (tCount >= 3) {
              const s = (a * Math.pow(4 + idx, 2)) / 2;
              tasks.push({
                num: 3,
                text: `Определите пройденный телом путь за это же время:`,
                formula: `S = \\frac{a t^2}{2}`,
                answer: `${s} м`,
                solution: `S = (${a} \\cdot ${4 + idx}^2) / 2 = ${s} м`
              });
            }

            return {
              num: idx + 1,
              tasks: tasks.slice(0, tCount)
            };
          });
        }
      },
      {
        id: 'phys-ohm',
        title: 'Закон Ома и соединение проводников',
        grade: '8–9 класс',
        defaultTasksCount: 3,
        defaultMinutes: 20,
        difficulty: 'Стандартный',
        generator: (vCount, tCount) => {
          return Array.from({ length: vCount }, (_, idx) => {
            const u = 12 + idx * 6;
            const r = 4 + idx * 2;
            const i = u / r;

            const tasks: AssessmentTask[] = [
              {
                num: 1,
                text: `Какова сила тока в электрической цепи при напряжении ${u} В и сопротивлении реостата ${r} Ом?`,
                formula: `I = \\frac{U}{R}`,
                answer: `${i} А`,
                solution: `I = ${u} / ${r} = ${i} А`
              },
              {
                num: 2,
                text: `Два резистора с сопротивлениями ${r} Ом и ${r * 2} Ом соединены последовательно. Найдите общее сопротивление:`,
                formula: `R_{общ} = R_1 + R_2`,
                answer: `${r * 3} Ом`,
                solution: `R = ${r} + ${r * 2} = ${r * 3} Ом`
              }
            ];

            if (tCount >= 3) {
              tasks.push({
                num: 3,
                text: `Какое количество теплоты выделится в резисторе за 10 секунд при токе ${i} А?`,
                formula: `Q = I^2 \\cdot R \\cdot t`,
                answer: `${i * i * r * 10} Дж`,
                solution: `Q = ${i}^2 \\cdot ${r} \\cdot 10 = ${i * i * r * 10} Дж`
              });
            }

            return {
              num: idx + 1,
              tasks: tasks.slice(0, tCount)
            };
          });
        }
      }
    ]
  },
  {
    id: 'informatics',
    name: 'Информатика',
    iconName: 'Binary',
    topics: [
      {
        id: 'inf-logic',
        title: 'Логические операции и таблицы истинности',
        grade: '8–9 класс',
        defaultTasksCount: 3,
        defaultMinutes: 15,
        difficulty: 'Базовый',
        generator: (vCount, tCount) => {
          return Array.from({ length: vCount }, (_, idx) => {
            const xVal = idx % 2 === 0 ? 5 : 7;
            const tasks: AssessmentTask[] = [
              {
                num: 1,
                text: `Для какого из приведённых чисел ИСТИННО высказывание: (X > ${xVal}) И НЕ (X чётное)?`,
                formula: `(X > ${xVal}) \\land \\neg(X \\text{ чётное})`,
                answer: `${xVal + 2}`,
                solution: `Число должно быть строго больше ${xVal} и быть нечётным: например, ${xVal + 2}`
              },
              {
                num: 2,
                text: `Сколько различных решений имеет логическое уравнение: (A \\lor \\neg B) = 0?`,
                formula: `A \\lor \\neg B = 0`,
                answer: '1 решение (A = 0, B = 1)',
                solution: 'Дизъюнкция ложна только когда оба операнда ложны: A=0 и !B=0 => B=1'
              }
            ];

            if (tCount >= 3) {
              tasks.push({
                num: 3,
                text: 'Укажите наименьшее натуральное число X, для которого истинно выражение:',
                formula: `\\neg(X < ${idx + 4}) \\land (X < ${idx + 9})`,
                answer: `${idx + 4}`,
                solution: `X >= ${idx + 4} и X < ${idx + 9}. Наименьшее целое: ${idx + 4}`
              });
            }

            return {
              num: idx + 1,
              tasks: tasks.slice(0, tCount)
            };
          });
        }
      },
      {
        id: 'inf-bin',
        title: 'Системы счисления (2, 8, 16)',
        grade: '8–9 класс',
        defaultTasksCount: 3,
        defaultMinutes: 15,
        difficulty: 'Базовый',
        generator: (vCount, tCount) => {
          return Array.from({ length: vCount }, (_, idx) => {
            const dec = 25 + idx * 7;
            const bin = dec.toString(2);
            const oct = dec.toString(8);
            const hex = dec.toString(16).toUpperCase();

            const tasks: AssessmentTask[] = [
              {
                num: 1,
                text: `Переведите десятичное число ${dec} в двоичную систему счисления:`,
                formula: `${dec}_{10} = ?_2`,
                answer: `${bin}_2`,
                solution: `Деление на 2 с остатками: ${dec} = ${bin}_2`
              },
              {
                num: 2,
                text: `Переведите число ${bin}_2 в шестнадцатеричную систему счисления:`,
                formula: `${bin}_2 = ?_{16}`,
                answer: `${hex}_{16}`,
                solution: `Разбиение по тетрадам: ${bin} => ${hex}_{16}`
              }
            ];

            if (tCount >= 3) {
              tasks.push({
                num: 3,
                text: `Среди чисел ${bin}_2, ${oct}_8, ${hex}_{16} найдите наибольшее и запишите его в десятичной системе:`,
                formula: `\\max(${bin}_2, ${oct}_8, ${hex}_{16})`,
                answer: `${dec}`,
                solution: `Все эти записи представляют одно и то же число ${dec}`
              });
            }

            return {
              num: idx + 1,
              tasks: tasks.slice(0, tCount)
            };
          });
        }
      }
    ]
  },
  {
    id: 'russian',
    name: 'Русский язык',
    iconName: 'BookMarked',
    topics: [
      {
        id: 'rus-ortho',
        title: 'Правописание корней с чередованием (гар/гор, зар/зор, лаг/лож)',
        grade: '8–9 класс',
        defaultTasksCount: 3,
        defaultMinutes: 15,
        difficulty: 'Стандартный',
        generator: (vCount, tCount) => {
          const variantsBank = [
            {
              words1: 'заг_релый, прик_сновение, прил_гать, оз_рение',
              ans1: 'о, о, а, а',
              words2: 'выр_щенный, р_сток, бл_стеть, зам_реть',
              ans2: 'а, о, е, е'
            },
            {
              words1: 'подг_реть, предл_жение, расст_лать, к_сательная',
              ans1: 'о, о, и, а',
              words2: 'р_стительность, отр_сль, зап_реть, проб_раться',
              ans2: 'а, а, е, и'
            },
            {
              words1: 'разг_раться, прил_жить, выт_рать, оз_рять',
              ans1: 'о, о, и, а',
              words2: 'возр_ст, ср_щение, забл_стеть, ст_реть',
              ans2: 'а, а, е, е'
            },
            {
              words1: 'сг_рание, изл_жение, зам_рать, к_сание',
              ans1: 'о, о, и, а',
              words2: 'подр_стать, выр_сший, бл_стательный, уд_рать',
              ans2: 'а, о, и, и'
            }
          ];

          return Array.from({ length: vCount }, (_, idx) => {
            const item = variantsBank[idx % variantsBank.length];
            const tasks: AssessmentTask[] = [
              {
                num: 1,
                text: `Вставьте пропущенные буквы в словах с чередующимися гласными в корне: ${item.words1}`,
                answer: item.ans1,
                solution: 'Правило: зависит от ударения, суффикса -А- или последующей согласной'
              },
              {
                num: 2,
                text: `Вставьте пропущенные буквы и выделите слова-исключения: ${item.words2}`,
                answer: item.ans2,
                solution: 'Исключения: росток, отрасль, полог, скачок и др.'
              }
            ];

            if (tCount >= 3) {
              tasks.push({
                num: 3,
                text: 'Укажите номера рядов, в которых во всех словах одного ряда пропущена одна и та же буква.',
                answer: 'Ряд 1, Ряд 3',
                solution: 'Проверка орфограмм по корням -гар-/-гор-, -клан-/-клон-, -твар-/-твор-'
              });
            }

            return {
              num: idx + 1,
              tasks: tasks.slice(0, tCount)
            };
          });
        }
      }
    ]
  }
];

/** Расчёт шкалы оценивания на основе количества заданий и сложности */
export function calculateGradingScale(tasksCount: number, difficulty: string) {
  const pointsPerTask = difficulty === 'Повышенный' ? 2 : 1;
  const maxScore = tasksCount * pointsPerTask;

  const fiveMin = Math.ceil(maxScore * 0.85);
  const fourMin = Math.ceil(maxScore * 0.7);
  const threeMin = Math.ceil(maxScore * 0.5);

  return {
    maxScore,
    five: `«5» (Отлично): ${fiveMin}–${maxScore} баллов (85–100%)`,
    four: `«4» (Хорошо): ${fourMin}–${fiveMin - 1} баллов (70–84%)`,
    three: `«3» (Удовлетворительно): ${threeMin}–${fourMin - 1} баллов (50–69%)`,
    two: `«2» (Неудовлетворительно): менее ${threeMin} баллов (< 50%)`
  };
}
