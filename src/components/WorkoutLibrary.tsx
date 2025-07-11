import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archive, Download, Eye, Trash2, Plus, FileText } from "lucide-react";
import { Exercise } from "@/types/workout";

interface SavedWorkout {
  id: string;
  name: string;
  gender: 'masculino' | 'feminino';
  level: 'iniciante' | 'intermediario' | 'avancado';
  objective: string;
  exercises: Exercise[];
  categories: string[];
  createdAt: Date;
  lastModified: Date;
}

interface WorkoutLibraryProps {
  currentExercises: Exercise[];
  onLoadWorkout: (exercises: Exercise[]) => void;
}

const WorkoutLibrary = ({ currentExercises, onLoadWorkout }: WorkoutLibraryProps) => {
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [saveForm, setSaveForm] = useState({
    name: '',
    gender: 'masculino' as 'masculino' | 'feminino',
    level: 'iniciante' as 'iniciante' | 'intermediario' | 'avancado',
    objective: ''
  });
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSaveWorkout = () => {
    if (!saveForm.name || currentExercises.length === 0) {
      alert('Preencha o nome e adicione exercícios antes de salvar.');
      return;
    }

    const categories = [...new Set(currentExercises.map(ex => ex.category))];
    
    const newWorkout: SavedWorkout = {
      id: Date.now().toString(),
      name: saveForm.name,
      gender: saveForm.gender,
      level: saveForm.level,
      objective: saveForm.objective,
      exercises: [...currentExercises],
      categories: categories.sort(),
      createdAt: new Date(),
      lastModified: new Date()
    };

    setSavedWorkouts([...savedWorkouts, newWorkout]);
    setSaveForm({ name: '', gender: 'masculino', level: 'iniciante', objective: '' });
    setShowSaveForm(false);
    alert('Treino salvo com sucesso!');
  };

  const handleLoadWorkout = (workout: SavedWorkout) => {
    onLoadWorkout(workout.exercises);
    alert(`Treino "${workout.name}" carregado com sucesso!`);
  };

  const handleDeleteWorkout = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este treino?')) {
      setSavedWorkouts(savedWorkouts.filter(w => w.id !== id));
    }
  };

  const filterWorkouts = (gender?: string, level?: string) => {
    return savedWorkouts.filter(workout => {
      if (gender && workout.gender !== gender) return false;
      if (level && workout.level !== level) return false;
      return true;
    });
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'iniciante': return 'bg-green-100 text-green-800';
      case 'intermediario': return 'bg-yellow-100 text-yellow-800';
      case 'avancado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenderBadgeColor = (gender: string) => {
    return gender === 'masculino' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-pink-100 text-pink-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Biblioteca de Treinos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Botão para salvar treino atual */}
          <div className="mb-6">
            <Button
              onClick={() => setShowSaveForm(!showSaveForm)}
              disabled={currentExercises.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Salvar Treino Atual
            </Button>
          </div>

          {/* Formulário de salvamento */}
          {showSaveForm && (
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workout-name">Nome do Treino *</Label>
                    <Input
                      id="workout-name"
                      value={saveForm.name}
                      onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                      placeholder="Ex: Treino Hipertrofia Iniciante"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="workout-gender">Gênero</Label>
                    <Select 
                      value={saveForm.gender} 
                      onValueChange={(value: 'masculino' | 'feminino') => setSaveForm({ ...saveForm, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="workout-level">Nível</Label>
                    <Select 
                      value={saveForm.level} 
                      onValueChange={(value: 'iniciante' | 'intermediario' | 'avancado') => setSaveForm({ ...saveForm, level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="workout-objective">Objetivo / Observações</Label>
                  <Textarea
                    id="workout-objective"
                    value={saveForm.objective}
                    onChange={(e) => setSaveForm({ ...saveForm, objective: e.target.value })}
                    placeholder="Ex: Foco em glúteos, reabilitação de joelho, aumento de massa muscular..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSaveWorkout} className="flex-1">
                    Salvar Treino
                  </Button>
                  <Button variant="outline" onClick={() => setShowSaveForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de treinos salvos */}
          <Tabs defaultValue="todos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="masculino">Masculino</TabsTrigger>
              <TabsTrigger value="feminino">Feminino</TabsTrigger>
              <TabsTrigger value="niveis">Por Nível</TabsTrigger>
            </TabsList>
            
            <TabsContent value="todos" className="space-y-4">
              {savedWorkouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum treino salvo ainda.</p>
                  <p className="text-sm">Salve treinos para organizar sua biblioteca.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedWorkouts.map((workout) => (
                    <Card key={workout.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{workout.name}</h4>
                            <Badge className={getGenderBadgeColor(workout.gender)}>
                              {workout.gender}
                            </Badge>
                            <Badge className={getLevelBadgeColor(workout.level)}>
                              {workout.level}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1 mb-3">
                            <p><strong>Exercícios:</strong> {workout.exercises.length}</p>
                            <p><strong>Categorias:</strong> {workout.categories.join(', ')}</p>
                            {workout.objective && <p><strong>Objetivo:</strong> {workout.objective}</p>}
                            <p><strong>Criado:</strong> {workout.createdAt.toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoadWorkout(workout)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Carregar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteWorkout(workout.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="masculino" className="space-y-4">
              <div className="grid gap-4">
                {filterWorkouts('masculino').map((workout) => (
                  <Card key={workout.id} className="p-4">
                    {/* ... keep existing code (same workout card structure) */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{workout.name}</h4>
                          <Badge className={getLevelBadgeColor(workout.level)}>
                            {workout.level}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1 mb-3">
                          <p><strong>Exercícios:</strong> {workout.exercises.length}</p>
                          <p><strong>Categorias:</strong> {workout.categories.join(', ')}</p>
                          {workout.objective && <p><strong>Objetivo:</strong> {workout.objective}</p>}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoadWorkout(workout)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Carregar
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteWorkout(workout.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="feminino" className="space-y-4">
              <div className="grid gap-4">
                {filterWorkouts('feminino').map((workout) => (
                  <Card key={workout.id} className="p-4">
                    {/* Same structure as masculino */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{workout.name}</h4>
                          <Badge className={getLevelBadgeColor(workout.level)}>
                            {workout.level}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1 mb-3">
                          <p><strong>Exercícios:</strong> {workout.exercises.length}</p>
                          <p><strong>Categorias:</strong> {workout.categories.join(', ')}</p>
                          {workout.objective && <p><strong>Objetivo:</strong> {workout.objective}</p>}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLoadWorkout(workout)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Carregar
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteWorkout(workout.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="niveis" className="space-y-6">
              {['iniciante', 'intermediario', 'avancado'].map((level) => (
                <div key={level}>
                  <h3 className="font-semibold mb-3 capitalize flex items-center gap-2">
                    <Badge className={getLevelBadgeColor(level)}>{level}</Badge>
                    ({filterWorkouts(undefined, level).length} treinos)
                  </h3>
                  <div className="grid gap-3">
                    {filterWorkouts(undefined, level).map((workout) => (
                      <Card key={workout.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{workout.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getGenderBadgeColor(workout.gender)} variant="outline">
                                {workout.gender}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {workout.exercises.length} exercícios
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoadWorkout(workout)}
                            >
                              Carregar
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteWorkout(workout.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutLibrary;
