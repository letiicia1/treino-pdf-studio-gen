
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, FileSpreadsheet } from "lucide-react";
import { Exercise } from "@/types/workout";
import BulkExerciseImport from "./BulkExerciseImport";
import FileUploader from "./FileUploader";

interface WorkoutFormProps {
  onAddExercise: (exercise: Exercise) => void;
  onAddMultipleExercises: (exercises: Exercise[]) => void;
}

const WorkoutForm = ({ onAddExercise, onAddMultipleExercises }: WorkoutFormProps) => {
  const [exercise, setExercise] = useState({
    name: '',
    series: 1,
    repetitions: '',
    rest: '',
    videoLink: '',
    notes: '',
    category: 'A' as 'A' | 'B' | 'C' | 'D' | 'E'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise.name || !exercise.repetitions) return;

    onAddExercise({
      id: Date.now().toString(),
      ...exercise
    });

    setExercise({
      name: '',
      series: 1,
      repetitions: '',
      rest: '',
      videoLink: '',
      notes: '',
      category: 'A'
    });
  };

  const handleBulkImport = (exercises: Exercise[]) => {
    onAddMultipleExercises(exercises);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Exercícios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bulk" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar Treinos
            </TabsTrigger>
            <TabsTrigger value="single" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Planilha
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bulk" className="mt-6">
            <BulkExerciseImport onImportExercises={handleBulkImport} />
          </TabsContent>

          <TabsContent value="single" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Categoria do Treino *</Label>
                  <Select value={exercise.category} onValueChange={(value: 'A' | 'B' | 'C' | 'D' | 'E') => setExercise({ ...exercise, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
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
                <div>
                  <Label htmlFor="name">Nome do Exercício *</Label>
                  <Input
                    id="name"
                    value={exercise.name}
                    onChange={(e) => setExercise({ ...exercise, name: e.target.value })}
                    placeholder="Ex: Supino reto"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="series">Séries</Label>
                  <Input
                    id="series"
                    type="number"
                    min="1"
                    value={exercise.series}
                    onChange={(e) => setExercise({ ...exercise, series: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="repetitions">Repetições *</Label>
                  <Input
                    id="repetitions"
                    value={exercise.repetitions}
                    onChange={(e) => setExercise({ ...exercise, repetitions: e.target.value })}
                    placeholder="Ex: 12-15 ou 30 seg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rest">Pausa</Label>
                  <Input
                    id="rest"
                    value={exercise.rest}
                    onChange={(e) => setExercise({ ...exercise, rest: e.target.value })}
                    placeholder="Ex: 60 seg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="videoLink">Link do Vídeo</Label>
                <Input
                  id="videoLink"
                  type="url"
                  value={exercise.videoLink}
                  onChange={(e) => setExercise({ ...exercise, videoLink: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={exercise.notes}
                  onChange={(e) => setExercise({ ...exercise, notes: e.target.value })}
                  placeholder="Observações adicionais..."
                  className="resize-none"
                  rows={2}
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Exercício
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="file" className="mt-6">
            <FileUploader onImportExercises={handleBulkImport} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkoutForm;
