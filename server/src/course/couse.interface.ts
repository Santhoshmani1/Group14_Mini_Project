export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  price: number;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
  language: string;
}
