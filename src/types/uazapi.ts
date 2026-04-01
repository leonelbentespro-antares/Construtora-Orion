export interface UAZInstanceStatus {
  instance_id: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'qrcode';
  qrcode?: string;
  number?: string;
  platform?: string;
}

export interface UAZMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  fromMe: boolean;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
}

export interface UAZSendMessageRequest {
  number: string;
  text: string;
  delay?: number;
}

export interface UAZWebhookConfig {
  enabled: boolean;
  url: string;
  events: string[];
  excludeMessages: string[];
}
