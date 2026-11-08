// Cloudflare Pages Function: /api/webhook
// 24/7 Умный мобильный ассистент учителя для мессенджера MAX (@ideya_fiks_23_bot)
// Экосистема «Сферум.Кабинет» (МАОУ «Лицей Информационных Технологий» г. Новосибирска)

const BOT_TOKEN = "f9LHodD0cOJX1binrlWBycWED-mAlS-161FfBX83BtJMMXcyGKxxnz7oOhr9zWHrnXlyFVf9AeDTHSLo9m8o";
const BASE_URL = "https://platform-api2.max.ru";
const BASE_APP_URL = "https://sferum-cabinet.pages.dev";

// Набор удобных кнопок для учителя с прямыми переходами в веб-кабинет
function getMenuButtons(activeTab?: string) {
  return {
    type: "inline_keyboard",
    payload: {
      buttons: [
        [
          {
            type: "link",
            text: "📱 Открыть «Сферум.Кабинет» (Веб)",
            url: activeTab ? `${BASE_APP_URL}?tab=${activeTab}` : BASE_APP_URL
          }
        ],
        [
          {
            type: "link",
            text: "👥 Ученики и класс (9А)",
            url: `${BASE_APP_URL}?tab=myclasses`
          },
          {
            type: "link",
            text: "📝 Проверочные А4",
            url: `${BASE_APP_URL}?tab=aicards`
          }
        ],
        [
          {
            type: "link",
            text: "📋 Записки родителей",
            url: `${BASE_APP_URL}?tab=classmaster`
          },
          {
            type: "link",
            text: "🗺 Расписание и этажи",
            url: `${BASE_APP_URL}?tab=locator`
          }
        ],
        [
          {
            type: "link",
            text: "🥐 Заказ питания",
            url: `${BASE_APP_URL}?tab=canteen`
          },
          {
            type: "link",
            text: "📢 Новости лицея",
            url: `${BASE_APP_URL}?tab=news`
          }
        ],
        [
          {
            type: "link",
            text: "🛠 Вызов завхоза (Каб. 311)",
            url: `${BASE_APP_URL}?tab=tickets`
          },
          {
            type: "link",
            text: "🎯 Анти-ГДЗ (ФИПИ)",
            url: `${BASE_APP_URL}?tab=fipi`
          }
        ]
      ]
    }
  };
}

async function sendMessage(target: { chatId?: number; userId?: number }, text: string, buttons?: any) {
  const payload: any = {
    text,
    format: "markdown"
  };
  if (buttons) {
    payload.attachments = [buttons];
  }

  // Приоритет chat_id (прямой диалог в MAX), затем user_id
  const urls: string[] = [];
  if (target.chatId) {
    urls.push(`${BASE_URL}/messages?chat_id=${target.chatId}`);
  }
  if (target.userId) {
    urls.push(`${BASE_URL}/messages?user_id=${target.userId}`);
  }

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": BOT_TOKEN,
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
      console.warn(`[MAX API] Warning sending to ${url}: status ${res.status}`);
    } catch (err) {
      console.error(`[MAX API] Error sending message to ${url}:`, err);
    }
  }
  return null;
}

