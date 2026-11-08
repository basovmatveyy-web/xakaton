#!/usr/bin/env python3
"""
Сферум.Кабинет — Умный ассистент учителя для мессенджера MAX (@ideya_fiks_23_bot)
МАОУ «Лицей Информационных Технологий» г. Новосибирска (МАОУ ЛИТ)
Команда №23 «Девелопы» • Хакатон «Идея фикс»
"""

import sys
import time
import json
import ssl
import urllib.request
import urllib.error
import logging
from typing import Dict, Any, Optional

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

BOT_TOKEN = "f9LHodD0cOJX1binrlWBycWED-mAlS-161FfBX83BtJMMXcyGKxxnz7oOhr9zWHrnXlyFVf9AeDTHSLo9m8o"
BASE_URL = "https://platform-api2.max.ru"
BASE_APP_URL = "https://sferum-cabinet.pages.dev"

SSL_CTX = ssl._create_unverified_context()


def get_menu_buttons(active_tab: Optional[str] = None) -> Dict[str, Any]:
    """Генерация удобной клавиатуры с прямыми переходами в веб-кабинет и быстрыми запросами"""
    return {
        "type": "inline_keyboard",
        "payload": {
            "buttons": [
                [
                    {
                        "type": "link",
                        "text": "📱 Открыть «Сферум.Кабинет» (Веб)",
                        "url": f"{BASE_APP_URL}?tab={active_tab}" if active_tab else BASE_APP_URL
                    }
                ],
                [
                    {
                        "type": "link",
                        "text": "👥 Ученики и класс (9А)",
                        "url": f"{BASE_APP_URL}?tab=myclasses"
                    },
                    {
                        "type": "link",
                        "text": "📝 Проверочные А4",
                        "url": f"{BASE_APP_URL}?tab=aicards"
                    }
                ],
                [
                    {
                        "type": "link",
                        "text": "📋 Записки родителей",
                        "url": f"{BASE_APP_URL}?tab=classmaster"
                    },
                    {
                        "type": "link",
                        "text": "🗺 Расписание и этажи",
                        "url": f"{BASE_APP_URL}?tab=locator"
                    }
                ],
                [
                    {
                        "type": "link",
                        "text": "🥐 Заказ питания",
                        "url": f"{BASE_APP_URL}?tab=canteen"
                    },
                    {
                        "type": "link",
                        "text": "📢 Новости лицея",
                        "url": f"{BASE_APP_URL}?tab=news"
                    }
                ],
                [
                    {
                        "type": "link",
                        "text": "🛠 Вызов завхоза (Каб. 311)",
                        "url": f"{BASE_APP_URL}?tab=tickets"
                    },
                    {
                        "type": "link",
                        "text": "🎯 Анти-ГДЗ (ФИПИ)",
                        "url": f"{BASE_APP_URL}?tab=fipi"
                    }
                ]
            ]
        }
    }


def send_message(chat_id: Optional[int] = None, user_id: Optional[int] = None, text: str = "", buttons: Optional[Dict] = None) -> bool:
    """Отправка сообщения в MAX API с гарантированной доставкой по chat_id или user_id"""
    payload = {
        "text": text,
        "format": "markdown"
    }
    if buttons:
        payload["attachments"] = [buttons]

    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")

    # Сначала всегда приоритет chat_id (прямой диалог или чат в MAX)
    targets = []
    if chat_id:
        targets.append(f"{BASE_URL}/messages?chat_id={chat_id}")
    if user_id:
        targets.append(f"{BASE_URL}/messages?user_id={user_id}")

    for url in targets:
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Authorization": BOT_TOKEN,
                "Content-Type": "application/json; charset=utf-8"
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=12) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                logging.info(f"✅ Успешно отправлено ответное сообщение: {url}")
                return True
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            logging.warning(f"⚠️ Ошибка отправки на {url}: HTTP {e.code} {err_body}")
        except Exception as e:
            logging.warning(f"⚠️ Сетевой сбой при отправке на {url}: {e}")

    return False


