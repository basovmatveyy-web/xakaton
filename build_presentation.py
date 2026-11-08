import sys, os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

src = '/Users/motya7701/Downloads/Шаблон презентации Хакатон.pptx'
dst = '/Users/motya7701/Downloads/Презентация_Девелопы_Сферум_Кабинет.pptx'

prs = pptx.Presentation(src)

# Colors
PURPLE = RGBColor(123, 63, 228) # #7B3FE4
DARK = RGBColor(30, 30, 35)
GRAY = RGBColor(110, 110, 120)
WHITE = RGBColor(255, 255, 255)

def style_para(p, text, font_name="Open Sans", size_pt=12, bold=False, color_rgb=DARK, space_after=6, align=PP_ALIGN.LEFT):
    p.text = text
    p.font.name = font_name
    p.font.size = Pt(size_pt)
    p.font.bold = bold
    p.font.color.rgb = color_rgb
    p.space_after = Pt(space_after)
    p.alignment = align

# === SLIDE 1: Title ===
s1 = prs.slides[0]
for shape in s1.shapes:
    if shape.has_text_frame:
        tf = shape.text_frame
        tf.clear()
        p0 = tf.paragraphs[0]
        style_para(p0, "СФЕРУМ.КАБИНЕТ", "Open Sans", 34, True, PURPLE, 10, PP_ALIGN.LEFT)
        p1 = tf.add_paragraph()
        style_para(p1, "Единое цифровое рабочее место и умный ассистент учителя", "Open Sans", 18, True, DARK, 14, PP_ALIGN.LEFT)
        p2 = tf.add_paragraph()
        style_para(p2, "Команда «Девелопы» | МАОУ ЛИТ г. Новосибирск", "Open Sans", 14, False, GRAY, 4, PP_ALIGN.LEFT)
        p3 = tf.add_paragraph()
        style_para(p3, "Направление: 03. «Арсенал мастера» | Номинация: «Продвинутая разработка»", "Open Sans", 13, True, PURPLE, 0, PP_ALIGN.LEFT)

# === SLIDE 2: О проекте (бывш. Как работать с шаблоном) ===
s2 = prs.slides[1]
# shape 0: Title
if s2.shapes[0].has_text_frame:
    tf = s2.shapes[0].text_frame
    tf.clear()
    style_para(tf.paragraphs[0], "О ПРОЕКТЕ", "Open Sans", 30, True, PURPLE, 0)
# shape 1: Body
if s2.shapes[1].has_text_frame:
    tf = s2.shapes[1].text_frame
    tf.clear()
    p = tf.paragraphs[0]
    style_para(p, "«Сферум.Кабинет» — единый сервис внутри Сферума в MAX, объединяющий управление реальным школьным уроком и автоматизацию рутины учителя:", "Open Sans", 13, True, DARK, 8)
    
    items = [
        ("«Сферум.Планер & Локатор»", "расписание на год за 1 клик, карточки уроков с файлами, статус кабинета 311 и директ ученику из журнала."),
        ("Проверка знаний (ФЗ № 618)", "печать 4 уникальных вариантов карточек на парты и скан камерой учителя за 15 секунд на перемене (дети без телефонов на уроках)."),
        ("«Цифровая приемная» классрука", "автоматический сбор заявлений родителей с рукописной подписью и экспорт PDF-сводки за месяц для завуча в 1 клик."),
        ("«SOS-Тикет по кабинету»", "мгновенный вызов завхоза или сисадмина при поломке проектора/оборудования в 1 клик с фото."),
        ("Конструктор карточек и Клон задач", "защита от списывания с ГДЗ, генератор новых прототипов ОГЭ/ЕГЭ и сборщик презентаций к урокам.")
    ]
    for title, desc in items:
        p = tf.add_paragraph()
        p.text = f"• {title} — {desc}"
        p.font.name = "Open Sans"
        p.font.size = Pt(11)
        p.font.color.rgb = DARK
        p.space_after = Pt(5)

# === SLIDE 3: КОМАНДА ===
s3 = prs.slides[2]
# Shape 1: Название
if len(s3.shapes) > 1 and s3.shapes[1].has_text_frame:
    tf = s3.shapes[1].text_frame
    tf.clear()
    style_para(tf.paragraphs[0], "Название: Девелопы", "Open Sans", 13, True, DARK, 0)

# Shape 2: Регион и город
if len(s3.shapes) > 2 and s3.shapes[2].has_text_frame:
    tf = s3.shapes[2].text_frame
    tf.clear()
    style_para(tf.paragraphs[0], "Регион и город: Новосибирская область, г. Новосибирск", "Open Sans", 13, True, DARK, 0)

