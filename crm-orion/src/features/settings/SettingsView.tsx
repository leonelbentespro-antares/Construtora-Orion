import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components/ui';
import { Globe, Palette, Zap, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl);

  useEffect(() => {
    setWebhookUrl(settings.webhookUrl);
  }, [settings.webhookUrl]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-[var(--primary)] to-emerald-700 text-white border-0 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Zap size={24} />
            </div>
            <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/20">
              Plano Pro
            </div>
          </div>
          <h3 className="text-xl font-bold mb-1">Status do Sistema</h3>
          <p className="text-white/70 text-sm mb-6">Todos os módulos operando em alta performance.</p>
          <Button variant="ghost" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-[10px] uppercase font-bold tracking-widest">Ver Logs de Atividade</Button>
        </Card>

        <Card className="p-6 border-[var(--outline)]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--primary-container)] text-[var(--primary)] rounded-lg">
              <Globe size={24} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[var(--on-surface)] mb-1">Webhooks</h3>
          <p className="text-[var(--on-surface-variant)] text-sm mb-6">Configure URLs de recebimento de eventos.</p>
          <Button
            onClick={() => setShowWebhookModal(true)}
            variant="ghost"
            className="text-[10px] uppercase font-bold tracking-widest text-[var(--primary)] border-[var(--primary)]/20"
          >
            Gerenciar Webhooks
          </Button>
        </Card>

        <Card className="p-6 border-[var(--outline)]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Palette size={24} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[var(--on-surface)] mb-1">Customização</h3>
          <p className="text-[var(--on-surface-variant)] text-sm mb-6">Identidade visual e temas da construtora.</p>
          <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-widest text-[var(--primary)] border-[var(--primary)]/20">Editar Design System</Button>
        </Card>
      </section>

      {/* Webhook Modal */}
      <AnimatePresence>
        {showWebhookModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[var(--outline)] overflow-hidden"
            >
              <div className="p-8 border-b border-[var(--outline)] flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Webhooks</h3>
                  <p className="text-[10px] text-[var(--primary)] uppercase font-black tracking-widest mt-1">Configurações de Integração</p>
                </div>
                <button onClick={() => setShowWebhookModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">URL do Webhook (Recebimento)</label>
                  <Input
                    placeholder="https://seu-servidor.com/webhook"
                    value={webhookUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-[10px] text-[var(--on-surface-variant)] mt-2 italic">A URL que receberá notificações de eventos do sistema.</p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-[var(--outline)] flex gap-3">
                <Button
                  onClick={() => setShowWebhookModal(false)}
                  variant="ghost"
                  className="flex-1 h-12 font-bold uppercase text-[10px] tracking-widest"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    updateSettings({ webhookUrl });
                    setShowWebhookModal(false);
                  }}
                  variant="primary"
                  className="flex-[2] h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] tracking-widest shadow-lg"
                >
                  Salvar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