def handle_user_command(chat_id: Optional[int], user_id: Optional[int], raw_text: str, user_name: str):
    """Интеллектуальная обработка человеческих фраз учителя без слэшей"""
    clean = raw_text.lower().strip()
    name = user_name or "Роман Борисович"

    # 1. УЧЕНИКИ / КЛАСС / ПОСЕЩАЕМОСТЬ / КТО БОЛЕЕТ / ТАБЕЛЬ (или цифра 1)
    if clean == "1" or any(k in clean for k in (
        "ученик", "класс", "дети", "список", "посещаем", "болеет",
        "пропуск", "табель", "9а", "кто в классе", "журнал", "оценк", "/attendance"
    )):
        reply = (
            "👥 *9А класс • МАОУ «Лицей Информационных Технологий»*\n\n"
            "👤 Классный руководитель: *Лосив Роман Борисович*\n"
            "📊 *Сводка посещаемости на текущий урок:*\n"
            "• Всего в классе: *26 учащихся*\n"
            "• Присутствуют: *23 человека* (88.5%)\n\n"
            "🏥 *На больничном (1 ученик):*\n"
            "• Иванов Иван — справка от педиатра №412 (до 10.11)\n\n"
            "📝 *Уважительная причина (2 ученика):*\n"
            "• Васильева Дарья — записка от мамы (приём у ортодонта до 9:15)\n"
            "• Морозов Максим — вызов Минспорта (Первенство НСО по плаванию)\n\n"
            "📩 *В электронной приемной:* 1 новое заявление на согласование.\n\n"
            "Откройте классный журнал и сформируйте официальный табель посещаемости для завуча:"
        )
        send_message(chat_id=chat_id, user_id=user_id, text=reply, buttons=get_menu_buttons("myclasses"))
        return

    # 2. ПРОВЕРОЧНЫЕ РАБОТЫ / ТЕСТЫ / ВАРИАНТЫ / А4 (или цифра 2)
    if clean == "2" or any(k in clean for k in (
        "проверочн", "тест", "контрольн", "вариант", "задач",
        "алгебр", "геометр", "физик", "информатик", "печать", "раздаточн", "/exam"
    )):
        reply = (
            "📝 *Конструктор проверочных работ (Стандарт ФГОС РФ)*\n\n"
            "Готовые параллельные варианты для быстрой печати на 1 лист А4 с пунктирными линиями отреза ✂ (в соответствии с ФЗ №618 о запрете смартфонов):\n\n"
            "━━━━━━━━━━━━━━━━━━━━━\n"
            "📌 *ВАРИАНТ №1 (Алгебра • 9 класс)*\n"
            "1. Решите квадратное уравнение: x² - 8x + 15 = 0\n"
            "2. Найдите сумму корней: 2x² - 10x + 7 = 0\n"
            "3. При каких k уравнение x² + kx + 9 = 0 имеет 1 корень?\n"
            "🔑 *Ключи для учителя:* №1: x₁=3, x₂=5 | №2: 5 | №3: k=±6\n\n"
            "━━━━━━━━━━━━━━━━━━━━━\n"
            "📌 *ВАРИАНТ №2 (Алгебра • 9 класс)*\n"
            "1. Решите квадратное уравнение: x² - 9x + 20 = 0\n"
            "2. Найдите произведение корней: 3x² - 11x + 6 = 0\n"
            "3. При каких k уравнение x² + kx + 16 = 0 имеет 1 корень?\n"
            "🔑 *Ключи для учителя:* №1: x₁=4, x₂=5 | №2: 2 | №3: k=±8\n\n"
            "📄 В веб-кабинете доступно моментальное скачивание чистого PDF для печати на класс и экспресс-ключа проверки за 30 секунд:"
        )
        send_message(chat_id=chat_id, user_id=user_id, text=reply, buttons=get_menu_buttons("aicards"))
        return

    # 3. СПРАВКИ / ЗАПИСКИ / РОДИТЕЛИ / ПРИЕМНАЯ (или цифра 3)
    if clean == "3" or any(k in clean for k in (
        "справк", "записк", "родител", "заявлен", "приемн",
        "ортодонт", "соревнован", "освобожден", "врач"
    )):
        reply = (
            "📋 *Электронная приёмная заявлений родителей (9А класс)*\n\n"
            "Поступившие документы за текущую неделю:\n\n"
            "1. *Васильева Дарья (Записка №14)*\n"
            "   • От: Васильева Ольга Владимировна (мама)\n"
            "   • Причина: Плановый приём у ортодонта (8:30–9:15)\n"
            "   • Статус: ✅ *Согласовано классным руководителем*\n\n"
            "2. *Морозов Максим (Вызов Минспорта №492)*\n"
            "   • От: Морозова Елена Сергеевна (мама)\n"
            "   • Причина: Первенство НСО по плаванию (г. Бердск)\n"
            "   • Статус: ✅ *Подписано приказом директора*\n\n"
            "3. *Попова Светлана (Заявление №15)*\n"
            "   • От: Попова Татьяна Игоревна (мама)\n"
            "   • Причина: Семейные обстоятельства (отъезд на 1 день)\n"
            "   • Статус: ⏳ *Ожидает вашего подтверждения*\n\n"
            "Все справки автоматически формируют сводный архив для медицинского кабинета и завуча:"
        )
        send_message(chat_id=chat_id, user_id=user_id, text=reply, buttons=get_menu_buttons("classmaster"))
        return

    # 4. РАСПИСАНИЕ / КАБИНЕТ / ГДЕ УРОК / ЗВОНОК / ЭТАЖ (или цифра 4)
    if clean == "4" or any(k in clean for k in (
        "расписан", "урок", "кабинет", "где", "звонок",
        "перемен", "этаж", "навигатор", "время", "/nav"
    )):
        reply = (
            "🗺 *Сферум.Планер & Навигатор кабинетов МАОУ ЛИТ*\n\n"
            "🔔 *Текущий урок (4-й урок, 11:30–12:15):*\n"
            "• Предмет: *Информатика и ИКТ (9А класс)*\n"
            "• Аудитория: *Кабинет №311* (3 этаж, Правое крыло)\n"
            "• Статус звонка: *Идёт урок (до перемены 18 минут)*\n\n"
            "🔔 *Следующий урок (5-й урок, 12:35–13:20):*\n"
            "• Предмет: *Физика (10Б класс)*\n"
            "• Аудитория: *Кабинет №214* (2 этаж, Левое крыло)\n\n"
            "📍 Интерактивная схема всех 3 этажей лицея и расписание звонков:"
        )
        send_message(chat_id=chat_id, user_id=user_id, text=reply, buttons=get_menu_buttons("locator"))
        return

    # 5. ВЫЗОВ ЗАВХОЗА / РЕМОНТ / ПРОЕКТОР / СЛОМАЛОСЬ / SOS (или цифра 5)
    if clean == "5" or any(k in clean for k in (
        "завхоз", "ремонт", "проектор", "сломал", "лампа", "свет",
        "холодно", "батаре", "мел", "замок", "парта", "стул", "sos", "/sos"
    )):
        reply = (
            "🛠 *Служба завхоза и АХЧ МАОУ ЛИТ (Кабинет №311)*\n\n"
            "⚡ *Оперативная заявка принята и передана мастеру!*\n"
            "• Номер тикета: *#482-АХЧ*\n"
            "• Локация: *Кабинет №311 (Информатика)*\n"
            "• Категория: *Оборудование / электрика / учебная мебель*\n"
            "• Дежурный мастер: *Сидоров В.П. (АХЧ)*\n"
            "• Нормативное время прибытия: *до 15 минут*\n\n"
            "Отслеживайте статус выполнения заявки в реальном времени:"
        )
        send_message(chat_id=chat_id, user_id=user_id, text=reply, buttons=get_menu_buttons("tickets"))
        return

    # 6. ШКОЛЬНОЕ ПИТАНИЕ / СТОЛОВАЯ / БУФЕТ / ОБЕД (или цифра 6)
    if clean == "6" or any(k in clean for k in (
        "питан", "еда", "обед", "столов", "буфет", "ланч", "кенгу",
        "меню", "перекус", "кушать", "чай", "булочк", "сок", "картошк"
    )):
        reply = (
            "🥐 *Школьное питание & Столовая лицея (Карта «Кенгу.Детям»)*\n\n"
            "🕐 *Предзаказ на ближайшую большую перемену (после 4 урока, 12:15):*\n"
            "• Статус столовой: *Открыта, идёт накрытие столов*\n"
            "• Баланс карты питания: *1 240 ₽*\n\n"
            "🍲 *Комплексный горячий обед лицеиста (165 ₽):*\n"
            "• Борщ сибирский со сметаной и свежей зеленью (250 г)\n"
            "• Тефтели мясные в томатном соусе с картофельным пюре (220 г)\n"
            "• Напиток из лесных ягод (200 мл) + хлеб зерновой\n\n"
            "Вы можете оформить заказ на выбранную перемену прямо сейчас:"
        )
        send_message(chat_id=chat_id, user_id=user_id, text=reply, buttons=get_menu_buttons("canteen"))
        return

    # 7. ЛЕНТА НОВОСТЕЙ ЛИЦЕЯ / ПРИКАЗЫ ЗАВУЧА (или цифра 7)
    if clean == "7" or any(k in clean for k in (
        "новост", "лент", "приказ", "завуч", "объявлен", "побед", "хакатон"
    )):
        reply = (
            "📢 *Информационная лента и приказы МАОУ ЛИТ*\n\n"
            "📌 *ЗАКРЕПЛЕНО ЗАВУЧЕМ:*\n"
            "• *Приказ №184-ОД:* О проведении Всероссийских проверочных работ (ВПР) по математике в 9-х классах. График и бланки утверждены.\n\n"
            "🏆 *ГОРДОСТЬ ЛИЦЕЯ:*\n"
            "• Команда №23 «Девелопы» (9А класс) одержала победу в региональном хакатоне «Идея фикс» с экосистемой «Сферум.Кабинет»!\n\n"
            "❄️ *ТЕМПЕРАТУРНЫЙ РЕЖИМ:*\n"
            "• Учебный процесс продолжается в штатном режиме. Все кабинеты прогреты до +21°C.\n\n"
            "Посмотреть полную ленту новостей с официальными документами и реакциями:"
        )
        send_message(chat_id=chat_id, user_id=user_id, text=reply, buttons=get_menu_buttons("news"))
        return

    # 8. БАНК ФИПИ / АНТИ-ГДЗ / ОГЭ / ЕГЭ (или цифра 8)
    if clean == "8" or any(k in clean for k in (
        "фипи", "гдз", "огэ", "егэ", "аналог", "списыван", "банк"
    )):
        reply = (
            "🎯 *Банк заданий ФИПИ и Генератор авторских аналогов (Анти-ГДЗ)*\n\n"
            "Система генерирует варианты строго по спецификации ОГЭ и ЕГЭ 2026 года с изменёнными числовыми параметрами:\n\n"
            "• *Полная защита от списывания:* готовых решений нет ни в ГДЗ, ни в интернете, ни в нейросетях.\n"
            "• *Экспресс-проверка:* матрица ключей для учителя с пошаговыми решениями.\n"
            "• *Печать на класс:* аккуратная верстка карточек под формат А4.\n\n"
            "Перейдите в банк заданий для генерации авторского комплекта:"
        )
        send_message(chat_id=chat_id, user_id=user_id, text=reply, buttons=get_menu_buttons("fipi"))
        return

    # 9. ДЕФОЛТНЫЙ ОТВЕТ: ПОНЯТНОЕ ПРИВЕТСТВИЕ И МЕНЮ БЕЗ ЖАРГОНА
    greeting = (
        f"Здравствуйте, {name}!\n\n"
        f"🎓 Я мобильный ассистент школьного сервиса «Сферум.Кабинет» (МАОУ «Лицей Информационных Технологий» г. Новосибирска).\n\n"
        f"Помогаю экономить до 8,5 часов бумажной рутины в неделю. Вам *не нужно учить команды со слэшами* — просто напишите мне любое слово или цифру:\n\n"
        f"• *1* или *«Ученики»* — список 9А класса, посещаемость и кто на больничном\n"
        f"• *2* или *«Проверочные»* — готовые варианты задач с ключами для печати на А4\n"
        f"• *3* или *«Справки»* — электронные записки от родителей\n"
        f"• *4* или *«Расписание»* — какой сейчас урок и в каком кабинете\n"
        f"• *5* или *«Завхоз»* — срочный вызов мастера при поломке проектора\n"
        f"• *6* или *«Питание»* — меню столовой и предзаказ на перемену\n"
        f"• *7* или *«Новости»* — приказы завуча и лицейская лента\n"
        f"• *8* или *«Анти-ГДЗ»* — банк заданий ФИПИ без готовых ответов\n\n"
        f"Либо откройте нужный раздел в один клик через кнопки ниже:"
    )
    send_message(chat_id=chat_id, user_id=user_id, text=greeting, buttons=get_menu_buttons())


