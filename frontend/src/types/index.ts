export interface DotiAgent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: string;
  xmtpAddress?: string;
  walletKey: string;
  isDownloaded?: boolean;
}
