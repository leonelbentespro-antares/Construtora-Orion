import { UAZInstanceStatus, UAZMessage, UAZSendMessageRequest } from '../types/uazapi';

const SUBDOMAIN = import.meta.env.VITE_UAZAPI_SUBDOMAIN;
const TOKEN = import.meta.env.VITE_UAZAPI_TOKEN;
const BASE_URL = `https://${SUBDOMAIN}.uazapi.com`;

class UAZService {
  private headers: HeadersInit = {
    'Content-Type': 'application/json',
    'token': TOKEN
  };

  /**
   * Verifica o status da conexão da instância de WhatsApp.
   */
  async getStatus(): Promise<UAZInstanceStatus> {
    try {
      const response = await fetch(`${BASE_URL}/instance/status`, {
        headers: this.headers
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
      const response = await fetch(`${BASE_URL}/send/text`, {
        method: 'POST',
        headers: this.headers,
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
      const response = await fetch(`${BASE_URL}/webhook`, {
        method: 'POST',
        headers: this.headers,
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
