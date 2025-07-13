
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X } from "lucide-react";
import { Exercise } from "@/types/workout";

interface ExercisePreviewProps {
  exercises: Exercise[];
  onUpdateExercise: (id: string, newName: string) => void;
}

const ExercisePreview = ({ exercises, onUpdateExercise }: ExercisePreviewProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Group exercises by category
  const exercisesByCategory = exercises.reduce((acc, exercise) => {
    const category = exercise.category || 'A';
    if (!acc[category]) acc[category] = [];
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const categoriesWithExercises = Object.keys(exercisesByCategory).filter(
    category => exercisesByCategory[category].length > 0
  ).sort();

  const handleStartEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setEditingName(exercise.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onUpdateExercise(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (categoriesWithExercises.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prévia dos Exercícios - Revisar antes de gerar PDF</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categoriesWithExercises.map((category) => (
            <div key={category} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="font-semibold">
                  Treino {category}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {exercisesByCategory[category].length} exercícios
                </span>
              </div>
              
              <div className="space-y-2">
                {exercisesByCategory[category].map((exercise, index) => (
                  <div key={exercise.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-muted-foreground min-w-[20px]">
                      {index + 1}.
                    </span>
                    
                    {editingId === exercise.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveEdit} className="h-8 w-8 p-0">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between flex-1">
                        <span className="flex-1">{exercise.name}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{exercise.series}x{exercise.repetitions}</span>
                          {exercise.rest && <span>- {exercise.rest}</span>}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(exercise)}
                            className="h-6 w-6 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExercisePreview;
