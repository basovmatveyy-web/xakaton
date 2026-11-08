import React, { useState } from 'react';
import { Card, Button, Input } from '@vkontakte/vkui';
import {
  CheckCircle2,
  ArrowRight,
  Smartphone
} from 'lucide-react';

interface VkIdTabProps {
  onLogin: (customName?: string) => Promise<boolean>;
  isLoading?: boolean;
}

export const VkIdTab: React.FC<VkIdTabProps> = ({ onLogin, isLoading }) => {
  const [useOtherAccount, setUseOtherAccount] = useState(false);
  const [customName, setCustomName] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const handleInstantLogin = async (name?: string) => {
    setIsAuthorizing(true);
    await onLogin(name);
    setIsAuthorizing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Карточка быстрого бесшовного входа по обнаруженному профилю VK ID */}
      <Card
        mode="outline"
        style={{
          padding: 20,
          borderRadius: 16,
          border: '1.5px solid #2d82ec',
          background: 'linear-gradient(180deg, rgba(45, 130, 236, 0.05) 0%, rgba(255, 255, 255, 0) 100%)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#0077FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: 18,
                boxShadow: '0 4px 10px rgba(0, 119, 255, 0.3)'
              }}
            >
              VK
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--vkui--color_text_primary, #0f172a)' }}>
                Единый вход Сферум ID
              </div>
              <div style={{ fontSize: 12, color: 'var(--vkui--color_text_secondary, #64748b)' }}>
                Учебный профиль в VK Мессенджере
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 20,
              background: '#10b98118',
              color: '#10b981',
              border: '1px solid #10b98140',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <CheckCircle2 size={12} /> Активен
          </span>
        </div>

        {/* Профиль педагога */}
        {!useOtherAccount ? (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: 'var(--vkui--color_background_secondary, #f8fafc)',
              border: '1px solid var(--vkui--color_separator_primary, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2d82ec 0%, #1e40af 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                boxShadow: '0 2px 8px rgba(45, 130, 236, 0.25)'
              }}
            >
              РЛ
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--vkui--color_text_primary, #0f172a)' }}>
                Роман Борисович Лосив
              </div>
              <div style={{ fontSize: 12, color: 'var(--vkui--color_text_secondary, #64748b)' }}>
                МАОУ ЛИТ г. Новосибирска • Классный руководитель 9А
              </div>
              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 2 }}>
                ✓ Профиль верифицирован через ЕСИА
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              ФИО педагога для привязки к Сферум ID:
            </div>
            <Input
              placeholder="Например: Смирнова Елена Викторовна..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
        )}

        <Button
          size="l"
          stretched
          mode="primary"
          loading={isLoading || isAuthorizing}
          before={<CheckCircle2 size={18} />}
          after={<ArrowRight size={16} />}
          onClick={() => handleInstantLogin(useOtherAccount ? customName : undefined)}
          style={{
            background: 'linear-gradient(90deg, #0077FF 0%, #2d82ec 100%)',
            height: 46,
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            boxShadow: '0 4px 14px rgba(0, 119, 255, 0.3)'
          }}
        >
          {useOtherAccount ? 'Войти под новым профилем' : 'Продолжить как Роман Лосив'}
        </Button>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <button
            type="button"
            onClick={() => setUseOtherAccount(!useOtherAccount)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2d82ec',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '4px 8px'
            }}
          >
            {useOtherAccount ? '← Вернуться к сохраненному профилю' : 'Войти под другим профилем Сферума / VK ID'}
          </button>
        </div>
      </Card>

      {/* Оповещения в чат */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 12,
          background: 'var(--vkui--color_background_secondary, #f8fafc)',
          border: '1px solid var(--vkui--color_separator_primary, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: 'var(--vkui--color_text_secondary, #64748b)'
        }}
      >
        <Smartphone size={18} color="#2d82ec" style={{ flexShrink: 0 }} />
        <span>Синхронизация с чат-ботом «Сферум.Кабинет» для оповещений учеников и родителей</span>
      </div>
    </div>
  );
};
