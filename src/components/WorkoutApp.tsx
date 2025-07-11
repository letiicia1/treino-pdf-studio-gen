
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, Clock, Repeat } from "lucide-react";
import { Exercise, BrandingConfig } from "@/types/workout";

interface WorkoutAppProps {
  exercises: Exercise[];
  branding: BrandingConfig;
  selectedCategory: string;
}

const WorkoutApp = ({ exercises, branding, selectedCategory }: WorkoutAppProps) => {
  const categoryExercises = exercises.filter(ex => ex.category === selectedCategory);

  const getPublicLink = () => {
    const currentUrl = window.location.origin;
    const params = new URLSearchParams({
      studio: branding.studioName,
      category: selectedCategory,
      exercises: JSON.stringify(categoryExercises)
    });
    return `${currentUrl}/treino?${params.toString()}`;
  };

  const copyPublicLink = () => {
    const link = getPublicLink();
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };

  if (categoryExercises.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Adicione exercícios ao Treino {selectedCategory} para visualizar o aplicativo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header do App */}
      <Card className="bg-gradient-to-r from-[#192F59] to-blue-700 text-white">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold">{branding.studioName}</h1>
          <p className="text-blue-100">Aplicativo de Treino</p>
          <Badge variant="secondary" className="mx-auto w-fit">
            TREINO {selectedCategory}
          </Badge>
        </CardHeader>
      </Card>

      {/* Botão para link público */}
      <Card>
        <CardContent className="p-4">
          <Button
            onClick={copyPublicLink}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Copiar Link Público do Treino
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Compartilhe este link com seus alunos para acesso direto ao treino
          </p>
        </CardContent>
      </Card>

      {/* Lista de Exercícios */}
      <div className="space-y-3">
        {categoryExercises.map((exercise, index) => (
          <Card key={exercise.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="bg-[#192F59] text-white p-4 flex items-center justify-center min-w-[60px]">
                  <span className="text-lg font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 p-4">
                  <h3 className="font-semibold text-lg mb-2">{exercise.name}</h3>
                  
                  <div className="flex flex-wrap gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Repeat className="h-4 w-4" />
                      <span>{exercise.series} séries</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Play className="h-4 w-4" />
                      <span>{exercise.repetitions} reps</span>
                    </div>
                    {exercise.rest && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{exercise.rest}</span>
                      </div>
                    )}
                  </div>

                  {exercise.notes && (
                    <p className="text-sm text-gray-600 mb-3 italic">
                      {exercise.notes}
                    </p>
                  )}

                  {exercise.videoLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(exercise.videoLink, '_blank')}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Ver Vídeo
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <Card className="bg-gray-50">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-gray-600">
            💪 Bom treino! - {branding.studioName}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutApp;
