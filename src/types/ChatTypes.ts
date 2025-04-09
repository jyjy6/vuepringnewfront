export interface ChatMessage {
  username: string;
  message: string;
  room: string;
  timestamp?: string;
  status?: string;
}
