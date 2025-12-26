
export interface GeneratedPost {
  id: string;
  topic: string;
  postContent: string;
  dataUrl: string;
  timestamp: number;
}

export interface WebhookResponse {
  postContent: string;
  dataUrl: string;
}

export interface HistoryItem {
  id: string;
  topic: string;
  timestamp: number;
}
