-- Create a table for saved ready workouts
CREATE TABLE public.ready_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  weekly_frequency INTEGER,
  level_category TEXT,
  level_number INTEGER,
  level_complement TEXT,
  workout_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ready_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view ready workouts" 
ON public.ready_workouts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can add ready workouts" 
ON public.ready_workouts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update ready workouts" 
ON public.ready_workouts 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete ready workouts" 
ON public.ready_workouts 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ready_workouts_updated_at
BEFORE UPDATE ON public.ready_workouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_ready_workouts_name ON public.ready_workouts(name);
CREATE INDEX idx_ready_workouts_level_category ON public.ready_workouts(level_category);