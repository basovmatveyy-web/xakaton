import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.chart import BarChart, Reference

def build_complete_workbook():
    wb = openpyxl.Workbook()

    # Styling constants
    NAVY_DARK = '1F497D'       # Primary header fill
    NAVY_LIGHT = 'DCE6F1'      # Accent / subheader fill
    ACCENT_BLUE = '366092'     # Headers
    ZEBRA_FILL = 'F9FAFB'      # Soft row zebra
    SUMMARY_FILL = 'F2F4F7'    # Summary cards
    HIGHLIGHT_GREEN = 'E2EFDA' # Answer highlight
    BORDER_GRAY = 'D9D9D9'

    font_title = Font(name='Calibri', size=16, bold=True, color='1F497D')
    font_subtitle = Font(name='Calibri', size=10, italic=True, color='595959')
    font_header = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
    font_data = Font(name='Calibri', size=11, color='000000')
    font_data_bold = Font(name='Calibri', size=11, bold=True, color='000000')
    font_summary_lbl = Font(name='Calibri', size=11, bold=True, color='1F497D')
    font_summary_val = Font(name='Calibri', size=11, bold=True, color='1F497D')
    font_note = Font(name='Calibri', size=10, italic=True, color='595959')

    fill_header = PatternFill(start_color=NAVY_DARK, end_color=NAVY_DARK, fill_type='solid')
    fill_accent = PatternFill(start_color=ACCENT_BLUE, end_color=ACCENT_BLUE, fill_type='solid')
    fill_sub_header = PatternFill(start_color=NAVY_LIGHT, end_color=NAVY_LIGHT, fill_type='solid')
    fill_zebra = PatternFill(start_color=ZEBRA_FILL, end_color=ZEBRA_FILL, fill_type='solid')
    fill_summary = PatternFill(start_color=SUMMARY_FILL, end_color=SUMMARY_FILL, fill_type='solid')
    fill_highlight = PatternFill(start_color=HIGHLIGHT_GREEN, end_color=HIGHLIGHT_GREEN, fill_type='solid')

    thin_border = Side(border_style='thin', color=BORDER_GRAY)
    medium_border = Side(border_style='medium', color=NAVY_DARK)
    double_border = Side(border_style='double', color=NAVY_DARK)

    border_all = Border(left=thin_border, right=thin_border, top=thin_border, bottom=thin_border)
    border_header = Border(left=thin_border, right=thin_border, top=medium_border, bottom=medium_border)
    border_total = Border(left=thin_border, right=thin_border, top=thin_border, bottom=double_border)

    align_center = Alignment(horizontal='center', vertical='center')
    align_left = Alignment(horizontal='left', vertical='center')
    align_right = Alignment(horizontal='right', vertical='center')
    align_wrap = Alignment(horizontal='center', vertical='center', wrap_text=True)

    # =========================================================================
    # SHEET 1: ЗАДАНИЕ 54 (Классный журнал, Таблица 1)
    # =========================================================================
    ws54 = wb.active
    ws54.title = 'Задание 54 (Классный журнал)'
    ws54.views.sheetView[0].showGridLines = True

    ws54['A1'] = 'Задание № 54. Статистический анализ отметок классного журнала (Таблица 1)'
    ws54['A1'].font = font_title
    ws54['A2'] = 'Расчёт статистических показателей: СРЗНАЧ(), МЕДИАНА(), МАКС(), МИН(), размах, СТАНДОТКЛОНП() и построение диаграмм'
    ws54['A2'].font = font_subtitle

    dates = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 22, 24, 25, 26, 27]
    date_cols = {}
    for i, d in enumerate(dates):
        col_letter = get_column_letter(3 + i) # Starts at C
        date_cols[d] = col_letter

    # Group Header Row 4
    ws54.merge_cells('C4:Y4')
    ws54['C4'] = 'Февраль (числа месяца)'
    ws54['C4'].font = font_header
    ws54['C4'].fill = fill_accent
    ws54['C4'].alignment = align_center

    ws54.merge_cells('Z4:AE4')
    ws54['Z4'] = 'Статистические показатели (Задание 54: пп. 1, 2, 4, 5)'
    ws54['Z4'].font = font_header
    ws54['Z4'].fill = fill_header
    ws54['Z4'].alignment = align_center

    ws54.merge_cells('AF4:AG4')
    ws54['AF4'] = 'Посещаемость'
    ws54['AF4'].font = font_header
    ws54['AF4'].fill = PatternFill(start_color='4F81BD', end_color='4F81BD', fill_type='solid')
    ws54['AF4'].alignment = align_center

    # Header Row 5
    ws54['A5'] = '№ п/п'
    ws54['B5'] = 'ФИО'
    ws54['A5'].font = font_header
    ws54['B5'].font = font_header
    ws54['A5'].fill = fill_header
    ws54['B5'].fill = fill_header
    ws54['A5'].alignment = align_center
    ws54['B5'].alignment = align_left
    ws54['A5'].border = border_header
    ws54['B5'].border = border_header

    for d in dates:
        c_letter = date_cols[d]
        cell = ws54[f'{c_letter}5']
        cell.value = d
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = border_header

    stat_headers_54 = [
        ('Z5', '1) Ср. балл\nСРЗНАЧ()', 12),
        ('AA5', '2) Медиана\nМЕДИАНА()', 12),
        ('AB5', 'Макс\nМАКС()', 9),
        ('AC5', 'Мин\nМИН()', 9),
        ('AD5', '4) Размах\n(МАКС-МИН)', 12),
        ('AE5', '5) Ст. отклон.\nСТАНДОТКЛОНП()', 16),
        ('AF5', 'Оценок', 9),
        ('AG5', 'Пропусков', 11),
    ]

    for ref, text, w in stat_headers_54:
        cell = ws54[ref]
        cell.value = text
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_wrap
        cell.border = border_header

    ws54.row_dimensions[4].height = 20
    ws54.row_dimensions[5].height = 32

    students_data = [
        (1, 'Анисимов Артём',     {1:4, 3:3, 5:2, 11:4, 24:5, 27:3}),
        (2, 'Боровик Борис',      {2:5, 3:4, 8:5, 11:5, 16:5, 18:4, 20:'н', 22:'н', 24:5, 26:5}),
        (3, 'Васнецова Виктория', {1:4, 2:3, 3:4, 10:4, 11:3, 15:'н', 24:4, 27:2}),
        (4, 'Галиева Гюзель',     {3:3, 4:3, 8:2, 11:4, 17:'н', 18:'н', 19:'н', 24:4}),
        (5, 'Дорош Дмитрий',      {1:5, 3:5, 8:3, 11:3, 15:4, 24:5, 27:4}),
        (6, 'Ерёмин Егор',        {3:4, 9:3, 11:3, 16:4, 20:'н', 22:'н', 24:4, 25:3}),
        (7, 'Жукова Евгения',     {3:5, 8:4, 11:3, 13:5, 19:5, 24:3}),
        (8, 'Зыкова Зоя',         {3:5, 6:3, 11:4, 17:3, 24:'н', 25:'н', 26:'н', 27:'н'}),
        (9, 'Игнатюк Ирина',      {2:5, 3:'н', 6:2, 11:5, 17:'н', 18:'н', 19:'н', 20:2, 24:2, 26:5}),
        (10, 'Кулаева Касима',    {3:3, 5:4, 10:4, 11:4, 13:'н', 15:'н', 24:4}),
        (11, 'Лисицын Лев',       {3:5, 11:4, 17:3, 20:2, 24:4, 25:'н'}),
        (12, 'Магомедов Мурад',   {3:4, 4:5, 11:'н', 15:'н', 19:5, 24:4}),
        (13, 'Ногина Анастасия',  {3:4, 8:2, 9:3, 11:3, 13:5, 24:4}),
        (14, 'Орлов Олег',        {1:3, 3:3, 8:3, 11:2, 17:2, 18:4, 24:3, 27:3}),
        (15, 'Палий Павел',       {3:3, 11:4, 20:'н', 22:'н', 24:'н', 25:'н'})
    ]

    for idx, name, marks in students_data:
        r = 5 + idx
        ws54[f'A{r}'] = idx
        ws54[f'B{r}'] = name
        ws54[f'A{r}'].alignment = align_center
        ws54[f'B{r}'].alignment = align_left

        for d in dates:
            col_let = date_cols[d]
            cell = ws54[f'{col_let}{r}']
            if d in marks:
                cell.value = marks[d]
                if marks[d] == 'н':
                    cell.font = Font(name='Calibri', size=11, bold=True, color='C00000')
                else:
                    cell.font = font_data
            cell.alignment = align_center
            cell.border = border_all

        # Statistical formulas for each student
        ws54[f'Z{r}'] = f'=AVERAGE(C{r}:Y{r})'
        ws54[f'AA{r}'] = f'=MEDIAN(C{r}:Y{r})'
        ws54[f'AB{r}'] = f'=MAX(C{r}:Y{r})'
        ws54[f'AC{r}'] = f'=MIN(C{r}:Y{r})'
        ws54[f'AD{r}'] = f'=AB{r}-AC{r}'
        ws54[f'AE{r}'] = f'=STDEVP(C{r}:Y{r})'
        ws54[f'AF{r}'] = f'=COUNT(C{r}:Y{r})'
        ws54[f'AG{r}'] = f'=COUNTIF(C{r}:Y{r}, "н")'

        ws54[f'Z{r}'].number_format = '0.00'
        ws54[f'AA{r}'].number_format = '0.0'
        ws54[f'AB{r}'].number_format = '0'
        ws54[f'AC{r}'].number_format = '0'
        ws54[f'AD{r}'].number_format = '0'
        ws54[f'AE{r}'].number_format = '0.00'
        ws54[f'AF{r}'].number_format = '0'
        ws54[f'AG{r}'].number_format = '0'

        ws54[f'Z{r}'].font = font_data_bold
        ws54[f'AA{r}'].font = font_data_bold
        ws54[f'AD{r}'].font = font_data_bold
        ws54[f'AE{r}'].font = font_data_bold

        ws54[f'Z{r}'].alignment = align_right
        ws54[f'AA{r}'].alignment = align_right
        ws54[f'AB{r}'].alignment = align_center
        ws54[f'AC{r}'].alignment = align_center
        ws54[f'AD{r}'].alignment = align_center
        ws54[f'AE{r}'].alignment = align_right
        ws54[f'AF{r}'].alignment = align_center
        ws54[f'AG{r}'].alignment = align_center

        for col_l in ['A', 'B', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG']:
            ws54[f'{col_l}{r}'].border = border_all

        if idx % 2 == 0:
            fill_row_sub = PatternFill(start_color='F4F7FA', end_color='F4F7FA', fill_type='solid')
            for col_i in range(1, 34):
                let = get_column_letter(col_i)
                ws54[f'{let}{r}'].fill = fill_row_sub

        ws54.row_dimensions[r].height = 20

    # Summary Row 21
    ws54['B21'] = 'Итого / Среднее по классу'
    ws54['B21'].font = font_summary_lbl
    ws54['B21'].fill = fill_sub_header
    ws54['B21'].alignment = align_left
    ws54['B21'].border = border_total
    ws54['A21'].border = border_total
    ws54['A21'].fill = fill_sub_header

    for d in dates:
        c_let = date_cols[d]
        c_avg = ws54[f'{c_let}21']
        c_avg.value = f'=IF(COUNT({c_let}6:{c_let}20)>0, AVERAGE({c_let}6:{c_let}20), "")'
        c_avg.number_format = '0.00'
        c_avg.alignment = align_center
        c_avg.font = font_data_bold
        c_avg.fill = fill_sub_header
        c_avg.border = border_total

    ws54['Z21'] = '=AVERAGE(Z6:Z20)'
    ws54['AA21'] = '=MEDIAN(Z6:Z20)'
    ws54['AB21'] = '=MAX(AB6:AB20)'
    ws54['AC21'] = '=MIN(AC6:AC20)'
    ws54['AD21'] = '=AVERAGE(AD6:AD20)'
    ws54['AE21'] = '=AVERAGE(AE6:AE20)'
    ws54['AF21'] = '=SUM(AF6:AF20)'
    ws54['AG21'] = '=SUM(AG6:AG20)'

    ws54['Z21'].number_format = '0.00'
    ws54['AA21'].number_format = '0.0'
    ws54['AB21'].number_format = '0'
    ws54['AC21'].number_format = '0'
    ws54['AD21'].number_format = '0.0'
    ws54['AE21'].number_format = '0.00'

    for col_tot in ['Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG']:
        c = ws54[f'{col_tot}21']
        c.font = font_summary_val
        c.fill = fill_highlight if col_tot in ['Z', 'AA'] else fill_sub_header
        c.border = border_total
        c.alignment = align_right if col_tot in ['Z', 'AA', 'AE'] else align_center

    ws54.row_dimensions[21].height = 24

    # -------------------------------------------------------------
    # ANSWERS CARD (Rows 24 to 34)
    # -------------------------------------------------------------
    ws54.merge_cells('B24:P24')
    ws54['B24'] = 'ОТВЕТЫ НА ВОПРОСЫ ЗАДАНИЯ № 54'
    ws54['B24'].font = font_header
    ws54['B24'].fill = fill_header
    ws54['B24'].alignment = align_left
    ws54.row_dimensions[24].height = 24

    for c_i in range(2, 17):
        let = get_column_letter(c_i)
        ws54[f'{let}24'].border = border_all
        ws54[f'{let}24'].fill = fill_header

    answers_table = [
        (25, '1) Средний балл каждого ученика', 'Вычислен в столбце Z', 'Использована функция =СРЗНАЧ(C6:Y6)', False),
        (26, '2) Медиана отметок каждого ученика', 'Вычислена в столбце AA', 'Использована функция =МЕДИАНА(C6:Y6)', False),
        (27, '3) Кто лучше всех успевает по математике?', 'Боровик Борис', 'Наивысший ср. балл 4,75 (медиана 5,0). На 2-м месте: Магомедов Мурад (4,50)', True),
        (28, '3*) Кто хуже всех успевает по математике?', 'Орлов Олег', 'Наименьший ср. балл 2,88 (медиана 3,0) — единственный с баллом ниже тройки', True),
        (29, '4) Размах отметок каждого ученика', 'Вычислен в столбце AD', 'Разность между максимумом и минимумом: =МАКС() - МИН()', False),
        (30, '5) Стандартное отклонение отметок', 'Вычислено в столбце AE', 'Использована функция =СТАНДОТКЛОНП(C6:Y6)', False),
        (31, '6) Наиболее стабильные результаты:', 'Кулаева Касима (σ = 0,40)\nБоровик Борис (σ = 0,43)', 'Наименьший разброс отметок: размах всего 1 балл (у Кулаевой только 4 и 3; у Боровика только 5 и 4)', True),
        (32, '6*) Наименее стабильные результаты:', 'Игнатюк Ирина (σ = 1,50)\nЛисицын Лев (σ = 1,02)', 'Наибольший разброс отметок: у Игнатюк размах 3 балла, бросает из крайности в крайность (только 5 и 2)', True),
        (33, '7) Отразите данные на диаграммах:', 'Построены 2 диаграммы ниже', 'Диаграмма успеваемости (ср. балл и медиана) и диаграмма стабильности (размах и ст. отклонение)', False),
    ]

    for r_ans, q_text, val_text, note_text, is_lead in answers_table:
        # Merge B:F for Question
        ws54.merge_cells(f'B{r_ans}:F{r_ans}')
        ws54[f'B{r_ans}'] = q_text
        ws54[f'B{r_ans}'].alignment = align_left
        ws54[f'B{r_ans}'].font = font_summary_lbl

        # Merge G:I for Answer
        ws54.merge_cells(f'G{r_ans}:I{r_ans}')
        ws54[f'G{r_ans}'] = val_text
        ws54[f'G{r_ans}'].alignment = align_wrap
        ws54[f'G{r_ans}'].font = Font(name='Calibri', size=11, bold=True, color='1F497D' if not is_lead else '276A3C')

        # Merge J:P for Explanation
        ws54.merge_cells(f'J{r_ans}:P{r_ans}')
        ws54[f'J{r_ans}'] = note_text
        ws54[f'J{r_ans}'].alignment = align_left
        ws54[f'J{r_ans}'].font = font_note

        fill_row_ans = fill_highlight if is_lead else fill_summary

        for c_idx in range(2, 17):
            let = get_column_letter(c_idx)
            cell = ws54[f'{let}{r_ans}']
            cell.border = border_all
            cell.fill = fill_row_ans

        ws54.row_dimensions[r_ans].height = 32 if '\n' in val_text else 24

    # -------------------------------------------------------------
    # CHARTS (Point 7 of Task 54)
    # -------------------------------------------------------------
    # Chart 1: Mean & Median
    chart1 = BarChart()
    chart1.type = 'col'
    chart1.style = 10
    chart1.title = 'Диаграмма 1. Успеваемость учащихся (Средний балл и медиана)'
    chart1.y_axis.title = 'Балл'
    chart1.x_axis.title = 'Учащиеся'
    chart1.height = 14
    chart1.width = 24

    data1 = Reference(ws54, min_col=26, min_row=5, max_col=27, max_row=20) # Cols Z and AA
    cats1 = Reference(ws54, min_col=2, min_row=6, max_row=20)              # Col B (Names)
    chart1.add_data(data1, titles_from_data=True)
    chart1.set_categories(cats1)
    ws54.add_chart(chart1, 'B36')

    # Chart 2: Stability (Range & Standard Deviation)
    chart2 = BarChart()
    chart2.type = 'col'
    chart2.style = 11
    chart2.title = 'Диаграмма 2. Стабильность отметок (Размах и Стандартное отклонение)'
    chart2.y_axis.title = 'Величина показателя'
    chart2.x_axis.title = 'Учащиеся'
    chart2.height = 14
    chart2.width = 24

    data2 = Reference(ws54, min_col=30, min_row=5, max_col=31, max_row=20) # Cols AD and AE
    chart2.add_data(data2, titles_from_data=True)
    chart2.set_categories(cats1)
    ws54.add_chart(chart2, 'N36')

    # Column widths for Sheet 1
    ws54.column_dimensions['A'].width = 6
    ws54.column_dimensions['B'].width = 24
    for d in dates:
        ws54.column_dimensions[date_cols[d]].width = 4.8
    ws54.column_dimensions['Z'].width = 13
    ws54.column_dimensions['AA'].width = 13
    ws54.column_dimensions['AB'].width = 9
    ws54.column_dimensions['AC'].width = 9
    ws54.column_dimensions['AD'].width = 13
    ws54.column_dimensions['AE'].width = 17
    ws54.column_dimensions['AF'].width = 9
    ws54.column_dimensions['AG'].width = 11

    # =========================================================================
    # SHEET 2: ЗАДАНИЕ 55 (Кирпичи)
    # =========================================================================
    ws55 = wb.create_sheet(title='Задание 55 (Кирпичи)')
    ws55.views.sheetView[0].showGridLines = True

    ws55['A1'] = 'Задача № 55. Проверка качества партии кирпича (20 упаковок)'
    ws55['A1'].font = font_title
    ws55['A2'] = 'Выборка из 20 упаковок: длины кирпичей (в см), отклонения от средней и расчёт статистических характеристик'
    ws55['A2'].font = font_subtitle

    headers_s2 = [
        ('A5', '№ п/п', 8),
        ('B5', 'Длина xᵢ (см)', 15),
        ('C5', 'Отклонение (xᵢ - x̄) (см)', 24),
        ('D5', 'Квадрат отклонения (xᵢ - x̄)²', 26),
        ('E5', 'Модуль отклонения |xᵢ - x̄|', 24),
        ('F5', 'Отличие > 0,2 см? (п. в)', 22),
        ('G5', 'Отличие > σ (0,5 см)? (п. г)', 24)
    ]
    for cell_ref, text, w in headers_s2:
        c = ws55[cell_ref]
        c.value = text
        c.font = font_header
        c.fill = fill_header
        c.alignment = align_wrap
        c.border = border_header
    ws55.row_dimensions[5].height = 34

    bricks = [
        20.5, 20.1, 21.3, 20.3, 19.8, 19.2, 20.1, 19.6, 20.2, 20.0,
        20.5, 19.7, 19.9, 20.5, 19.6, 20.1, 19.4, 19.8, 19.1, 20.3
    ]

    for idx, val in enumerate(bricks, 1):
        r = 5 + idx
        ws55[f'A{r}'] = idx
        ws55[f'B{r}'] = val
        ws55[f'C{r}'] = f'=B{r}-$J$8'
        ws55[f'D{r}'] = f'=(B{r}-$J$8)^2'
        ws55[f'E{r}'] = f'=ABS(B{r}-$J$8)'
        ws55[f'F{r}'] = f'=IF(E{r}>0.2, "Да", "Нет")'
        ws55[f'G{r}'] = f'=IF(E{r}>$J$11, "Да", "Нет")'

        row_fill = fill_zebra if idx % 2 == 0 else PatternFill(fill_type=None)
        for col_l in ['A', 'B', 'C', 'D', 'E', 'F', 'G']:
            cell = ws55[f'{col_l}{r}']
            cell.font = font_data
            cell.border = border_all
            if idx % 2 == 0:
                cell.fill = row_fill

        ws55[f'A{r}'].alignment = align_center
        ws55[f'B{r}'].alignment = align_right
        ws55[f'B{r}'].number_format = '0.0'
        ws55[f'C{r}'].alignment = align_right
        ws55[f'C{r}'].number_format = '+0.00;-0.00;0.00'
        ws55[f'D{r}'].alignment = align_right
        ws55[f'D{r}'].number_format = '0.0000'
        ws55[f'E{r}'].alignment = align_right
        ws55[f'E{r}'].number_format = '0.00'
        ws55[f'F{r}'].alignment = align_center
        ws55[f'G{r}'].alignment = align_center
        ws55.row_dimensions[r].height = 20

    # Total row (Row 26)
    ws55['A26'] = 'Итого'
    ws55['B26'] = '=SUM(B6:B25)'
    ws55['C26'] = '=SUM(C6:C25)'
    ws55['D26'] = '=SUM(D6:D25)'
    ws55['E26'] = ''
    ws55['F26'] = '=COUNTIF(F6:F25, "Да")'
    ws55['G26'] = '=COUNTIF(G6:G25, "Да")'

    for col_l in ['A', 'B', 'C', 'D', 'E', 'F', 'G']:
        cell = ws55[f'{col_l}26']
        cell.font = font_data_bold
        cell.fill = fill_sub_header
        cell.border = border_total
    ws55['A26'].alignment = align_center
    ws55['B26'].alignment = align_right
    ws55['B26'].number_format = '0.0'
    ws55['C26'].alignment = align_right
    ws55['C26'].number_format = '0.00'
    ws55['D26'].alignment = align_right
    ws55['D26'].number_format = '0.0000'
    ws55['F26'].alignment = align_center
    ws55['G26'].alignment = align_center
    ws55.row_dimensions[26].height = 22

    # Summary Card on Sheet 2
    ws55.merge_cells('I4:K4')
    ws55['I4'] = 'Сводный расчет и ответы к задаче № 55'
    ws55['I4'].font = font_header
    ws55['I4'].fill = fill_header
    ws55['I4'].alignment = align_center
    ws55.row_dimensions[4].height = 26

    summary_items_s2 = [
        (5, 'Объем выборки (n)', '=COUNT(B6:B25)', '0 "шт."', 'Количество кирпичей в выборке', False),
        (6, 'Сумма всех длин (Σxᵢ)', '=SUM(B6:B25)', '0.0 "см"', 'Суммарная длина 20 кирпичей', False),
        (7, 'Сумма квадратов отклонений Σ(xᵢ-x̄)²', '=SUM(D6:D25)', '0.0000', 'Сумма квадратов разностей', False),
        (8, 'а) Средняя длина кирпича (x̄)', '=AVERAGE(B6:B25)', '0.00 "см"', 'Ответ (а): 400 / 20 = 20,0 см', True),
        (9, 'Дисперсия генеральная (D = σ²)', '=J7/J5', '0.0000', 'D = Σ(xᵢ-x̄)² / n = 5 / 20 = 0,25', False),
        (10, 'Дисперсия выборочная (s²)', '=J7/(J5-1)', '0.0000', 's² = Σ(xᵢ-x̄)² / (n - 1) = 5 / 19 ≈ 0,2632', False),
        (11, 'б) Стандартное отклонение σ (ген.)', '=SQRT(J9)', '0.00 "см"', 'Ответ (б): √0,25 = 0,5 см', True),
        (12, 'б*) Стандартное отклонение s (выб.)', '=SQRT(J10)', '0.000 "см"', 'Несмещенная оценка: √0,2632 ≈ 0,513 см', False),
        (13, 'Количество кирпичей (|x - x̄| > 0,2 см)', '=COUNTIF(F6:F25, "Да")', '0 "шт."', 'Кирпичи с отклонением строго > 0,2 см', False),
        (14, 'в) Процент кирпичей с отклонением > 0,2 см', '=J13/J5', '0.0%', 'Ответ (в): 12 / 20 = 60,0%', True),
        (15, 'Количество кирпичей (|x - x̄| > σ)', '=COUNTIF(G6:G25, "Да")', '0 "шт."', 'Кирпичи с отклонением строго > 0,5 см', False),
        (16, 'г) Процент кирпичей с отклонением > σ', '=J15/J5', '0.0%', 'Ответ (г): 4 / 20 = 20,0%', True),
    ]

    for r, label, form, fmt, note, is_ans in summary_items_s2:
        c_l = ws55[f'I{r}']
        c_v = ws55[f'J{r}']
        c_n = ws55[f'K{r}']

        c_l.value = label
        c_v.value = form
        c_n.value = note

        c_l.border = border_all
        c_v.border = border_all
        c_n.border = border_all

        c_v.number_format = fmt
        c_v.alignment = align_right
        c_l.alignment = align_left
        c_n.alignment = align_left

        if is_ans:
            c_l.font = font_summary_lbl
            c_v.font = font_summary_val
            c_l.fill = fill_highlight
            c_v.fill = fill_highlight
            c_n.fill = fill_highlight
            c_n.font = Font(name='Calibri', size=10, bold=True, color='276A3C')
        else:
            c_l.font = font_data
            c_v.font = font_data_bold
            c_n.font = font_note
            c_l.fill = fill_summary
            c_v.fill = fill_summary
        ws55.row_dimensions[r].height = 22

    # Column widths for Sheet 2
    ws55.column_dimensions['A'].width = 8
    ws55.column_dimensions['B'].width = 15
    ws55.column_dimensions['C'].width = 24
    ws55.column_dimensions['D'].width = 28
    ws55.column_dimensions['E'].width = 24
    ws55.column_dimensions['F'].width = 22
    ws55.column_dimensions['G'].width = 26
    ws55.column_dimensions['H'].width = 4
    ws55.column_dimensions['I'].width = 42
    ws55.column_dimensions['J'].width = 18
    ws55.column_dimensions['K'].width = 42

    out_file = '/Users/motya7701/Downloads/MY PROJECT/Решение_Задач_Статистика.xlsx'
    wb.save(out_file)
    print(f'Done! Successfully saved updated workbook to {out_file}')

if __name__ == '__main__':
    build_complete_workbook()