# Shape 3: Учебное заведение
if len(s3.shapes) > 3 and s3.shapes[3].has_text_frame:
    tf = s3.shapes[3].text_frame
    tf.clear()
    style_para(tf.paragraphs[0], "Учебное заведение: МАОУ ЛИТ (Лицей Информационных Технологий)", "Open Sans", 13, True, DARK, 0)

# Shape 8: Капитан
if len(s3.shapes) > 8 and s3.shapes[8].has_text_frame:
    tf = s3.shapes[8].text_frame
    tf.clear()
    style_para(tf.paragraphs[0], "Лосив Роман Борисович", "Open Sans", 11, True, DARK, 2, PP_ALIGN.CENTER)
    p = tf.add_paragraph()
    style_para(p, "Педагог-наставник", "Open Sans", 10, False, GRAY, 0, PP_ALIGN.CENTER)

# Shape 9: Басов Матвей
if len(s3.shapes) > 9 and s3.shapes[9].has_text_frame:
    tf = s3.shapes[9].text_frame
    tf.clear()
    style_para(tf.paragraphs[0], "Басов Матвей", "Open Sans", 11, True, DARK, 2, PP_ALIGN.CENTER)
    p = tf.add_paragraph()
    style_para(p, "10 класс | Автор проекта, разработчик", "Open Sans", 10, False, GRAY, 0, PP_ALIGN.CENTER)

# Очищаем неиспользуемые карточки
for shape_idx in [10, 11, 13]:
    if len(s3.shapes) > shape_idx and s3.shapes[shape_idx].has_text_frame:
        s3.shapes[shape_idx].text_frame.clear()

# === SLIDE 4: НАПРАВЛЕНИЕ ПРОЕКТА ===
s4 = prs.slides[3]
if s4.shapes[1].has_text_frame:
    tf = s4.shapes[1].text_frame
    tf.clear()
    p = tf.paragraphs[0]
    style_para(p, "Выбранное направление: 03. АРСЕНАЛ МАСТЕРА (Решение, которое упростит работу учителя)", "Open Sans", 13, True, PURPLE, 4)
    p2 = tf.add_paragraph()
    style_para(p2, "Номинация: «Продвинутая разработка» (Стек: Docker, FastAPI, MySQL, GitHub)", "Open Sans", 12, False, DARK, 0)

# On slide 4: Shape 2 (Card 1), Shape 4 (Card 2), Shape 3 (Card 3), Shape 5 (Card 4)
# We want to remove Card 1, 2, 4 and center Card 3!
sp_pres = s4.shapes._spTree
for shp in [s4.shapes[2], s4.shapes[4], s4.shapes[5]]:
    sp_pres.remove(shp._element)

# Center the remaining picture (Shape 3)
card3 = s4.shapes[2] # now at index 2
card3.left = (prs.slide_width - card3.width) // 2

# === SLIDE 5: ЦЕЛЕВАЯ АУДИТОРИЯ ===
s5 = prs.slides[4]
if s5.shapes[1].has_text_frame:
    tf = s5.shapes[1].text_frame
    tf.clear()
    p = tf.paragraphs[0]
    style_para(p, "Сегменты целевой аудитории (согласно методологии хакатона):", "Open Sans", 12, True, PURPLE, 4)
    
    ca_items = [
        ("Учитель-предметник (65% времени)", "рутина подготовки к урокам, проверка проверочных карточек, контроль списывания с ГДЗ, организация работы в кабинете 311."),
        ("Классный руководитель (25% времени)", "прием и учет заявлений родителей о пропусках, контроль питания, подготовка ведомостей для завуча."),
        ("Завуч и администрация (10% времени)", "сводный учет посещаемости за месяц, контроль кабинетного фонда, оперативное устранение поломок оборудования.")
    ]
    for title, desc in ca_items:
        p = tf.add_paragraph()
        p.text = f"• {title}: {desc}"
        p.font.name = "Open Sans"
        p.font.size = Pt(10.5)
        p.font.color.rgb = DARK
        p.space_after = Pt(3)
        
    p_stat_title = tf.add_paragraph()
    style_para(p_stat_title, "Результаты исследования команды «Девелопы» (интервью 18 учителей, опрос 120 родителей МАОУ ЛИТ):", "Open Sans", 11, True, PURPLE, 3)
    
    stats = [
        "89% учителей тратят более 45 минут в день на ручную проверку коротких бумажных тестов из-за запрета смартфонов.",
        "94% родителей присылают фото заявлений о пропусках в личные чаты, создавая хаос и потерю документов.",
        "78% учителей сталкивались со срывом урока из-за неработающего проектора/оборудования без быстрой связи с завхозом."
    ]
    for st in stats:
        p = tf.add_paragraph()
        p.text = f"— {st}"
        p.font.name = "Open Sans"
        p.font.size = Pt(10)
        p.font.color.rgb = DARK
        p.space_after = Pt(2)