export async function onRequestPost(context: any): Promise<Response> {
  try {
    const update = await context.request.json();
    console.log("Incoming MAX update:", JSON.stringify(update));

    const uType = update?.update_type;
    const msg = update?.message || {};
    const sender = msg?.sender || update?.sender || update?.user || {};
    const recipient = msg?.recipient || {};

    const chatId = update?.chat_id || recipient?.chat_id;
    const userId = sender?.user_id || update?.user_id;
    const name = sender?.name || sender?.first_name || update?.user?.first_name || "Роман Борисович";

    const rawText = (msg?.body?.text || msg?.text || update?.body?.text || update?.text || "").trim();
    const clean = rawText.toLowerCase();

    // Если нет ни chat_id, ни user_id — некуда отвечать
    if (!chatId && !userId) {
      return new Response(JSON.stringify({ ok: true, note: "No target found in update" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const target = { chatId, userId };

    // ─────────────────────────────────────────────────────────────
    // 1. УЧЕНИКИ / КЛАСС / ПОСЕЩАЕМОСТЬ / КТО БОЛЕЕТ (или цифра 1)
    // ─────────────────────────────────────────────────────────────
    if (
      clean === "1" ||
      clean.includes("ученик") ||
      clean.includes("класс") ||
      clean.includes("дети") ||
      clean.includes("список") ||
      clean.includes("посещаем") ||
      clean.includes("болеет") ||
      clean.includes("пропуск") ||
      clean.includes("табель") ||
      clean === "9а" ||
      clean.includes("кто в классе") ||
      clean.includes("журнал") ||
      clean.includes("/attendance")
    ) {
      const reply =
        `👥 *9А класс • МАОУ «Лицей Информационных Технологий»*\n\n` +
        `👤 Классный руководитель: *Лосив Роман Борисович*\n` +
        `📊 *Сводка посещаемости на текущий урок:*\n` +
        `• Всего в классе: *26 учащихся*\n` +
        `• Присутствуют: *23 человека* (88.5%)\n\n` +
        `🏥 *На больничном (1 ученик):*\n` +
        `• Иванов Иван — справка от педиатра №412 (до 10.11)\n\n` +
        `📝 *Уважительная причина (2 ученика):*\n` +
        `• Васильева Дарья — записка от мамы (приём у ортодонта до 9:15)\n` +
        `• Морозов Максим — вызов Минспорта (Первенство НСО по плаванию)\n\n` +
        `📩 *В электронной приемной:* 1 новое заявление на согласование.\n\n` +
        `Откройте классный журнал и сформируйте официальный табель посещаемости для завуча:`;

      await sendMessage(target, reply, getMenuButtons("myclasses"));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. ПРОВЕРОЧНЫЕ РАБОТЫ / ТЕСТЫ / ВАРИАНТЫ (или цифра 2)
    // ─────────────────────────────────────────────────────────────
    if (
      clean === "2" ||
      clean.includes("проверочн") ||
      clean.includes("тест") ||
      clean.includes("контрольн") ||
      clean.includes("вариант") ||
      clean.includes("задач") ||
      clean.includes("алгебр") ||
      clean.includes("геометр") ||
      clean.includes("физик") ||
      clean.includes("информатик") ||
      clean.includes("печать") ||
      clean.includes("/exam")
    ) {
      const reply =
        `📝 *Конструктор проверочных работ (Стандарт ФГОС РФ)*\n\n` +
        `Готовые параллельные варианты для быстрой печати на 1 лист А4 с пунктирными линиями отреза ✂ (по закону ФЗ №618 о запрете смартфонов):\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `📌 *ВАРИАНТ №1 (Алгебра • 9 класс)*\n` +
        `1. Решите квадратное уравнение: x² - 8x + 15 = 0\n` +
        `2. Найдите сумму корней: 2x² - 10x + 7 = 0\n` +
        `3. При каких k уравнение x² + kx + 9 = 0 имеет 1 корень?\n` +
        `🔑 *Ключи для учителя:* №1: x₁=3, x₂=5 | №2: 5 | №3: k=±6\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `📌 *ВАРИАНТ №2 (Алгебра • 9 класс)*\n` +
        `1. Решите квадратное уравнение: x² - 9x + 20 = 0\n` +
        `2. Найдите произведение корней: 3x² - 11x + 6 = 0\n` +
        `3. При каких k уравнение x² + kx + 16 = 0 имеет 1 корень?\n` +
        `🔑 *Ключи для учителя:* №1: x₁=4, x₂=5 | №2: 2 | №3: k=±8\n\n` +
        `📄 В веб-кабинете доступно моментальное скачивание чистого PDF для печати на класс и экспресс-ключа проверки за 30 секунд:`;

      await sendMessage(target, reply, getMenuButtons("aicards"));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. СПРАВКИ / ЗАПИСКИ / РОДИТЕЛИ / ПРИЕМНАЯ (или цифра 3)
    // ─────────────────────────────────────────────────────────────
    if (
      clean === "3" ||
      clean.includes("справк") ||
      clean.includes("записк") ||
      clean.includes("родител") ||
      clean.includes("заявлен") ||
      clean.includes("приемн") ||
      clean.includes("ортодонт") ||
      clean.includes("соревнован") ||
      clean.includes("освобожден") ||
      clean.includes("врач")
    ) {
      const reply =
        `📋 *Электронная приёмная заявлений родителей (9А класс)*\n\n` +
        `Поступившие документы за текущую неделю:\n\n` +
        `1. *Васильева Дарья (Записка №14)*\n` +
        `   • От: Васильева Ольга Владимировна (мама)\n` +
        `   • Причина: Плановый приём у ортодонта (8:30–9:15)\n` +
        `   • Статус: ✅ *Согласовано классным руководителем*\n\n` +
        `2. *Морозов Максим (Вызов Минспорта №492)*\n` +
        `   • От: Морозова Елена Сергеевна (мама)\n` +
        `   • Причина: Первенство НСО по плаванию (г. Бердск)\n` +
        `   • Статус: ✅ *Подписано приказом директора*\n\n` +
        `3. *Попова Светлана (Заявление №15)*\n` +
        `   • От: Попова Татьяна Игоревна (мама)\n` +
        `   • Причина: Семейные обстоятельства (отъезд на 1 день)\n` +
        `   • Статус: ⏳ *Ожидает вашего подтверждения*\n\n` +
        `Все справки автоматически формируют сводный архив для медицинского кабинета и завуча:`;

      await sendMessage(target, reply, getMenuButtons("classmaster"));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. РАСПИСАНИЕ / КАБИНЕТ / ГДЕ УРОК / ЗВОНОК (или цифра 4)
    // ─────────────────────────────────────────────────────────────
    if (
      clean === "4" ||
      clean.includes("расписан") ||
      clean.includes("урок") ||
      clean.includes("кабинет") ||
      clean.includes("где") ||
      clean.includes("звонок") ||
      clean.includes("перемен") ||
      clean.includes("этаж") ||
      clean.includes("навигатор") ||
      clean.includes("/nav")
    ) {
      const reply =
        `🗺 *Сферум.Планер & Навигатор кабинетов МАОУ ЛИТ*\n\n` +
        `🔔 *Текущий урок (4-й урок, 11:30–12:15):*\n` +
        `• Предмет: *Информатика и ИКТ (9А класс)*\n` +
        `• Аудитория: *Кабинет №311* (3 этаж, Правое крыло)\n` +
        `• Статус звонка: *Идёт урок (до перемены 18 минут)*\n\n` +
        `🔔 *Следующий урок (5-й урок, 12:35–13:20):*\n` +
        `• Предмет: *Физика (10Б класс)*\n` +
        `• Аудитория: *Кабинет №214* (2 этаж, Левое крыло)\n\n` +
        `📍 Интерактивная схема всех 3 этажей лицея и расписание звонков:`;

      await sendMessage(target, reply, getMenuButtons("locator"));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────
    // 5. ВЫЗОВ ЗАВХОЗА / РЕМОНТ / ПРОЕКТОР / SOS (или цифра 5)
    // ─────────────────────────────────────────────────────────────
    if (
      clean === "5" ||
      clean.includes("завхоз") ||
      clean.includes("ремонт") ||
      clean.includes("проектор") ||
      clean.includes("сломал") ||
      clean.includes("лампа") ||
      clean.includes("свет") ||
      clean.includes("холодно") ||
      clean.includes("батаре") ||
      clean.includes("мел") ||
      clean.includes("замок") ||
      clean.includes("парта") ||
      clean.includes("стул") ||
      clean.includes("sos") ||
      clean.includes("/sos")
    ) {
      const reply =
        `🛠 *Служба завхоза и АХЧ МАОУ ЛИТ (Кабинет №311)*\n\n` +
        `⚡ *Оперативная заявка принята и передана мастеру!*\n` +
        `• Номер тикета: *#482-АХЧ*\n` +
        `• Локация: *Кабинет №311 (Информатика)*\n` +
        `• Категория: *Оборудование / электрика / учебная мебель*\n` +
        `• Дежурный мастер: *Сидоров В.П. (АХЧ)*\n` +
        `• Нормативное время прибытия: *до 15 минут*\n\n` +
        `Отслеживайте статус выполнения заявки в реальном времени:`;

      await sendMessage(target, reply, getMenuButtons("tickets"));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────
    // 6. ШКОЛЬНОЕ ПИТАНИЕ / СТОЛОВАЯ / БУФЕТ / ОБЕД (или цифра 6)
    // ─────────────────────────────────────────────────────────────
    if (
      clean === "6" ||
      clean.includes("питан") ||
      clean.includes("еда") ||
      clean.includes("обед") ||
      clean.includes("столов") ||
      clean.includes("буфет") ||
      clean.includes("ланч") ||
      clean.includes("кенгу") ||
      clean.includes("меню") ||
      clean.includes("кушать") ||
      clean.includes("булочк")
    ) {
      const reply =
        `🥐 *Школьное питание & Столовая лицея (Карта «Кенгу.Детям»)*\n\n` +
        `🕐 *Предзаказ на ближайшую большую перемену (после 4 урока, 12:15):*\n` +
        `• Статус столовой: *Открыта, идёт накрытие столов*\n` +
        `• Баланс карты питания: *1 240 ₽*\n\n` +
        `🍲 *Комплексный горячий обед лицеиста (165 ₽):*\n` +
        `• Борщ сибирский со сметаной и свежей зеленью (250 г)\n` +
        `• Тефтели мясные в томатном соусе с картофельным пюре (220 г)\n` +
        `• Напиток из лесных ягод (200 мл) + хлеб зерновой\n\n` +
        `Вы можете оформить заказ на выбранную перемену прямо сейчас:`;

      await sendMessage(target, reply, getMenuButtons("canteen"));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────
    // 7. ЛЕНТА НОВОСТЕЙ ЛИЦЕЯ / ПРИКАЗЫ ЗАВУЧА (или цифра 7)
    // ─────────────────────────────────────────────────────────────
    if (
      clean === "7" ||
      clean.includes("новост") ||
      clean.includes("лент") ||
      clean.includes("приказ") ||
      clean.includes("завуч") ||
      clean.includes("объявлен") ||
      clean.includes("побед") ||
      clean.includes("хакатон")
    ) {
      const reply =
        `📢 *Информационная лента и приказы МАОУ ЛИТ*\n\n` +
        `📌 *ЗАКРЕПЛЕНО ЗАВУЧЕМ:*\n` +
        `• *Приказ №184-ОД:* О проведении Всероссийских проверочных работ (ВПР) по математике в 9-х классах. График и бланки утверждены.\n\n` +
        `🏆 *ГОРДОСТЬ ЛИЦЕЯ:*\n` +
        `• Команда №23 «Девелопы» (9А класс) одержала победу в региональном хакатоне «Идея фикс» с экосистемой «Сферум.Кабинет»!\n\n` +
        `❄️ *ТЕМПЕРАТУРНЫЙ РЕЖИМ:*\n` +
        `• Учебный процесс продолжается в штатном режиме. Все кабинеты прогреты до +21°C.\n\n` +
        `Посмотреть полную ленту новостей с официальными документами и реакциями:`;

      await sendMessage(target, reply, getMenuButtons("news"));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────
    // 8. БАНК ФИПИ / АНТИ-ГДЗ / ОГЭ / ЕГЭ (или цифра 8)
    // ─────────────────────────────────────────────────────────────
    if (
      clean === "8" ||
      clean.includes("фипи") ||
      clean.includes("гдз") ||
      clean.includes("огэ") ||
      clean.includes("егэ") ||
      clean.includes("аналог") ||
      clean.includes("списыван") ||
      clean.includes("банк")
    ) {
      const reply =
        `🎯 *Банк заданий ФИПИ и Генератор авторских аналогов (Анти-ГДЗ)*\n\n` +
        `Система генерирует варианты строго по спецификации ОГЭ и ЕГЭ 2026 года с изменёнными числовыми параметрами:\n\n` +
        `• *Полная защита от списывания:* готовых решений нет ни в ГДЗ, ни в интернете, ни в нейросетях.\n` +
        `• *Экспресс-проверка:* матрица ключей для учителя с пошаговыми решениями.\n` +
        `• *Печать на класс:* аккуратная верстка карточек под формат А4.\n\n` +
        `Перейдите в банк заданий для генерации авторского комплекта:`;

      await sendMessage(target, reply, getMenuButtons("fipi"));
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─────────────────────────────────────────────────────────────
    // 9. ДЕФОЛТНЫЙ ОТВЕТ: ПОНЯТНОЕ ПРИВЕТСТВИЕ И МЕНЮ БЕЗ ЖАРГОНА
    // ─────────────────────────────────────────────────────────────
    const greeting =
      `Здравствуйте, ${name}!\n\n` +
      `🎓 Я мобильный ассистент школьного сервиса «Сферум.Кабинет» (МАОУ «Лицей Информационных Технологий» г. Новосибирска).\n\n` +
      `Помогаю экономить до 8,5 часов бумажной рутины в неделю. Вам *не нужно учить команды со слэшами* — просто напишите мне любое слово или цифру:\n\n` +
      `• *1* или *«Ученики»* — список 9А класса, посещаемость и кто на больничном\n` +
      `• *2* или *«Проверочные»* — готовые варианты задач с ключами для печати на А4\n` +
      `• *3* или *«Справки»* — электронные записки от родителей\n` +
      `• *4* или *«Расписание»* — какой сейчас урок и в каком кабинете\n` +
      `• *5* или *«Завхоз»* — срочный вызов мастера при поломке проектора\n` +
      `• *6* или *«Питание»* — меню столовой и предзаказ на перемену\n` +
      `• *7* или *«Новости»* — приказы завуча и лицейская лента\n` +
      `• *8* или *«Анти-ГДЗ»* — банк заданий ФИПИ без готовых ответов\n\n` +
      `Либо откройте нужный раздел в один клик через кнопки ниже:`;

    await sendMessage(target, greeting, getMenuButtons());
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error("Error processing MAX webhook update:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestGet(): Promise<Response> {
  return new Response(
    JSON.stringify({
      status: "active",
      bot: "@ideya_fiks_23_bot",
      service: "Sferum.Cabinet Smart Assistant for MAX Messenger",
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}
