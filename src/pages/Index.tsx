
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, FileText } from "lucide-react";
import WorkoutForm from "@/components/WorkoutForm";
import ExerciseList from "@/components/ExerciseList";
import BrandingSettings from "@/components/BrandingSettings";
import PDFGenerator from "@/components/PDFGenerator";
import WorkoutRegistration from "@/components/WorkoutRegistration";
import WorkoutLibrary from "@/components/WorkoutLibrary";
import { Exercise, BrandingConfig, WorkoutSheet } from "@/types/workout";

const Index = () => {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSheet | null>(null);
  const [savedWorkouts, setSavedWorkouts] = useState<WorkoutSheet[]>([]);
  const [branding, setBranding] = useState<BrandingConfig>({
    studioName: 'PP STUDIO PERSONAL'
  });

  const handleCreateWorkout = (workoutData: Omit<WorkoutSheet, 'id' | 'exercises' | 'createdAt' | 'lastModified'>) => {
    const newWorkout: WorkoutSheet = {
      ...workoutData,
      id: Date.now().toString(),
      exercises: [],
      createdAt: new Date(),
      lastModified: new Date()
    };
    setCurrentWorkout(newWorkout);
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (!currentWorkout) return;
    
    const updatedWorkout = {
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, exercise],
      lastModified: new Date()
    };
    setCurrentWorkout(updatedWorkout);
  };

  const handleAddMultipleExercises = (newExercises: Exercise[]) => {
    if (!currentWorkout) return;
    
    const updatedWorkout = {
      ...currentWorkout,
      exercises: newExercises,
      lastModified: new Date()
    };
    setCurrentWorkout(updatedWorkout);
  };

  const handleRemoveExercise = (id: string) => {
    if (!currentWorkout) return;
    
    const updatedWorkout = {
      ...currentWorkout,
      exercises: currentWorkout.exercises.filter(ex => ex.id !== id),
      lastModified: new Date()
    };
    setCurrentWorkout(updatedWorkout);
  };

  const handleSaveWorkout = () => {
    if (!currentWorkout || currentWorkout.exercises.length === 0) {
      alert('Adicione exercícios ao treino antes de salvar.');
      return;
    }

    const existingIndex = savedWorkouts.findIndex(w => w.id === currentWorkout.id);
    if (existingIndex >= 0) {
      const updatedWorkouts = [...savedWorkouts];
      updatedWorkouts[existingIndex] = currentWorkout;
      setSavedWorkouts(updatedWorkouts);
    } else {
      setSavedWorkouts([...savedWorkouts, currentWorkout]);
    }
    
    alert('Treino salvo com sucesso!');
  };

  const handleLoadWorkout = (exercises: Exercise[]) => {
    if (currentWorkout) {
      handleAddMultipleExercises(exercises);
    }
  };

  const handleUpdateBranding = (newBranding: BrandingConfig) => {
    setBranding(newBranding);
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
        {!currentWorkout ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Área de cadastro */}
            <div className="lg:col-span-2">
              <WorkoutRegistration onCreateWorkout={handleCreateWorkout} />
            </div>

            {/* Sidebar - Configurações */}
            <div className="space-y-6">
              <BrandingSettings
                branding={branding}
                onUpdateBranding={handleUpdateBranding}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Principal - Formulário e Lista */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações do treino atual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {currentWorkout.title}
                    </span>
                    <button
                      onClick={handleSaveWorkout}
                      className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                    >
                      Salvar Treino
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentWorkout.studentName && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {currentWorkout.studentName}
                      </span>
                    )}
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {currentWorkout.gender}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {currentWorkout.level}
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                      {currentWorkout.weeklyFrequency}x/semana
                    </span>
                  </div>
                  {currentWorkout.objective && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      <strong>Objetivo:</strong> {currentWorkout.objective}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Formulário de Exercícios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Nova Ficha de Treino em PDF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WorkoutForm 
                    onAddExercise={handleAddExercise}
                    onAddMultipleExercises={handleAddMultipleExercises}
                  />
                </CardContent>
              </Card>

              {/* Lista de Exercícios */}
              <ExerciseList
                exercises={currentWorkout.exercises}
                onRemoveExercise={handleRemoveExercise}
              />
            </div>

            {/* Sidebar - Configurações e Gerador */}
            <div className="space-y-6">
              {/* Editar informações do treino */}
              <WorkoutRegistration
                currentWorkout={currentWorkout}
                onCreateWorkout={(data) => setCurrentWorkout({
                  ...currentWorkout,
                  ...data,
                  lastModified: new Date()
                })}
              />

              <Separator />

              {/* Personalização da Marca */}
              <BrandingSettings
                branding={branding}
                onUpdateBranding={handleUpdateBranding}
              />

              <Separator />

              {/* Gerador de PDF */}
              <PDFGenerator
                workout={currentWorkout}
                branding={branding}
              />
            </div>
          </div>
        )}

        {/* Biblioteca de Treinos */}
        <WorkoutLibrary
          currentExercises={currentWorkout?.exercises || []}
          onLoadWorkout={handleLoadWorkout}
        />

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