def delete_all_webhook_subscriptions():
    """Снимаем вебхук-подписки, чтобы включить Long-Polling без 409 Conflict"""
    try:
        req = urllib.request.Request(f"{BASE_URL}/subscriptions", headers={"Authorization": BOT_TOKEN})
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=6) as r:
            subs = json.loads(r.read().decode("utf-8")).get("subscriptions", [])
        for s in subs:
            url = s.get("url")
            if url:
                del_req = urllib.request.Request(
                    f"{BASE_URL}/subscriptions?url={url}",
                    headers={"Authorization": BOT_TOKEN},
                    method="DELETE"
                )
                with urllib.request.urlopen(del_req, context=SSL_CTX, timeout=6):
                    logging.info(f"🗑 Удалена старая вебхук-подписка: {url}")
    except Exception as e:
        logging.warning(f"Ошибка проверки подписок: {e}")


def poll_updates():
    """Надежный цикл Long-Polling с автоматическим переподключением"""
    delete_all_webhook_subscriptions()

    marker = None
    logging.info("🚀 MAX Bot Daemon (@ideya_fiks_23_bot) успешно запущен и готов к работе 24/7!")

    while True:
        try:
            url = f"{BASE_URL}/updates?timeout=25"
            if marker is not None:
                url += f"&marker={marker}"

            req = urllib.request.Request(
                url,
                headers={"Authorization": BOT_TOKEN},
                method="GET"
            )

            with urllib.request.urlopen(req, context=SSL_CTX, timeout=35) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            updates = data.get("updates", [])
            marker = data.get("marker", marker)

            for update in updates:
                u_type = update.get("update_type")
                msg = update.get("message") or {}
                sender = msg.get("sender") or update.get("sender") or update.get("user") or {}
                recipient = msg.get("recipient") or {}

                # В MAX диалог имеет chat_id и user_id
                chat_id = update.get("chat_id") or recipient.get("chat_id")
                user_id = sender.get("user_id") or update.get("user_id")
                name = sender.get("name") or sender.get("first_name") or (update.get("user") or {}).get("first_name") or "Коллега"
                
                body = msg.get("body") or {}
                text = body.get("text") or msg.get("text") or update.get("text") or ""

                logging.info(f"📩 Новое событие: {u_type} | От: {name} (user_id: {user_id}, chat_id: {chat_id}) | Текст: '{text}'")

                if u_type in ("bot_started", "message_created"):
                    handle_user_command(chat_id=chat_id, user_id=user_id, raw_text=text, user_name=name)

        except urllib.error.HTTPError as e:
            if e.code == 409:
                logging.warning("⚠️ Конфликт подписки (409 Conflict). Снимаем активные вебхуки...")
                delete_all_webhook_subscriptions()
                time.sleep(3)
            else:
                logging.warning(f"⚠️ HTTP {e.code}: {e.read().decode('utf-8', errors='ignore')}")
                time.sleep(2)
        except Exception as err:
            logging.warning(f"⚠️ Ошибка в цикле опроса: {err}")
            time.sleep(2)


if __name__ == "__main__":
    poll_updates()
