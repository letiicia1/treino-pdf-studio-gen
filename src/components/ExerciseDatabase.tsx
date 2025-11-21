import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Edit, Trash2, Play, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DatabaseExercise {
  id: string;
  name: string;
  video_url?: string;
  muscle_group?: string;
  created_at: string;
  updated_at: string;
}

const ExerciseDatabase = () => {
  const [exercises, setExercises] = useState<DatabaseExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<DatabaseExercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<DatabaseExercise | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    video_url: '',
    muscle_group: ''
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
      toast.error('Erro ao carregar exercícios');
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicate = (name: string, excludeId?: string) => {
    return exercises.some(ex => 
      ex.name.toLowerCase().trim() === name.toLowerCase().trim() && 
      ex.id !== excludeId
    );
  };

  const handleSaveExercise = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome do exercício é obrigatório');
      return;
    }

    if (checkDuplicate(formData.name, editingExercise?.id)) {
      toast.error('Exercício já existe na base de dados');
      return;
    }

    try {
      if (editingExercise) {
        // Atualizar exercício existente
        const { error } = await supabase
          .from('exercises')
          .update({
            name: formData.name.trim(),
            video_url: formData.video_url.trim() || null,
            muscle_group: formData.muscle_group.trim() || null
          })
          .eq('id', editingExercise.id);

        if (error) throw error;
        toast.success('Exercício atualizado com sucesso');
      } else {
        // Criar novo exercício
        const { error } = await supabase
          .from('exercises')
          .insert({
            name: formData.name.trim(),
            video_url: formData.video_url.trim() || null,
            muscle_group: formData.muscle_group.trim() || null
          });

        if (error) throw error;
        toast.success('Exercício adicionado com sucesso');
      }

      await loadExercises();
      resetForm();
      setIsAddModalOpen(false);
      setEditingExercise(null);
    } catch (error) {
      console.error('Erro ao salvar exercício:', error);
      toast.error('Erro ao salvar exercício');
    }
  };

  const handleDeleteExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadExercises();
      toast.success('Exercício excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir exercício:', error);
      toast.error('Erro ao excluir exercício');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', video_url: '', muscle_group: '' });
  };

  const openEditModal = (exercise: DatabaseExercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      video_url: exercise.video_url || '',
      muscle_group: exercise.muscle_group || ''
    });
    setIsAddModalOpen(true);
  };

  const openVideoPlayer = (exercise: DatabaseExercise) => {
    setSelectedExercise(exercise);
    setIsVideoPlayerOpen(true);
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    return url;
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exercise.muscle_group && exercise.muscle_group.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Database className="h-8 w-8 animate-pulse mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando base de dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Base de Dados de Exercícios
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  resetForm();
                  setEditingExercise(null);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Exercício
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingExercise ? 'Editar Exercício' : 'Adicionar Novo Exercício'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Exercício *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Supino reto com barra"
                    />
                  </div>
                  <div>
                    <Label htmlFor="video_url">URL do Vídeo</Label>
                    <Input
                      id="video_url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="muscle_group">Grupo Muscular</Label>
                    <Input
                      id="muscle_group"
                      value={formData.muscle_group}
                      onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                      placeholder="Ex: Peitoral, Costas, Pernas"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveExercise} className="flex-1">
                      {editingExercise ? 'Salvar Alterações' : 'Adicionar Exercício'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setEditingExercise(null);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar exercícios por nome ou grupo muscular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {exercises.length === 0 ? (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            Nenhum exercício encontrado na base de dados. Adicione exercícios para começar.
          </AlertDescription>
        </Alert>
      ) : filteredExercises.length === 0 ? (
        <Alert>
          <Search className="h-4 w-4" />
          <AlertDescription>
            Nenhum exercício encontrado para "{searchTerm}".
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Exercícios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lista de Exercícios</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <ol className="space-y-2">
                  {filteredExercises.map((exercise, index) => (
                    <li key={exercise.id}>
                      <div
                        className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                          selectedExercise?.id === exercise.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-card hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedExercise(exercise)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-semibold text-muted-foreground min-w-[2rem]">
                            {index + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm mb-1">
                              {exercise.name}
                            </h3>
                            {exercise.muscle_group && (
                              <p className="text-xs text-muted-foreground">
                                {exercise.muscle_group}
                              </p>
                            )}
                            {exercise.video_url && (
                              <div className="flex items-center gap-1 mt-1">
                                <Play className="h-3 w-3 text-primary" />
                                <span className="text-xs text-primary">Vídeo disponível</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(exercise);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o exercício "{exercise.name}"? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteExercise(exercise.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Preview de Vídeo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview do Exercício</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedExercise ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {selectedExercise.name}
                    </h3>
                    {selectedExercise.muscle_group && (
                      <p className="text-sm text-muted-foreground">
                        Grupo Muscular: {selectedExercise.muscle_group}
                      </p>
                    )}
                  </div>
                  
                  {selectedExercise.video_url ? (
                    <div className="aspect-video rounded-lg overflow-hidden border">
                      <iframe
                        src={getVideoEmbedUrl(selectedExercise.video_url)}
                        title={selectedExercise.name}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border border-dashed flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum vídeo disponível</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center text-center">
                  <div className="text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      Selecione um exercício da lista para ver os detalhes
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExerciseDatabase;