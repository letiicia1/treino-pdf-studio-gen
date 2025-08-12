
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, FileText } from "lucide-react";
import WorkoutForm from "@/components/WorkoutForm";
import ExerciseList from "@/components/ExerciseList";
import ExercisePreview from "@/components/ExercisePreview";
import BrandingSettings from "@/components/BrandingSettings";
import PDFGenerator from "@/components/PDFGenerator";
import SavedWorkoutLibraryButton from "@/components/SavedWorkoutLibraryButton";
import { Exercise, BrandingConfig } from "@/types/workout";

const Index = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [branding, setBranding] = useState<BrandingConfig>({
    studioName: 'PP STUDIO PERSONAL'
  });

  const handleAddExercise = (exercise: Exercise) => {
    setExercises([...exercises, exercise]);
  };

  const handleAddMultipleExercises = (newExercises: Exercise[]) => {
    setExercises([...exercises, ...newExercises]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleUpdateExerciseName = (id: string, newName: string) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, name: newName } : ex
    ));
  };

  const handleUpdateBranding = (newBranding: BrandingConfig) => {
    setBranding(newBranding);
  };

  const handleClearAllExercises = () => {
    setExercises([]);
  };

  const handleLoadWorkout = (workoutExercises: Exercise[]) => {
    setExercises(workoutExercises);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#192F59] to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <Dumbbell className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">PP STUDIO PERSONAL</h1>
              <p className="text-blue-100 mt-1">
                Sistema completo de criação e gerenciamento de fichas de treino em PDF
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column - Form and List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exercise Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Nova Ficha de Treino em PDF
                  </div>
                  <div className="flex-shrink-0">
                    <SavedWorkoutLibraryButton
                      currentExercises={exercises}
                      branding={branding}
                      onLoadWorkout={handleLoadWorkout}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WorkoutForm 
                  onAddExercise={handleAddExercise}
                  onAddMultipleExercises={handleAddMultipleExercises}
                />
              </CardContent>
            </Card>

            {/* Exercise Preview */}
            {exercises.length > 0 && (
              <ExercisePreview
                exercises={exercises}
                onUpdateExercise={handleUpdateExerciseName}
              />
            )}

            {/* Exercise List */}
            <ExerciseList
              exercises={exercises}
              onRemoveExercise={handleRemoveExercise}
            />
          </div>

          {/* Sidebar - Settings and Generator */}
          <div className="space-y-6">
            {/* Brand Customization */}
            <BrandingSettings
              branding={branding}
              onUpdateBranding={handleUpdateBranding}
            />

            <Separator />

            {/* PDF Generator */}
            <PDFGenerator
              exercises={exercises}
              branding={branding}
              onClearExercises={handleClearAllExercises}
            />
          </div>
        </div>


        {/* Footer */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-t">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm">
                PP STUDIO PERSONAL - Sistema de Geração de Fichas de Treino
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
