const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_ADS_SCOPE = 'https://www.googleapis.com/auth/adwords';

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cost: number;
  conversions: number;
}

export interface GoogleAdsMetrics {
  totalSpend: number;
  totalClicks: number;
  totalImpressions: number;
  totalConversions: number;
  avgCpc: number;
  avgCtr: number;
  campaigns: GoogleAdsCampaign[];
}

export const googleAds = {
  initiateOAuth: (clientId: string) => {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/settings`,
      response_type: 'code',
      scope: GOOGLE_ADS_SCOPE,
      access_type: 'offline',
      prompt: 'consent',
    });
    window.open(`${GOOGLE_OAUTH_URL}?${params}`, '_blank', 'width=600,height=700');
  },

  getMockMetrics: (): GoogleAdsMetrics => ({
    totalSpend: 12450.8,
    totalClicks: 3842,
    totalImpressions: 187320,
    totalConversions: 48,
    avgCpc: 3.24,
    avgCtr: 2.05,
    campaigns: [
      {
        id: '1',
        name: 'Residencial Premium – SP',
        status: 'ENABLED',
        impressions: 85200,
        clicks: 1842,
        ctr: 2.16,
        cpc: 2.85,
        cost: 5249.7,
        conversions: 22,
      },
      {
        id: '2',
        name: 'Lançamento Vila das Flores',
        status: 'ENABLED',
        impressions: 62400,
        clicks: 1298,
        ctr: 2.08,
        cpc: 3.62,
        cost: 4697.8,
        conversions: 18,
      },
      {
        id: '3',
        name: 'Remarketing – Leads Quentes',
        status: 'ENABLED',
        impressions: 39720,
        clicks: 702,
        ctr: 1.77,
        cpc: 3.56,
        cost: 2499.12,
        conversions: 8,
      },
    ],
  }),

  formatBRL: (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
};
