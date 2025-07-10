
export interface Exercise {
  id: string;
  name: string;
  series: number;
  repetitions: string;
  rest: string;
  videoLink?: string;
  notes?: string;
}

export interface WorkoutSheet {
  title: string;
  studentName: string;
  exercises: Exercise[];
  createdAt: Date;
}

export interface BrandingConfig {
  studioName: string;
  logo?: string;
}
