import { Card, Button, Spacing } from '@vkontakte/vkui';
import {
  UserCheck,
  GraduationCap,
  Wrench,
  Check,
  ShieldCheck,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { DEMO_PERSONAS } from './demoPersonas';
import type { DemoPersona } from '../../types/auth';

interface DemoRoleSelectorProps {
  onSelectRole: (personaId: string) => void;
  isLoading?: boolean;
}

export const DemoRoleSelector: React.FC<DemoRoleSelectorProps> = ({ onSelectRole, isLoading }) => {
  const getRoleIcon = (role: DemoPersona['role']) => {
    switch (role) {
      case 'class_teacher':
        return <BookOpen size={20} color="#2d82ec" />;
      case 'zavuch':
        return <ShieldCheck size={20} color="#8b5cf6" />;
      case 'staff':
        return <Wrench size={20} color="#f59e0b" />;
      case 'student':
        return <GraduationCap size={20} color="#10b981" />;
      default:
        return <UserCheck size={20} color="#2d82ec" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Приветственный баннер для жюри */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(45, 130, 236, 0.12) 0%, rgba(139, 92, 246, 0.14) 100%)',
          border: '1px solid rgba(45, 130, 236, 0.3)',
          borderRadius: 14,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: '#2d82ec',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(45, 130, 236, 0.35)'
          }}
        >
          <UserCheck size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--vkui--color_text_primary, #1e293b)' }}>
            Вход без пароля (демо-режим)
          </div>
          <div style={{ fontSize: 12, color: 'var(--vkui--color_text_secondary, #64748b)', marginTop: 2 }}>
            Выберите роль для проверки работы сервиса на данных МАОУ ЛИТ.
          </div>
        </div>
      </div>

      {/* Сетка из 4 ролей */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {DEMO_PERSONAS.map((persona) => {
          const isPrimary = persona.id === 'losiv';

          return (
            <Card
              key={persona.id}
              mode="outline"
              style={{
                padding: 16,
                borderRadius: 14,
                border: isPrimary
                  ? '2px solid #2d82ec'
                  : '1px solid var(--vkui--color_separator_primary, #e2e8f0)',
                background: 'var(--vkui--color_background_content, #ffffff)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isPrimary && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: '#2d82ec',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderBottomLeftRadius: 8,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase'
                  }}
                >
                  Ключевой сценарий
                </div>
              )}

              <div>
                {/* Шапка карточки роли */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${persona.badgeColor}18`,
                      border: `1.5px solid ${persona.badgeColor}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {getRoleIcon(persona.role)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--vkui--color_text_primary, #0f172a)' }}>
                        {persona.shortName}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: `${persona.badgeColor}20`,
                          color: persona.badgeColor
                        }}
                      >
                        {persona.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--vkui--color_text_secondary, #64748b)', marginTop: 2 }}>
                      {persona.roleTitle}
                    </div>
                  </div>
                </div>

                <Spacing size={10} />
                <div style={{ fontSize: 12, color: 'var(--vkui--color_text_secondary, #475569)', lineHeight: 1.4 }}>
                  {persona.description}
                </div>

                <Spacing size={10} />
                {/* Список фичей роли */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {persona.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <Check size={14} color={persona.badgeColor} style={{ flexShrink: 0 }} />
                      <span style={{ color: 'var(--vkui--color_text_primary, #334155)' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <Button
                  size="m"
                  stretched
                  mode={isPrimary ? 'primary' : 'secondary'}
                  loading={isLoading}
                  before={<UserCheck size={16} />}
                  after={<ArrowRight size={14} />}
                  onClick={() => onSelectRole(persona.id)}
                  style={{
                    fontWeight: 600,
                    borderRadius: 10
                  }}
                >
                  Войти как {persona.shortName}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
