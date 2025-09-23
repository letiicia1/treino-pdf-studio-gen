import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Archive, Download, Eye, Trash2, Plus, FileText, Edit, FileSpreadsheet, Pencil } from "lucide-react";
import { SavedWorkout, Exercise, BrandingConfig } from "@/types/workout";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface SavedWorkoutLibraryProps {
  currentExercises: Exercise[];
  branding: BrandingConfig;
  onLoadWorkout: (exercises: Exercise[]) => void;
}

const SavedWorkoutLibrary = ({ currentExercises, branding, onLoadWorkout }: SavedWorkoutLibraryProps) => {
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: '',
    gender: 'masculino' as 'masculino' | 'feminino',
    weeklyFrequency: 3,
    level: 'iniciante' as 'iniciante' | 'intermediario' | 'avancado',
    subLevel: 1 as 1 | 2 | 3,
    levelComplement: '',
    objective: '',
    headerText: ''
  });
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [editingHeader, setEditingHeader] = useState<SavedWorkout | null>(null);
  const [headerText, setHeaderText] = useState('');
  const [editingWorkout, setEditingWorkout] = useState<SavedWorkout | null>(null);
  const [editingName, setEditingName] = useState('');
  const [viewingWorkout, setViewingWorkout] = useState<SavedWorkout | null>(null);
  const [editingExercises, setEditingExercises] = useState<Exercise[]>([]);
  const [isEditingExercises, setIsEditingExercises] = useState(false);
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(null);

  // Load workouts from Supabase on component mount
  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ready_workouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const workouts: SavedWorkout[] = data.map(workout => {
          let exercises: Exercise[] = [];
          try {
            if (Array.isArray(workout.workout_data)) {
              exercises = workout.workout_data as unknown as Exercise[];
            }
          } catch (error) {
            console.error('Error parsing workout data:', error);
          }

          const categories = [...new Set(exercises.map(ex => ex.category))];

          return {
            id: workout.id,
            name: workout.name,
            gender: workout.category as 'masculino' | 'feminino',
            weeklyFrequency: workout.weekly_frequency || 3,
            level: workout.level_category as 'iniciante' | 'intermediario' | 'avancado',
            subLevel: workout.level_number as 1 | 2 | 3,
            levelComplement: workout.level_complement || '',
            objective: '',
            headerText: '',
            exercises,
            categories: categories.sort(),
            createdAt: new Date(workout.created_at),
            lastModified: new Date(workout.updated_at)
          };
        });
        setSavedWorkouts(workouts);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
      alert('Erro ao carregar treinos salvos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = async () => {
    if (!saveForm.name || currentExercises.length === 0) {
      alert('Preencha o nome e adicione exercícios antes de salvar.');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('ready_workouts')
        .insert({
          name: saveForm.name,
          category: saveForm.gender,
          weekly_frequency: saveForm.weeklyFrequency,
          level_category: saveForm.level,
          level_number: saveForm.subLevel,
          level_complement: saveForm.levelComplement,
          workout_data: currentExercises as any,
          student_name: null
        })
        .select()
        .single();

      if (error) throw error;

      // Reload workouts to get the latest data
      await loadWorkouts();
      
      setSaveForm({ 
        name: '', 
        gender: 'masculino', 
        weeklyFrequency: 3,
        level: 'iniciante', 
        subLevel: 1,
        levelComplement: '',
        objective: '',
        headerText: ''
      });
      setShowSaveForm(false);
      alert('Treino salvo com sucesso!');
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Erro ao salvar treino');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadWorkout = (workout: SavedWorkout) => {
    onLoadWorkout(workout.exercises);
    alert(`Treino "${workout.name}" carregado com sucesso!`);
  };

  const handleDeleteWorkout = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este treino?')) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('ready_workouts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setSavedWorkouts(savedWorkouts.filter(w => w.id !== id));
        alert('Treino excluído com sucesso!');
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Erro ao excluir treino');
      } finally {
        setLoading(false);
      }
    }
  };

  const generateWorkoutPDF = (workout: SavedWorkout, customHeader?: string) => {
    const exercisesByCategory = workout.exercises.reduce((acc, exercise) => {
      const category = exercise.category || 'A';
      if (!acc[category]) acc[category] = [];
      acc[category].push(exercise);
      return acc;
    }, {} as Record<string, Exercise[]>);

    const categoriesWithExercises = Object.keys(exercisesByCategory).filter(
      category => exercisesByCategory[category].length > 0
    ).sort();

    const doc = new jsPDF();
    let isFirstPage = true;

    categoriesWithExercises.forEach((category) => {
      const categoryExercises = exercisesByCategory[category];
      
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      // Navy blue stripe at the top
      doc.setFillColor(25, 47, 89);
      doc.rect(0, 0, 210, 20, 'F');
      
      // Studio name centered in the stripe
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      const studioName = "PÂMELA PIRES - ACADEMIA DE MUSCULAÇÃO";
      const studioNameWidth = doc.getTextWidth(studioName);
      const centerX = (210 - studioNameWidth) / 2;
      doc.text(studioName, centerX, 13);
      
      // Custom header or default
      doc.setFontSize(18);
      doc.setTextColor(25, 47, 89);
      const titleText = 'FICHA DE TREINO';
      const titleWidth = doc.getTextWidth(titleText);
      const titleCenterX = (210 - titleWidth) / 2;
      doc.text(titleText, titleCenterX, 32);
      
      let currentY = 50;
      
      // Centered workout category
      doc.setFontSize(14);
      doc.setTextColor(25, 47, 89);
      const categoryText = `TREINO ${category}`;
      const categoryWidth = doc.getTextWidth(categoryText);
      const categoryCenterX = (210 - categoryWidth) / 2;
      doc.text(categoryText, categoryCenterX, currentY);
      currentY += 15;

      // Prepare table data
      const tableData = categoryExercises.map(exercise => [
        exercise.name,
        exercise.videoLink ? 'Ver Vídeo' : '',
        exercise.series.toString(),
        exercise.repetitions,
        exercise.rest || '',
        exercise.notes || ''
      ]);

      // Generate table using autoTable
      autoTable(doc, {
        head: [['Exercício', 'Vídeo', 'S', 'Rep.', 'Pausa', 'Obs.']],
        body: tableData,
        startY: currentY,
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.5,
          valign: 'middle',
          halign: 'center'
        },
        headStyles: {
          fillColor: [25, 47, 89],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center',
          minCellHeight: 8
        },
        bodyStyles: {
          fontSize: 9,
          minCellHeight: 12
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { 
            cellWidth: 55,
            fillColor: [25, 47, 89],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left'
          },
          1: { 
            cellWidth: 25, 
            fillColor: [255, 255, 255],
            textColor: [0, 0, 255],
            halign: 'center'
          },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 35, halign: 'left' }
        },
        margin: { left: 15, right: 15 },
        didDrawCell: (data) => {
          // Add clickable links for video column
          if (data.column.index === 1 && data.row.index >= 0) {
            const exercise = categoryExercises[data.row.index];
            if (exercise?.videoLink && data.cell.text[0] === 'Ver Vídeo') {
              // Create clickable link annotation that opens the YouTube video
              doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
                url: exercise.videoLink
              });
            }
          }
        }
      });
    });

    // Save PDF
    const fileName = `ficha-treino-${workout.weeklyFrequency}x-semana.pdf`;
    doc.save(fileName);
  };

  const generateWorkoutExcel = (workout: SavedWorkout) => {
    const exercisesByCategory = workout.exercises.reduce((acc, exercise) => {
      const category = exercise.category || 'A';
      if (!acc[category]) acc[category] = [];
      acc[category].push(exercise);
      return acc;
    }, {} as Record<string, Exercise[]>);

    const categoriesWithExercises = Object.keys(exercisesByCategory).filter(
      category => exercisesByCategory[category].length > 0
    ).sort();

    const workbook = XLSX.utils.book_new();
    
    categoriesWithExercises.forEach((category) => {
      const categoryExercises = exercisesByCategory[category];
      
      const excelData: any[] = [];
      
      // Add header row
      excelData.push(['#', 'Exercício', 'Link do Vídeo', 'Série', 'Repetição', 'Pausa', 'Observação']);
      
      // Add exercises data with numbering
      categoryExercises.forEach((exercise, index) => {
        excelData.push([
          index + 1,
          exercise.name,
          exercise.videoLink ? { f: `=HYPERLINK("${exercise.videoLink}","${exercise.videoLink}")` } : '',
          exercise.series.toString(),
          exercise.repetitions,
          exercise.rest || '',
          exercise.notes || ''
        ]);
      });
      
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);
      
      worksheet['!cols'] = [
        { width: 5 },   // #
        { width: 40 },  // Exercício
        { width: 50 },  // Link do Vídeo
        { width: 10 },  // Série
        { width: 15 },  // Repetição
        { width: 15 },  // Pausa
        { width: 30 }   // Observação
      ];
      
      XLSX.utils.book_append_sheet(workbook, worksheet, `Treino ${category}`);
    });
    
    const levelText = `${workout.level}-${workout.subLevel}`;
    const complement = workout.levelComplement ? `-${workout.levelComplement.replace(/\s+/g, '-')}` : '';
    const fileName = `treino-${workout.gender}-${levelText}${complement}-${workout.weeklyFrequency}x-semana.xlsx`;
    XLSX.writeFile(workbook, fileName);
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

  const openHeaderEditor = (workout: SavedWorkout) => {
    setEditingHeader(workout);
    setHeaderText(workout.headerText || 'FICHA DE TREINO');
  };

  const handleDownloadWithCustomHeader = () => {
    if (editingHeader) {
      generateWorkoutPDF(editingHeader, headerText);
      setEditingHeader(null);
      setHeaderText('');
    }
  };

  const openNameEditor = (workout: SavedWorkout) => {
    setEditingWorkout(workout);
    setEditingName(workout.name);
  };

  const handleSaveEditedName = async () => {
    if (editingWorkout && editingName.trim()) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('ready_workouts')
          .update({ name: editingName.trim() })
          .eq('id', editingWorkout.id);

        if (error) throw error;

        setSavedWorkouts(savedWorkouts.map(w => 
          w.id === editingWorkout.id 
            ? { ...w, name: editingName.trim(), lastModified: new Date() }
            : w
        ));
        setEditingWorkout(null);
        setEditingName('');
        alert('Nome do treino atualizado com sucesso!');
      } catch (error) {
        console.error('Error updating workout name:', error);
        alert('Erro ao atualizar nome do treino');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditExercises = (workout: SavedWorkout) => {
    setEditingExercises([...workout.exercises]);
    setIsEditingExercises(true);
    setCurrentWorkoutId(workout.id);
  };

  const handleSaveExercises = async () => {
    if (!currentWorkoutId) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('ready_workouts')
        .update({
          workout_data: editingExercises as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentWorkoutId);

      if (error) throw error;

      // Update local state
      setSavedWorkouts(prev => prev.map(w => 
        w.id === currentWorkoutId 
          ? { ...w, exercises: editingExercises, lastModified: new Date() }
          : w
      ));

      setIsEditingExercises(false);
      setCurrentWorkoutId(null);
      setEditingExercises([]);
      alert("Exercícios atualizados com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar exercícios:', error);
      alert("Erro ao salvar exercícios");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditExercises = () => {
    setIsEditingExercises(false);
    setCurrentWorkoutId(null);
    setEditingExercises([]);
  };

  const handleUpdateEditingExercise = (id: string, updatedExercise: Partial<Exercise>) => {
    setEditingExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, ...updatedExercise } : ex
    ));
  };

  const handleRemoveEditingExercise = (id: string) => {
    setEditingExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const handleAddNewExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: 'Novo Exercício',
      series: 3,
      repetitions: '12',
      rest: '60s',
      category: 'A',
      notes: '',
      videoLink: ''
    };
    setEditingExercises(prev => [...prev, newExercise]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Biblioteca de Treinos Salvos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Botão para salvar treino atual */}
          <div className="mb-6">
            <Button
              onClick={() => setShowSaveForm(!showSaveForm)}
              disabled={currentExercises.length === 0 || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Treino Atual'}
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
                      placeholder="Ex: Treino Hipertrofia João"
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
                    <Label htmlFor="workout-frequency">Frequência Semanal</Label>
                    <Select 
                      value={saveForm.weeklyFrequency.toString()} 
                      onValueChange={(value) => setSaveForm({ ...saveForm, weeklyFrequency: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1x por semana</SelectItem>
                        <SelectItem value="2">2x por semana</SelectItem>
                        <SelectItem value="3">3x por semana</SelectItem>
                        <SelectItem value="4">4x por semana</SelectItem>
                        <SelectItem value="5">5x por semana</SelectItem>
                        <SelectItem value="6">6x por semana</SelectItem>
                        <SelectItem value="7">7x por semana</SelectItem>
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

                  <div>
                    <Label htmlFor="workout-sublevel">Sub-nível</Label>
                    <Select 
                      value={saveForm.subLevel.toString()} 
                      onValueChange={(value: string) => setSaveForm({ ...saveForm, subLevel: parseInt(value) as 1 | 2 | 3 })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Nível 1</SelectItem>
                        <SelectItem value="2">Nível 2</SelectItem>
                        <SelectItem value="3">Nível 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level-complement">Complemento do Nível</Label>
                    <Input
                      id="level-complement"
                      value={saveForm.levelComplement}
                      onChange={(e) => setSaveForm({ ...saveForm, levelComplement: e.target.value })}
                      placeholder="Ex: com foco em glúteos"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="workout-objective">Objetivo / Observações</Label>
                  <Textarea
                    id="workout-objective"
                    value={saveForm.objective}
                    onChange={(e) => setSaveForm({ ...saveForm, objective: e.target.value })}
                    placeholder="Ex: Foco em glúteos, reabilitação de joelho, aumento de massa muscular..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="header-text">Cabeçalho Personalizado (opcional)</Label>
                  <Input
                    id="header-text"
                    value={saveForm.headerText}
                    onChange={(e) => setSaveForm({ ...saveForm, headerText: e.target.value })}
                    placeholder="Ex: TREINO PERSONALIZADO HIPERTROFIA"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSaveWorkout} className="flex-1" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Treino'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowSaveForm(false)} disabled={loading}>
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
                            {editingWorkout?.id === workout.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="h-8 text-sm font-semibold"
                                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEditedName()}
                                />
                                <Button size="sm" onClick={handleSaveEditedName}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingWorkout(null)}>
                                  ✕
                                </Button>
                              </div>
                            ) : (
                              <h4 className="font-semibold">{workout.name}</h4>
                            )}
                            <Badge className={getGenderBadgeColor(workout.gender)}>
                              {workout.gender}
                            </Badge>
                            <Badge className={getLevelBadgeColor(workout.level)}>
                              {workout.level} {workout.subLevel}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1 mb-3">
                            <p><strong>Exercícios:</strong> {workout.exercises.length} | <strong>Frequência:</strong> {workout.weeklyFrequency}x/semana</p>
                            <p><strong>Categorias:</strong> {workout.categories.join(', ')}</p>
                            {workout.levelComplement && <p><strong>Complemento:</strong> {workout.levelComplement}</p>}
                            {workout.objective && <p><strong>Objetivo:</strong> {workout.objective}</p>}
                            <p><strong>Criado:</strong> {workout.createdAt.toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingWorkout(workout)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver Exercícios
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Exercícios - {workout.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {workout.categories.map(category => (
                                  <div key={category} className="border rounded-lg p-4">
                                 <h3 className="font-semibold text-lg mb-3 text-center bg-primary text-primary-foreground py-2 rounded">
                                       TREINO {category}
                                     </h3>
                                     <div className="space-y-2">
                                       {workout.exercises
                                         .filter(ex => ex.category === category)
                                         .map((exercise, index) => (
                                           <div key={exercise.id} className="border-b pb-2 last:border-b-0">
                                             <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
                                               <div className="md:col-span-2 font-medium">{exercise.name}</div>
                                               <div className="text-center">
                                                 <span className="font-medium">{exercise.series}</span> séries
                                               </div>
                                               <div className="text-center">{exercise.repetitions}</div>
                                               <div className="text-center">{exercise.rest || '-'}</div>
                                               <div className="text-xs">{exercise.notes || '-'}</div>
                                             </div>
                                             {exercise.videoLink && (
                                               <div className="mt-1">
                                                 <a 
                                                   href={exercise.videoLink} 
                                                   target="_blank" 
                                                   rel="noopener noreferrer"
                                                   className="text-blue-600 hover:underline text-xs"
                                                 >
                                                   Ver vídeo
                                                 </a>
                                               </div>
                                             )}
                                           </div>
                                         ))}
                                     </div>
                                      <div className="flex gap-2 mt-4 pt-3 border-t">
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleEditExercises(workout)}
                                        >
                                          <Edit className="h-3 w-3 mr-1" />
                                          Editar Treino
                                        </Button>
                                      </div>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoadWorkout(workout)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Carregar
                          </Button>
                          
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => openNameEditor(workout)}
                           >
                             <Pencil className="h-3 w-3 mr-1" />
                             Editar Nome
                           </Button>
                           
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleEditExercises(workout)}
                           >
                             <Edit className="h-3 w-3 mr-1" />
                             Editar Exercícios
                           </Button>
                           
                           <Dialog>
                             <DialogTrigger asChild>
                               <Button
                                 size="sm"
                                 variant="default"
                                 onClick={() => openHeaderEditor(workout)}
                               >
                                 <FileText className="h-3 w-3 mr-1" />
                                 PDF
                               </Button>
                             </DialogTrigger>
                             <DialogContent>
                               <DialogHeader>
                                 <DialogTitle>Personalizar PDF</DialogTitle>
                               </DialogHeader>
                               <div className="space-y-4">
                                 <div>
                                   <Label htmlFor="custom-header">Cabeçalho do PDF</Label>
                                   <Input
                                     id="custom-header"
                                     value={headerText}
                                     onChange={(e) => setHeaderText(e.target.value)}
                                     placeholder="FICHA DE TREINO"
                                   />
                                 </div>
                                 <div className="flex gap-2">
                                   <Button onClick={handleDownloadWithCustomHeader} className="flex-1">
                                     <FileText className="h-4 w-4 mr-2" />
                                     Baixar PDF
                                   </Button>
                                 </div>
                               </div>
                             </DialogContent>
                           </Dialog>
                           
                           <Button
                             size="sm"
                             variant="secondary"
                             onClick={() => generateWorkoutExcel(workout)}
                           >
                             <FileSpreadsheet className="h-3 w-3 mr-1" />
                             Excel
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{workout.name}</h4>
                          <Badge className={getLevelBadgeColor(workout.level)}>
                            {workout.level} {workout.subLevel}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1 mb-3">
                          <p><strong>Exercícios:</strong> {workout.exercises.length} | <strong>Freq:</strong> {workout.weeklyFrequency}x/sem</p>
                          <p><strong>Categorias:</strong> {workout.categories.join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleLoadWorkout(workout)}>
                          <Eye className="h-3 w-3 mr-1" />Carregar
                        </Button>
                        <Button size="sm" variant="default" onClick={() => generateWorkoutPDF(workout)}>
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => generateWorkoutExcel(workout)}>
                          <FileSpreadsheet className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteWorkout(workout.id)}>
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{workout.name}</h4>
                          <Badge className={getLevelBadgeColor(workout.level)}>
                            {workout.level} {workout.subLevel}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1 mb-3">
                          <p><strong>Exercícios:</strong> {workout.exercises.length} | <strong>Freq:</strong> {workout.weeklyFrequency}x/sem</p>
                          <p><strong>Categorias:</strong> {workout.categories.join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleLoadWorkout(workout)}>
                          <Eye className="h-3 w-3 mr-1" />Carregar
                        </Button>
                        <Button size="sm" variant="default" onClick={() => generateWorkoutPDF(workout)}>
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => generateWorkoutExcel(workout)}>
                          <FileSpreadsheet className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteWorkout(workout.id)}>
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
                              <Badge variant="outline">
                                {workout.level} {workout.subLevel}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {workout.exercises.length} exercícios • {workout.weeklyFrequency}x/sem
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleLoadWorkout(workout)}>
                              Carregar
                            </Button>
                            <Button size="sm" variant="default" onClick={() => generateWorkoutPDF(workout)}>
                              <FileText className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => generateWorkoutExcel(workout)}>
                              <FileSpreadsheet className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteWorkout(workout.id)}>
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
      
      {/* Dialog para editar nome do treino */}
      <Dialog open={editingWorkout !== null} onOpenChange={(open) => !open && setEditingWorkout(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nome do Treino</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome do Treino</Label>
              <Input
                id="edit-name"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Digite o novo nome do treino"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEditedName} className="flex-1">
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setEditingWorkout(null)}>
                Cancelar
              </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Exercise Editing Dialog */}
    <Dialog open={isEditingExercises} onOpenChange={setIsEditingExercises}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Exercícios do Treino</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {editingExercises.map((exercise, index) => (
            <Card key={exercise.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <Badge variant="secondary">Treino {exercise.category}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Nome do Exercício</Label>
                    <Input
                      value={exercise.name}
                      onChange={(e) => handleUpdateEditingExercise(exercise.id, { name: e.target.value })}
                      placeholder="Nome do exercício"
                    />
                  </div>
                  
                  <div>
                    <Label>Categoria</Label>
                    <Select 
                      value={exercise.category} 
                      onValueChange={(value: 'A' | 'B' | 'C' | 'D' | 'E') => 
                        handleUpdateEditingExercise(exercise.id, { category: value })
                      }
                    >
                      <SelectTrigger>
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
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Séries</Label>
                    <Input
                      type="number"
                      value={exercise.series}
                      onChange={(e) => handleUpdateEditingExercise(exercise.id, { series: parseInt(e.target.value) })}
                      placeholder="3"
                    />
                  </div>
                  
                  <div>
                    <Label>Repetições</Label>
                    <Input
                      value={exercise.repetitions}
                      onChange={(e) => handleUpdateEditingExercise(exercise.id, { repetitions: e.target.value })}
                      placeholder="12"
                    />
                  </div>
                  
                  <div>
                    <Label>Pausa</Label>
                    <Input
                      value={exercise.rest || ''}
                      onChange={(e) => handleUpdateEditingExercise(exercise.id, { rest: e.target.value })}
                      placeholder="60s"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Link do Vídeo (opcional)</Label>
                  <Input
                    value={exercise.videoLink || ''}
                    onChange={(e) => handleUpdateEditingExercise(exercise.id, { videoLink: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                
                <div>
                  <Label>Observações (opcional)</Label>
                  <Textarea
                    value={exercise.notes || ''}
                    onChange={(e) => handleUpdateEditingExercise(exercise.id, { notes: e.target.value })}
                    placeholder="Observações sobre o exercício..."
                    rows={2}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveEditingExercise(exercise.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remover
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleAddNewExercise}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Exercício
            </Button>
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={handleSaveExercises} 
              className="flex-1" 
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancelEditExercises}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
);
};

export default SavedWorkoutLibrary;