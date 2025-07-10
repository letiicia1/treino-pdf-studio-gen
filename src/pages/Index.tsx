
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, FileText } from "lucide-react";
import WorkoutForm from "@/components/WorkoutForm";
import ExerciseList from "@/components/ExerciseList";
import BrandingSettings from "@/components/BrandingSettings";
import PDFGenerator from "@/components/PDFGenerator";
import { Exercise, BrandingConfig } from "@/types/workout";

const Index = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [branding, setBranding] = useState<BrandingConfig>({
    studioName: 'PP Studio Personal'
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

  const handleUpdateBranding = (newBranding: BrandingConfig) => {
    setBranding(newBranding);
  };

  // Group exercises by category
  const exercisesByCategory = exercises.reduce((acc, exercise) => {
    const category = exercise.category || 'A';
    if (!acc[category]) acc[category] = [];
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <Dumbbell className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Gerador de Fichas de Treino</h1>
              <p className="text-blue-100 mt-1">
                Crie fichas profissionais em PDF para seus alunos organizadas por categoria
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {exercises.length}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </CardContent>
          </Card>
          {['A', 'B', 'C', 'D', 'E'].map(category => (
            <Card key={category} className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {exercisesByCategory[category]?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Treino {category}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Formulário e Lista */}
          <div className="lg:col-span-2 space-y-6">
            {/* Formulário de Exercícios */}
            <WorkoutForm 
              onAddExercise={handleAddExercise}
              onAddMultipleExercises={handleAddMultipleExercises}
            />

            {/* Lista de Exercícios */}
            <ExerciseList
              exercises={exercises}
              onRemoveExercise={handleRemoveExercise}
            />
          </div>

          {/* Sidebar - Configurações e PDF */}
          <div className="space-y-6">
            {/* Personalização da Marca */}
            <BrandingSettings
              branding={branding}
              onUpdateBranding={handleUpdateBranding}
            />

            <Separator />

            {/* Gerador de PDF */}
            <PDFGenerator
              exercises={exercises}
              branding={branding}
            />
          </div>
        </div>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-t">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm">
                Sistema de Geração de Fichas de Treino por Categoria
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
