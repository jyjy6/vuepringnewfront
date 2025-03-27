export interface News {
  id: number;
  fileURLs?: string[];
  title: string;
  content: string;
  author: string;
  role: string;
  createdAt?: Date;
}
