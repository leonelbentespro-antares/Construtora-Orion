import React, { useState } from 'react';
import { Card, Button } from '../../components/ui';
import { 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Palette
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsView: React.FC = () => {
  const { whatsappStatus, qrCode, updateWhatsAppStatus } = useCRM();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    await updateWhatsAppStatus();
    setIsRefreshing(false);
  };

  const handleConnect = async () => {
    await updateWhatsAppStatus();
    setShowQRModal(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Seção */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-[var(--primary)] to-emerald-700 text-white border-0 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Zap size={24} />
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/20`}>
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
          <h3 className="text-xl font-bold text-[var(--on-surface)] mb-1">API & Webhooks</h3>
          <p className="text-[var(--on-surface-variant)] text-sm mb-6">Integrações ativas com UAZAPI e Supabase.</p>
          <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase">
            <CheckCircle2 size={14} />
            Endpoints Saudáveis
          </div>
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

      {/* WhatsApp Connection Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Smartphone className="text-[var(--primary)]" size={24} />
          <h2 className="text-2xl font-display font-bold text-[var(--on-surface)] uppercase tracking-tight">Conectividade WhatsApp</h2>
        </div>

        <Card className="overflow-hidden border border-[var(--outline)] shadow-sm bg-[var(--surface-lowest)]">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[var(--outline-variant)]/30">
            {/* Status Panel */}
            <div className="p-8 md:w-1/2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--on-surface-variant)] mb-2">Status da Instância</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${whatsappStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse'}`} />
                    <span className="text-lg font-bold text-[var(--on-surface)]">
                      {whatsappStatus === 'connected' ? 'Dispositivo Conectado' : 
                       whatsappStatus === 'qrcode' ? 'Aguardando Escaneamento' : 
                       'Desconectado da UAZAPI'}
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={handleRefreshStatus}
                  disabled={isRefreshing}
                  variant="ghost" 
                  className={`p-2 rounded-full hover:bg-[var(--surface-high)] ${isRefreshing ? 'animate-spin' : ''}`}
                >
                  <RefreshCcw size={20} className="text-[var(--on-surface-variant)]" />
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-2xl bg-[var(--surface-low)] border border-[var(--outline)]/10 flex items-start gap-3">
                  <Shield size={18} className="text-[var(--primary)] mt-1 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[var(--on-surface)]">Conexão Segura</p>
                    <p className="text-[10px] text-[var(--on-surface-variant)] leading-relaxed">Sua conexão é protegida pela criptografia de ponta a ponta da UAZAPI via Proxies Residenciais.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                {whatsappStatus !== 'connected' ? (
                  <Button 
                    onClick={handleConnect}
                    variant="primary" 
                    className="px-8 h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Escanear QR Code
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="px-8 h-12 text-rose-600 border border-rose-200 hover:bg-rose-50 font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                    Desconectar Dispositivo
                  </Button>
                )}
                <Button variant="ghost" className="h-12 text-[var(--on-surface-variant)] text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                  <ExternalLink size={14} /> Documentação UAZAPI
                </Button>
              </div>
            </div>

            {/* Instruction Panel */}
            <div className="p-8 md:w-1/2 bg-[var(--surface-low)]/30">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--on-surface-variant)] mb-6">Como Instrucoes</p>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary-container)] text-[var(--primary)] text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                  <p className="text-xs text-[var(--on-surface)] leading-relaxed">Abra o <strong>WhatsApp</strong> no seu celular principal.</p>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary-container)] text-[var(--primary)] text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                  <p className="text-xs text-[var(--on-surface)] leading-relaxed">Toque em <strong>Aparelhos Conectados</strong> no menu de configurações.</p>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary-container)] text-[var(--primary)] text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                  <p className="text-xs text-[var(--on-surface)] leading-relaxed">Aponte a câmera para o <strong>QR Code</strong> que será gerado pelo Orion.</p>
                </li>
              </ol>

              {whatsappStatus === 'connected' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3"
                >
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-800 tracking-tight">Sistema Pronto para Operar!</p>
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* QR Code Modal/Section */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[var(--outline)] overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-left">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Conectar WhatsApp</h3>
                    <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mt-1">Sincronização Orion</p>
                  </div>
                  <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                    <RefreshCcw size={18} />
                  </button>
                </div>

                <div className="relative aspect-square w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden mb-6">
                  {qrCode ? (
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <div className="w-12 h-12 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Gerando QR Code...</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl text-left border border-amber-100">
                    <AlertCircle size={20} className="text-amber-600 shrink-0" />
                    <p className="text-[10px] text-amber-900 font-medium leading-tight">
                      Mantenha o celular próximo e com conexão estável até que o status mude para "Conectado".
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowQRModal(false)}
                    variant="ghost" 
                    className="w-full h-12 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50"
                  >
                    Fechar e Sair
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
