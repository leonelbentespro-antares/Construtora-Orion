import { UAZInstanceStatus, UAZMessage, UAZSendMessageRequest } from '../types/uazapi';

const getHeaders = () => {
  const saved = localStorage.getItem('orion_settings');
  let token = import.meta.env.VITE_UAZAPI_TOKEN;
  
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      if (settings.uazapiToken) token = settings.uazapiToken;
    } catch (e) {}
  }

  return {
    'Content-Type': 'application/json',
    'token': token || ''
  };
};

const getBaseUrl = () => {
  const saved = localStorage.getItem('orion_settings');
  let subdomain = import.meta.env.VITE_UAZAPI_SUBDOMAIN;
  
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      if (settings.uazapiSubdomain) subdomain = settings.uazapiSubdomain;
    } catch (e) {}
  }
  
  return `https://${subdomain}.uazapi.com`;
};

class UAZService {
  /**
   * Verifica o status da conexão da instância de WhatsApp.
   */
  async getStatus(): Promise<UAZInstanceStatus> {
    try {
      const response = await fetch(`${getBaseUrl()}/instance/status`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Erro ao buscar status da instância');
      return await response.json();
    } catch (error) {
      console.error('UAZAPI getStatus Error:', error);
      return { instance_id: '', status: 'disconnected' };
    }
  }

  /**
   * Envia uma mensagem de texto simples.
   */
  async sendText(number: string, text: string): Promise<any> {
    try {
      const body: UAZSendMessageRequest = { number, text };
      const response = await fetch(`${getBaseUrl()}/send/text`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error('Erro ao enviar mensagem');
      return await response.json();
    } catch (error) {
      console.error('UAZAPI sendText Error:', error);
      throw error;
    }
  }

  /**
   * (Opcional) Configura o webhook via API para receber mensagens.
   */
  async setupWebhook(url: string): Promise<any> {
    try {
      const response = await fetch(`${getBaseUrl()}/webhook`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          enabled: true,
          url,
          events: ['messages'],
          excludeMessages: ['wasSentByApi']
        })
      });
      return await response.json();
    } catch (error) {
      console.error('UAZAPI setupWebhook Error:', error);
      throw error;
    }
  }
}

export const uazapi = new UAZService();
