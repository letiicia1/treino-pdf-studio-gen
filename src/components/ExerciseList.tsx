
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, GripVertical } from "lucide-react";
import { Exercise } from "@/types/workout";

interface ExerciseListProps {
  exercises: Exercise[];
  onRemoveExercise: (id: string) => void;
}

const ExerciseList = ({ exercises, onRemoveExercise }: ExerciseListProps) => {
  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum exercício adicionado ainda.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Use o formulário acima para adicionar exercícios à ficha.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercícios da Ficha ({exercises.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {exercises.map((exercise, index) => (
          <div key={exercise.id} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{exercise.name}</h4>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span><strong>Séries:</strong> {exercise.series}</span>
                    <span><strong>Repetições:</strong> {exercise.repetitions}</span>
                    {exercise.rest && <span><strong>Pausa:</strong> {exercise.rest}</span>}
                  </div>
                  {exercise.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      {exercise.notes}
                    </p>
                  )}
                  {exercise.videoLink && (
                    <a
                      href={exercise.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver vídeo demonstrativo
                    </a>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveExercise(exercise.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExerciseList;
