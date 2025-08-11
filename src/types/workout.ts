
export interface Exercise {
  id: string;
  name: string;
  series: number;
  repetitions: string;
  rest: string;
  videoLink?: string;
  notes?: string;
  category: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface WorkoutSheet {
  id: string;
  title: string;
  studentName?: string;
  gender: 'masculino' | 'feminino';
  weeklyFrequency: number;
  level: 'iniciante' | 'intermediario' | 'avancado';
  subLevel: 1 | 2 | 3;
  levelComplement?: string;
  objective?: string;
  exercises: Exercise[];
  createdAt: Date;
  lastModified: Date;
}

export interface SavedWorkout {
  id: string;
  name: string;
  gender: 'masculino' | 'feminino';
  weeklyFrequency: number;
  level: 'iniciante' | 'intermediario' | 'avancado';
  subLevel: 1 | 2 | 3;
  levelComplement?: string;
  objective?: string;
  exercises: Exercise[];
  categories: string[];
  headerText?: string;
  createdAt: Date;
  lastModified: Date;
}

export interface BrandingConfig {
  studioName: string;
  logo?: string;
}
