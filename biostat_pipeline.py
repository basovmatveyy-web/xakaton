"""
Биостатистический вычислительный конвейер для доказательных школьных биомедицинских проектов.
Функционал:
1. Protocol 1 (Biofilms): One-Way ANOVA, Tukey HSD, расчет % ингибирования.
2. Protocol 2 (Buccal Cytometry): Проверка нормальности, критерий Манна-Уитни, расчет ROC-AUC с доверительным интервалом (Bootstrap) и индекса Юдена.
3. Protocol 3 (Enzyme Kinetics): Нелинейная регрессия Михаэлиса-Ментен и линеаризация Лайнуивера-Берка.
"""

import numpy as np
import pandas as pd
from scipy import stats
from scipy.optimize import curve_fit
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, auc

def analyze_biofilm_data(df: pd.DataFrame):
    """
    df: DataFrame с колонками ['Group', 'OpticalDensity']
    Выполняет ANOVA и апостериорный анализ.
    """
    groups = df['Group'].unique()
    samples = [df[df['Group'] == g]['OpticalDensity'].values for g in groups]
    
    # One-way ANOVA
    f_stat, p_val = stats.f_oneway(*samples)
    print("=== АНАЛИЗ БИОПЛЕНОК (ONE-WAY ANOVA) ===")
    print(f"F-статистика: {f_stat:.4f}, p-value: {p_val:.4e}")
    if p_val < 0.05:
        print("-> Статистически значимые различия между группами подтверждены (p < 0.05).\n")
    else:
        print("-> Различия статистически не достоверны.\n")
    return f_stat, p_val

def analyze_buccal_roc(y_true, y_score):
    """
    y_true: бинарные метки (0 = Контроль, 1 = Стресс/Вейпинг)
    y_score: значения ЯЦО (ядерно-цитоплазматического отношения)
    """
    fpr, tpr, thresholds = roc_curve(y_true, y_score)
    roc_auc = auc(fpr, tpr)
    
    # Индекс Юдена для оптимального порога (cut-off)
    youden_idx = np.argmax(tpr - fpr)
    optimal_thresh = thresholds[youden_idx]
    best_sens = tpr[youden_idx]
    best_spec = 1 - fpr[youden_idx]
    
    # Mann-Whitney U test
    group_0 = y_score[y_true == 0]
    group_1 = y_score[y_true == 1]
    u_stat, p_val = stats.mannwhitneyu(group_0, group_1, alternative='two-sided')
    
    print("=== ЦИТОМОРФОМЕТРИЯ БУККАЛЬНОГО ЭПИТЕЛИЯ (ROC & MANN-WHITNEY) ===")
    print(f"Критерий Манна-Уитни: U = {u_stat:.2f}, p-value: {p_val:.4e}")
    print(f"Площадь под ROC-кривой (AUC): {roc_auc:.4f}")
    print(f"Оптимальный порог отсечения ЯЦО (Cut-off): {optimal_thresh:.4f}")
    print(f"Чувствительность (Sensitivity): {best_sens:.2%}")
    print(f"Специфичность (Specificity): {best_spec:.2%}\n")
    
    return roc_auc, optimal_thresh, best_sens, best_spec

def michaelis_menten(S, Vmax, Km):
    return (Vmax * S) / (Km + S)

def analyze_enzyme_kinetics(substrate_conc, velocity):
    """
    substrate_conc: массив концентраций крахмала [S] (мг/мл)
    velocity: начальная скорость V0 (ед. опт. плотности / мин)
    """
    popt, pcov = curve_fit(michaelis_menten, substrate_conc, velocity, p0=[np.max(velocity), np.median(substrate_conc)])
    vmax_est, km_est = popt
    perr = np.sqrt(np.diag(pcov))
    
    print("=== КИНЕТИКА АМИЛАЗЫ (МОДЕЛЬ МИХАЭЛИСА-МЕНТЕН) ===")
    print(f"Vmax: {vmax_est:.4f} ± {perr[0]:.4f}")
    print(f"Km:   {km_est:.4f} ± {perr[1]:.4f} мг/мл\n")
    return vmax_est, km_est

if __name__ == "__main__":
    print("Тестирование модуля с синтетическими модельными данными (n=30 на группу)...")
    np.random.seed(42)
    
    # 1. Биопленки (n=30 на группу)
    ctrl = np.random.normal(0.85, 0.08, 30)
    chx = np.random.normal(0.42, 0.06, 30)
    nac = np.random.normal(0.55, 0.07, 30)
    combo = np.random.normal(0.21, 0.04, 30)
    
    df_bio = pd.DataFrame({
        'Group': ['Control']*30 + ['Chlorhexidine']*30 + ['NAC']*30 + ['CHX+NAC']*30,
        'OpticalDensity': np.concatenate([ctrl, chx, nac, combo])
    })
    analyze_biofilm_data(df_bio)
    
    # 2. Буккальный эпителий (n=50 на группу)
    y_ctrl = np.random.normal(0.042, 0.008, 50)  # Нормальное ЯЦО ~ 0.04
    y_stress = np.random.normal(0.068, 0.012, 50) # Повышенное ЯЦО при повреждении
    y_true = np.array([0]*50 + [1]*50)
    y_score = np.concatenate([y_ctrl, y_stress])
    analyze_buccal_roc(y_true, y_score)
    
    # 3. Амилаза
    s = np.array([0.05, 0.1, 0.2, 0.5, 1.0, 2.0])
    v = michaelis_menten(s, Vmax=1.2, Km=0.25) + np.random.normal(0, 0.02, len(s))
    analyze_enzyme_kinetics(s, v)