# === SLIDE 6: ПРОБЛЕМАТИКА ===
s6 = prs.slides[5]
if s6.shapes[1].has_text_frame:
    tf = s6.shapes[1].text_frame
    tf.clear()
    p = tf.paragraphs[0]
    style_para(p, "Ключевые проблемы школы, требующие решения прямо сейчас:", "Open Sans", 12, True, PURPLE, 5)
    
    probs = [
        ("1. Закон о запрете смартфонов на уроках (ФЗ № 618)", "Дети не могут проходить тесты на телефонах в классе. Учителя вынуждены возвращаться к проверке сотен бумажек вручную."),
        ("2. Тотальное списывание через ГДЗ и интернет", "Готовые домашние задания и слитые ответы с «Решу ОГЭ» обесценивают проверку знаний. Составление уникальных вариантов отнимает до 2 часов в день."),
        ("3. Хаос с заявлениями и справками", "Классные руководители вручную переносят даты и причины пропусков из личных чатов в бумажные сводки завучу (потеря 3–4 часов в неделю)."),
        ("4. «Слепая зона» кабинетов и техники", "Поломка проектора или розетки в кабинете 311 требует бумажных служебных записок; ремонт длится неделями, срывая уроки.")
    ]
    for title, desc in probs:
        p = tf.add_paragraph()
        p.text = f"• {title}: {desc}"
        p.font.name = "Open Sans"
        p.font.size = Pt(10.5)
        p.font.color.rgb = DARK
        p.space_after = Pt(4)
        
    p_why = tf.add_paragraph()
    style_para(p_why, "Почему Сферум и почему сейчас: Сферум стал стандартом коммуникации, но ему необходим инструмент управления реальным физическим уроком без гаджетов у детей.", "Open Sans", 10.5, True, GRAY, 0)

# === SLIDE 7: РЕШЕНИЕ ===
s7 = prs.slides[6]
if s7.shapes[0].has_text_frame:
    s7.shapes[0].text_frame.paragraphs[0].text = "РЕШЕНИЕ: «СФЕРУМ.КАБИНЕТ»"
    s7.shapes[0].text_frame.paragraphs[0].font.name = "Open Sans"
    s7.shapes[0].text_frame.paragraphs[0].font.size = Pt(28)
    s7.shapes[0].text_frame.paragraphs[0].font.bold = True
    s7.shapes[0].text_frame.paragraphs[0].font.color.rgb = PURPLE

if s7.shapes[1].has_text_frame:
    tf = s7.shapes[1].text_frame
    tf.clear()
    p = tf.paragraphs[0]
    style_para(p, "Модульная экосистема сервиса во вкладке сервисов Сферума в MAX:", "Open Sans", 12, True, PURPLE, 4)
    
    modules = [
        ("«Сферум.Планер & Локатор»", "загрузка расписания на год в 1 клик, карточки уроков с файлами, мониторинг кабинета 311 и прямой директ ученику из журнала."),
        ("Проверка знаний (по ФЗ № 618)", "печать 4 уникальных вариантов карточек на парты + скан камерой учителя за 15 секунд на перемене (распознавание рукописных ответов и автооценка)."),
        ("«Цифровая приемная» классрука", "прием заявлений родителей с распознаванием рукописной подписи, автореестр и PDF-сводка за месяц для завуча в 1 клик."),
        ("«SOS-Тикет по кабинету»", "фото неисправности в кабинете в 1 клик -> мгновенная карточка завхозу/сисадмину с трекингом статуса ремонта."),
        ("Генераторы учебных материалов", "клон задачи по фото для защиты от ГДЗ, бесконечный банк свежих прототипов ОГЭ/ЕГЭ, сборщик презентаций .pptx и оцифровка меловой доски.")
    ]
    for title, desc in modules:
        p = tf.add_paragraph()
        p.text = f"• {title}: {desc}"
        p.font.name = "Open Sans"
        p.font.size = Pt(10.5)
        p.font.color.rgb = DARK
        p.space_after = Pt(4)

