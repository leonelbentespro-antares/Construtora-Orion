import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components/ui';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Palette,
  X,
  TrendingUp,
  Link2,
  Link2Off,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useSettings } from '../../context/SettingsContext';
import { uazapi } from '../../lib/uazapi';
import { googleAds } from '../../lib/googleAds';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsView: React.FC = () => {
  const { whatsappStatus, qrCode, updateWhatsAppStatus } = useCRM();
  const { settings, updateSettings } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showGoogleAdsModal, setShowGoogleAdsModal] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [googleAdsForm, setGoogleAdsForm] = useState({
    customerId: settings.googleAdsCustomerId,
    clientId: settings.googleAdsClientId,
    developerToken: settings.googleAdsDeveloperToken,
  });

  const [formSettings, setFormSettings] = useState(settings);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

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
          <Button 
            onClick={() => setShowIntegrationsModal(true)}
            variant="ghost" 
            className="text-[10px] uppercase font-bold tracking-widest text-[var(--primary)] border-[var(--primary)]/20"
          >
            Gerenciar Integrações
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

      {/* Google Ads Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-[var(--primary)]" size={24} />
          <h2 className="text-2xl font-display font-bold text-[var(--on-surface)] uppercase tracking-tight">Google Ads</h2>
        </div>

        <Card className="overflow-hidden border border-[var(--outline)] shadow-sm bg-[var(--surface-lowest)]">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[var(--outline-variant)]/30">
            {/* Status Panel */}
            <div className="p-8 md:w-1/2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--on-surface-variant)] mb-2">Status da Conexão</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${settings.googleAdsConnected ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-slate-400'}`} />
                    <span className="text-lg font-bold text-[var(--on-surface)]">
                      {settings.googleAdsConnected ? 'Conta Conectada' : 'Não Conectado'}
                    </span>
                  </div>
                </div>
                {settings.googleAdsConnected && (
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                  </div>
                )}
              </div>

              {settings.googleAdsCustomerId && (
                <div className="p-4 rounded-2xl bg-[var(--surface-low)] border border-[var(--outline)]/10">
                  <p className="text-[10px] uppercase font-black tracking-widest text-[var(--on-surface-variant)] mb-1">Customer ID</p>
                  <p className="text-sm font-bold text-[var(--on-surface)] font-mono">{settings.googleAdsCustomerId}</p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[var(--surface-low)] border border-[var(--outline)]/10 flex items-start gap-3">
                <Shield size={18} className="text-[var(--primary)] mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[var(--on-surface)]">OAuth 2.0 Seguro</p>
                  <p className="text-[10px] text-[var(--on-surface-variant)] leading-relaxed">Suas credenciais são armazenadas localmente e nunca compartilhadas com terceiros.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowGoogleAdsModal(true)}
                  variant="primary"
                  className="px-8 h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {settings.googleAdsConnected ? 'Reconfigurar' : 'Conectar Conta'}
                </Button>
                {settings.googleAdsConnected && (
                  <Button
                    onClick={() => updateSettings({ googleAdsConnected: false, googleAdsCustomerId: '', googleAdsClientId: '', googleAdsDeveloperToken: '' })}
                    variant="ghost"
                    className="h-12 text-rose-600 border border-rose-200 hover:bg-rose-50 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                  >
                    <Link2Off size={14} /> Desconectar
                  </Button>
                )}
              </div>
            </div>

            {/* Instructions Panel */}
            <div className="p-8 md:w-1/2 bg-[var(--surface-low)]/30">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--on-surface-variant)] mb-6">Como Conectar</p>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary-container)] text-[var(--primary)] text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                  <p className="text-xs text-[var(--on-surface)] leading-relaxed">Acesse o <strong>Google Ads</strong> e vá em <strong>Ferramentas &gt; Central de API</strong> para obter seu Developer Token.</p>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary-container)] text-[var(--primary)] text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                  <p className="text-xs text-[var(--on-surface)] leading-relaxed">No <strong>Google Cloud Console</strong>, crie um projeto e configure as credenciais OAuth 2.0 para obter o Client ID.</p>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary-container)] text-[var(--primary)] text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                  <p className="text-xs text-[var(--on-surface)] leading-relaxed">Preencha o formulário com seu <strong>Customer ID</strong>, <strong>Client ID</strong> e <strong>Developer Token</strong>, depois clique em Conectar.</p>
                </li>
              </ol>

              {settings.googleAdsConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3"
                >
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-800 tracking-tight">Google Ads Integrado com Sucesso!</p>
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* Modal Google Ads */}
      <AnimatePresence>
        {showGoogleAdsModal && (
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
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <TrendingUp size={20} className="text-[var(--primary)]" />
                    Conectar Google Ads
                  </h3>
                  <p className="text-[10px] text-[var(--primary)] uppercase font-black tracking-widest mt-1">Integração de Campanhas</p>
                </div>
                <button onClick={() => setShowGoogleAdsModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Customer ID do Google Ads</label>
                  <Input
                    placeholder="Ex: 123-456-7890"
                    value={googleAdsForm.customerId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoogleAdsForm(prev => ({ ...prev, customerId: e.target.value }))}
                  />
                  <p className="text-[10px] text-[var(--on-surface-variant)] italic">Encontrado no canto superior direito da sua conta Google Ads.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">OAuth Client ID</label>
                  <Input
                    placeholder="Ex: 123456789.apps.googleusercontent.com"
                    value={googleAdsForm.clientId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoogleAdsForm(prev => ({ ...prev, clientId: e.target.value }))}
                  />
                  <p className="text-[10px] text-[var(--on-surface-variant)] italic">Obtido no Google Cloud Console &gt; APIs e Serviços &gt; Credenciais.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Developer Token</label>
                  <Input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={googleAdsForm.developerToken}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoogleAdsForm(prev => ({ ...prev, developerToken: e.target.value }))}
                  />
                  <p className="text-[10px] text-[var(--on-surface-variant)] italic">Em Google Ads &gt; Ferramentas &gt; Central de API.</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                  <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-900 leading-relaxed">
                    Após salvar, clique em <strong>"Autorizar via Google"</strong> para concluir a autenticação OAuth e liberar o acesso às métricas.
                  </p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-[var(--outline)] flex flex-col gap-3">
                <Button
                  onClick={() => {
                    if (!googleAdsForm.customerId || !googleAdsForm.clientId || !googleAdsForm.developerToken) return;
                    updateSettings({
                      googleAdsCustomerId: googleAdsForm.customerId,
                      googleAdsClientId: googleAdsForm.clientId,
                      googleAdsDeveloperToken: googleAdsForm.developerToken,
                      googleAdsConnected: true,
                    });
                    googleAds.initiateOAuth(googleAdsForm.clientId);
                    setShowGoogleAdsModal(false);
                  }}
                  variant="primary"
                  disabled={!googleAdsForm.customerId || !googleAdsForm.clientId || !googleAdsForm.developerToken}
                  className="w-full h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2"
                >
                  <Link2 size={14} /> Salvar e Autorizar via Google
                </Button>
                <Button
                  onClick={() => setShowGoogleAdsModal(false)}
                  variant="ghost"
                  className="w-full h-12 font-bold uppercase text-[10px] tracking-widest"
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Integrações */}
      <AnimatePresence>
        {showIntegrationsModal && (
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
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">API & Webhooks</h3>
                  <p className="text-[10px] text-[var(--primary)] uppercase font-black tracking-widest mt-1">Configurações de Integração</p>
                </div>
                <button onClick={() => setShowIntegrationsModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">ID da Instância (Subdomínio)</label>
                    <Input 
                      placeholder="Ex: orion-api" 
                      value={formSettings.uazapiSubdomain}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormSettings(prev => ({ ...prev, uazapiSubdomain: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">Token UAZAPI</label>
                    <Input 
                      type="password"
                      placeholder="••••••••••••••••" 
                      value={formSettings.uazapiToken}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormSettings(prev => ({ ...prev, uazapiToken: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--on-surface-variant)]">URL do Webhook (Recebimento)</label>
                  <Input 
                    placeholder="https://seu-servidor.com/webhook" 
                    value={formSettings.webhookUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  />
                  <p className="text-[10px] text-[var(--on-surface-variant)] mt-2 italic">A URL que receberá notificações do WhatsApp.</p>
                </div>

                {testResult && (
                  <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${testResult.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {testResult.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {testResult.message}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-4">
                  <Button 
                    onClick={async () => {
                      setIsTesting(true);
                      setTestResult(null);
                      try {
                        // Temporariamente atualizar settings para o teste
                        const oldSettings = settings;
                        localStorage.setItem('orion_settings', JSON.stringify(formSettings));
                        const status = await uazapi.getStatus();
                        if (status.status !== 'disconnected') {
                          setTestResult({ type: 'success', message: 'Conexão estabelecida com sucesso!' });
                        } else {
                          setTestResult({ type: 'error', message: 'Instância encontrada, mas desconectada.' });
                        }
                        // Restaurar ou manter? Vamos manter se deu certo
                      } catch (e) {
                        setTestResult({ type: 'error', message: 'Falha na conexão. Verifique o Token e ID.' });
                      } finally {
                        setIsTesting(false);
                      }
                    }}
                    disabled={isTesting}
                    variant="ghost" 
                    className="h-12 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 border-[var(--outline)]"
                  >
                    {isTesting ? <RefreshCcw size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                    Testar Conexão
                  </Button>

                  <Button 
                    onClick={async () => {
                      if (!formSettings.webhookUrl) {
                        setTestResult({ type: 'error', message: 'Informe uma URL de Webhook válida.' });
                        return;
                      }
                      setIsTesting(true);
                      try {
                        localStorage.setItem('orion_settings', JSON.stringify(formSettings));
                        await uazapi.setupWebhook(formSettings.webhookUrl);
                        setTestResult({ type: 'success', message: 'Webhook sincronizado com a UAZAPI!' });
                      } catch (e) {
                        setTestResult({ type: 'error', message: 'Erro ao configurar Webhook.' });
                      } finally {
                        setIsTesting(false);
                      }
                    }}
                    disabled={isTesting}
                    variant="ghost" 
                    className="h-12 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 border-[var(--outline)]"
                  >
                    <ExternalLink size={14} />
                    Sincronizar Webhook
                  </Button>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-[var(--outline)] flex gap-3">
                <Button 
                  onClick={() => setShowIntegrationsModal(false)}
                  variant="ghost" 
                  className="flex-1 h-12 font-bold uppercase text-[10px] tracking-widest"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    updateSettings(formSettings);
                    setShowIntegrationsModal(false);
                  }}
                  variant="primary" 
                  className="flex-[2] h-12 bg-[var(--primary)] text-white font-black uppercase text-[10px] tracking-widest shadow-lg"
                >
                  Salvar Configurações
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
