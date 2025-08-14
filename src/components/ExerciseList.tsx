
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, ExternalLink, GripVertical, Edit, Save, X } from "lucide-react";
import { Exercise } from "@/types/workout";

interface ExerciseListProps {
  exercises: Exercise[];
  onRemoveExercise: (id: string) => void;
  onUpdateExercise: (id: string, updatedExercise: Partial<Exercise>) => void;
}

const ExerciseList = ({ exercises, onRemoveExercise, onUpdateExercise }: ExerciseListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Exercise>>({});

  const handleEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setEditForm(exercise);
  };

  const handleSave = () => {
    if (editingId && editForm) {
      onUpdateExercise(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };
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
                  {editingId === exercise.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Nome do exercício"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          value={editForm.series || ''}
                          onChange={(e) => setEditForm({ ...editForm, series: parseInt(e.target.value) })}
                          placeholder="Séries"
                        />
                        <Input
                          value={editForm.repetitions || ''}
                          onChange={(e) => setEditForm({ ...editForm, repetitions: e.target.value })}
                          placeholder="Repetições"
                        />
                        <Input
                          value={editForm.rest || ''}
                          onChange={(e) => setEditForm({ ...editForm, rest: e.target.value })}
                          placeholder="Pausa"
                        />
                      </div>
                      <Input
                        value={editForm.videoLink || ''}
                        onChange={(e) => setEditForm({ ...editForm, videoLink: e.target.value })}
                        placeholder="Link do vídeo (opcional)"
                      />
                      <Textarea
                        value={editForm.notes || ''}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        placeholder="Observações (opcional)"
                        rows={2}
                      />
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {editingId === exercise.id ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(exercise)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveExercise(exercise.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ExerciseList;
