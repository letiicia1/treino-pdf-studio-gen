
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, FileText, Image, Smartphone, Palette } from "lucide-react";
import WorkoutForm from "@/components/WorkoutForm";
import ExerciseList from "@/components/ExerciseList";
import BrandingSettings from "@/components/BrandingSettings";
import PDFGenerator from "@/components/PDFGenerator";
import ImageGenerator from "@/components/ImageGenerator";
import WorkoutApp from "@/components/WorkoutApp";
import AppCustomization from "@/components/AppCustomization";
import { Exercise, BrandingConfig } from "@/types/workout";

const Index = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [branding, setBranding] = useState<BrandingConfig>({
    studioName: 'PP STUDIO PERSONAL'
  });
  const [selectedCategory, setSelectedCategory] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [appConfig, setAppConfig] = useState({
    logoUrl: '',
    studioName: 'PP STUDIO PERSONAL',
    primaryColor: '#192F59',
    backgroundColor: '#f8fafc',
    contactPhone: '',
    contactEmail: '',
    address: '',
    storeLink: '',
    welcomeMessage: 'Bem-vindo ao seu treino personalizado!'
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

  const handleUpdateAppConfig = (newConfig: any) => {
    setAppConfig(newConfig);
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
      <div className="bg-gradient-to-r from-[#192F59] to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <Dumbbell className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Sistema de Fichas de Treino</h1>
              <p className="text-blue-100 mt-1">
                Crie fichas profissionais em PDF, imagem e aplicativo para seus alunos
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

          {/* Sidebar - Configurações e Geradores */}
          <div className="space-y-6">
            {/* Personalização da Marca */}
            <BrandingSettings
              branding={branding}
              onUpdateBranding={handleUpdateBranding}
            />

            <Separator />

            {/* Geradores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Gerar Fichas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pdf" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pdf" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      PDF
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-1">
                      <Image className="h-3 w-3" />
                      Imagem
                    </TabsTrigger>
                    <TabsTrigger value="app" className="flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      App
                    </TabsTrigger>
                    <TabsTrigger value="customize" className="flex items-center gap-1">
                      <Palette className="h-3 w-3" />
                      Config
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pdf" className="mt-4">
                    <PDFGenerator
                      exercises={exercises}
                      branding={branding}
                    />
                  </TabsContent>
                  
                  <TabsContent value="image" className="mt-4">
                    <ImageGenerator
                      exercises={exercises}
                      branding={branding}
                    />
                  </TabsContent>
                  
                  <TabsContent value="app" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Selecionar Treino:</label>
                        <Select 
                          value={selectedCategory} 
                          onValueChange={(value: 'A' | 'B' | 'C' | 'D' | 'E') => setSelectedCategory(value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Treino A</SelectItem>
                            <SelectItem value="B">Treino B</SelectItem>
                            <SelectItem value="C">Treino C</SelectItem>
                            <SelectItem value="D">Treino D</SelectItem>
                            <SelectItem value="E">Treino E</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <WorkoutApp
                        exercises={exercises}
                        branding={branding}
                        selectedCategory={selectedCategory}
                        appConfig={appConfig}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="customize" className="mt-4">
                    <AppCustomization
                      appConfig={appConfig}
                      onUpdateConfig={handleUpdateAppConfig}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-t">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm">
                Sistema Completo de Geração de Fichas de Treino
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