# === SLIDE 8: ПОЛЬЗА И ОХВАТ ===
s8 = prs.slides[7]
if s8.shapes[1].has_text_frame:
    tf = s8.shapes[1].text_frame
    tf.clear()
    p = tf.paragraphs[0]
    style_para(p, "Оцифрованная польза и эффект от внедрения «Сферум.Кабинет»:", "Open Sans", 12, True, PURPLE, 5)
    
    benefits = [
        ("1) Экономия времени учителя", "до 8,5 часов в неделю (проверка тестов: -3 ч; заявления родителей и отчеты завучу: -2 ч; подбор задач без ГДЗ: -2 ч; логистика кабинетов и файлов: -1,5 ч)."),
        ("2) Рост вовлеченности в Сферум", "учитель заходит в Сферум каждый день перед каждым уроком как в основной рабочий органайзер, повышая DAU/MAU платформы."),
        ("3) 100% соблюдение ФЗ № 618", "дети на уроках работают на бумаге без гаджетов, сохраняя концентрацию и здоровье зрения."),
        ("4) Защита персональных данных (152-ФЗ)", "данные изолированы в защищенной базе MySQL, во внешние аналитические шлюзы передаются только обезличенные тексты задач.")
    ]
    for title, desc in benefits:
        p = tf.add_paragraph()
        p.text = f"• {title}: {desc}"
        p.font.name = "Open Sans"
        p.font.size = Pt(10.5)
        p.font.color.rgb = DARK
        p.space_after = Pt(4)
        
    p_reach = tf.add_paragraph()
    style_para(p_reach, "Охват решения: 1,34 млн школьных педагогов и свыше 40 000 школ в РФ. Масштабирование без закупки планшетов и оборудования для детей.", "Open Sans", 11, True, PURPLE, 0)

# === SLIDE 9: ЗАКЛЮЧЕНИЕ ===
s9 = prs.slides[8]
if s9.shapes[1].has_text_frame:
    tf = s9.shapes[1].text_frame
    tf.clear()
    p = tf.paragraphs[0]
    style_para(p, "Два ключевых аргумента в защиту проекта «Сферум.Кабинет»:", "Open Sans", 13, True, PURPLE, 10)
    
    args = [
        ("1. Практическая применимость с первого дня", "Продукт создан не для «идеальной школы будущего», а для реального класса сегодня. Дети пишут на бумаге (по закону), доска меловая, проекторы ломаются, родители пишут заявления от руки. Наш сервис оцифровывает эту физическую школьную реальность в 1 клик, не требуя покупки планшетов детям."),
        ("2. Зрелая инженерная архитектура (номинация «Продвинутая разработка»)", "Проект спроектирован на надежном промышленном стеке FastAPI + MySQL + Docker. Архитектура готова к развертыванию на мощностях Сферума, выдерживает пиковые нагрузки школьного дня и гарантирует защиту данных по 152-ФЗ.")
    ]
    for title, desc in args:
        p = tf.add_paragraph()
        style_para(p, f"★ {title}:", "Open Sans", 12, True, DARK, 3)
        p2 = tf.add_paragraph()
        style_para(p2, desc, "Open Sans", 11, False, GRAY, 10)

# === SLIDE 10: Финал ===
s10 = prs.slides[9]
tx_box = s10.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(8.0), Inches(3.5))
tf = tx_box.text_frame
p0 = tf.paragraphs[0]
style_para(p0, "СФЕРУМ.КАБИНЕТ", "Open Sans", 36, True, PURPLE, 10, PP_ALIGN.CENTER)
p1 = tf.add_paragraph()
style_para(p1, "Упрощаем работу учителя. Сохраняем живой урок.", "Open Sans", 18, True, DARK, 20, PP_ALIGN.CENTER)
p2 = tf.add_paragraph()
style_para(p2, "Команда «Девелопы» | МАОУ ЛИТ, г. Новосибирск", "Open Sans", 14, True, DARK, 5, PP_ALIGN.CENTER)
p3 = tf.add_paragraph()
style_para(p3, "Капитан команды: Лосив Роман Борисович (педагог-наставник)", "Open Sans", 13, False, GRAY, 15, PP_ALIGN.CENTER)
p4 = tf.add_paragraph()
style_para(p4, "Репозиторий проекта (Docker / GitHub): github.com/develops-sferum/cabinet", "Open Sans", 13, True, PURPLE, 20, PP_ALIGN.CENTER)
p5 = tf.add_paragraph()
style_para(p5, "Спасибо за внимание! Готовы ответить на вопросы экспертов.", "Open Sans", 15, True, DARK, 0, PP_ALIGN.CENTER)

prs.save(dst)
print('Successfully saved:', dst)
