import React, { useState } from 'react';
import { Card, Button, FormItem, Input, Select, Checkbox } from '@vkontakte/vkui';
import {
  Eye,
  EyeOff,
  School,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SCHOOLS_LIST } from './demoPersonas';
import { formatSnils } from './utils';
import type { SnilsLoginRequest } from '../../types/auth';

interface SnilsLoginTabProps {
  onLoginSnils: (req: SnilsLoginRequest) => Promise<boolean>;
  onLoginEsia: () => Promise<boolean>;
  isLoading?: boolean;
  errorMessage?: string | null;
}


export const SnilsLoginTab: React.FC<SnilsLoginTabProps> = ({
  onLoginSnils,
  onLoginEsia,
  isLoading,
  errorMessage
}) => {
  const [schoolId, setSchoolId] = useState(SCHOOLS_LIST[0].id);
  const [snils, setSnils] = useState('154-289-902 84');
  const [password, setPassword] = useState('Lit2026!Secured');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const cleanSnilsLength = snils.replace(/\D/g, '').length;
  const isSnilsComplete = cleanSnilsLength === 11;

  const handleSnilsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const formatted = formatSnils(e.target.value);
    setSnils(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSnilsComplete) {
      setLocalError('Введите все 11 цифр СНИЛС в формате XXX-XXX-XXX XX');
      return;
    }
    if (!password.trim()) {
      setLocalError('Введите пароль от личного кабинета');
      return;
    }
    setLocalError(null);
    onLoginSnils({
      snils,
      password,
      schoolId,
      rememberMe
    });
  };

  const handleFillDemo = () => {
    setSchoolId('lit');
    setSnils('154-289-902 84');
    setPassword('Lit2026!Secured');
    setLocalError(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card
        mode="outline"
        style={{
          padding: 20,
          borderRadius: 16,
          background: 'var(--vkui--color_background_content, #ffffff)',
          border: '1px solid var(--vkui--color_separator_primary, #e2e8f0)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <School size={20} color="#2d82ec" />
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--vkui--color_text_primary, #0f172a)' }}>
              Вход по СНИЛС и паролю
            </span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            style={{
              background: 'rgba(45, 130, 236, 0.1)',
              border: 'none',
              borderRadius: 6,
              color: '#2d82ec',
              fontSize: 11,
              fontWeight: 600,
              padding: '4px 8px',
              cursor: 'pointer'
            }}
          >
            Тестовые данные
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Выбор образовательной организации */}
          <FormItem top="Образовательная организация:" style={{ padding: 0, marginBottom: 12 }}>
            <Select
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              options={SCHOOLS_LIST.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.code})`
              }))}
            />
          </FormItem>

          {/* Ввод СНИЛС с динамической маской XXX-XXX-XXX XX */}
          <FormItem
            top={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>СНИЛС педагога (11 цифр):</span>
                {isSnilsComplete && (
                  <span style={{ color: '#10b981', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Формат верен
                  </span>
                )}
              </div>
            }
            style={{ padding: 0, marginBottom: 12 }}
          >
            <div style={{ position: 'relative' }}>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="XXX-XXX-XXX XX (например: 154-289-902 84)"
                value={snils}
                onChange={handleSnilsChange}
                maxLength={14}
                style={{
                  fontFamily: 'monospace',
                  fontSize: 15,
                  letterSpacing: 0.5
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: 'var(--vkui--color_text_secondary, #64748b)', marginTop: 4 }}>
              Форматируется автоматически по маске пенсионного страхового свидетельства
            </div>
          </FormItem>

          {/* Пароль с кнопкой показа/скрытия */}
          <FormItem top="Пароль от школьной системы:" style={{ padding: 0, marginBottom: 12 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль..."
                value={password}
                onChange={(e) => {
                  setLocalError(null);
                  setPassword(e.target.value);
                }}
                style={{ width: '100%', paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                style={{
                  position: 'absolute',
                  right: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormItem>

          {/* Запомнить на школьном ПК */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
              <span style={{ fontSize: 13, color: 'var(--vkui--color_text_secondary, #475569)' }}>
                Запомнить устройство на 30 дней (Школьный рабочий ПК)
              </span>
            </Checkbox>
          </div>

          {(localError || errorMessage) && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: '#fee2e2',
                border: '1px solid #f87171',
                color: '#b91c1c',
                fontSize: 13,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{localError || errorMessage}</span>
            </div>
          )}

          <Button
            size="l"
            stretched
            mode="primary"
            type="submit"
            loading={isLoading}
            before={<KeyRound size={18} />}
            style={{
              height: 44,
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15
            }}
          >
            Войти в рабочий кабинет
          </Button>
        </form>

        {/* Разделитель ЕСИА */}
        <div style={{ position: 'relative', textAlign: 'center', margin: '20px 0 16px' }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              borderTop: '1px solid var(--vkui--color_separator_primary, #e2e8f0)'
            }}
          />
          <span
            style={{
              position: 'relative',
              background: 'var(--vkui--color_background_content, #ffffff)',
              padding: '0 12px',
              fontSize: 12,
              color: 'var(--vkui--color_text_secondary, #64748b)',
              fontWeight: 600
            }}
          >
            ИЛИ
          </span>
        </div>

        {/* Кнопка Госуслуги */}
        <Button
          size="l"
          stretched
          mode="secondary"
          loading={isLoading}
          before={
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                background: '#0d4cd3',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 900
              }}
            >
              ГУ
            </div>
          }
          after={<ExternalLink size={16} />}
          onClick={onLoginEsia}
          style={{
            height: 44,
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 14,
            border: '1px solid #0d4cd340',
            color: '#0d4cd3'
          }}
        >
          Войти через Госуслуги
        </Button>
      </Card>
    </div>
  );
};
