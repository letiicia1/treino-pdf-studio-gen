
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Smartphone, User, Link, Trash2, Eye } from "lucide-react";
import { Exercise, SavedWorkout } from "@/types/workout";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  workoutId: string;
  workoutName: string;
  publicLink: string;
  createdAt: Date;
}

interface AppBuilderProps {
  exercises: Exercise[];
}

const AppBuilder = ({ exercises }: AppBuilderProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    workoutId: ''
  });

  useEffect(() => {
    loadSavedWorkouts();
  }, []);

  const loadSavedWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('ready_workouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const workouts: SavedWorkout[] = data?.map(item => ({
        id: item.id,
        name: item.name,
        gender: item.category as 'masculino' | 'feminino',
        weeklyFrequency: item.weekly_frequency || 3,
        level: item.level_category as 'iniciante' | 'intermediario' | 'avancado',
        subLevel: item.level_number as 1 | 2 | 3,
        levelComplement: item.level_complement,
        objective: '',
        exercises: (item.workout_data as any)?.exercises || [],
        categories: [],
        headerText: '',
        createdAt: new Date(item.created_at),
        lastModified: new Date(item.updated_at)
      })) || [];

      setSavedWorkouts(workouts);
    } catch (error) {
      console.error('Erro ao carregar treinos salvos:', error);
    }
  };

  const generatePublicLink = (studentId: string, workoutId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/app/${studentId}?workout=${workoutId}`;
  };

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email || !newStudent.workoutId) {
      alert('Preencha o nome, email e selecione um treino.');
      return;
    }

    const selectedWorkout = savedWorkouts.find(w => w.id === newStudent.workoutId);
    if (!selectedWorkout) {
      alert('Treino selecionado não encontrado.');
      return;
    }

    const studentId = Date.now().toString();
    const publicLink = generatePublicLink(studentId, newStudent.workoutId);
    
    const student: Student = {
      id: studentId,
      name: newStudent.name,
      email: newStudent.email,
      phone: newStudent.phone,
      workoutId: newStudent.workoutId,
      workoutName: selectedWorkout.name,
      publicLink,
      createdAt: new Date()
    };

    setStudents([...students, student]);
    setNewStudent({ name: '', email: '', phone: '', workoutId: '' });
  };

  const handleRemoveStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };

  const sendWhatsApp = (student: Student) => {
    const message = `Olá ${student.name}! Seu treino personalizado está pronto. Acesse: ${student.publicLink}`;
    const whatsappUrl = `https://wa.me/${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Construtor de Aplicativos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulário de Cadastro */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Cadastrar Novo Aluno
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-name">Nome do Aluno *</Label>
                <Input
                  id="student-name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="João Silva"
                />
              </div>
              
              <div>
                <Label htmlFor="student-email">E-mail *</Label>
                <Input
                  id="student-email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="joao@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="student-phone">WhatsApp</Label>
                <Input
                  id="student-phone"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="student-workout">Treino da Biblioteca *</Label>
                <Select 
                  value={newStudent.workoutId} 
                  onValueChange={(value) => setNewStudent({ ...newStudent, workoutId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um treino salvo" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedWorkouts.map((workout) => (
                      <SelectItem key={workout.id} value={workout.id}>
                        {workout.name} - {workout.gender} ({workout.level} {workout.subLevel})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleAddStudent}
              className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <User className="h-4 w-4 mr-2" />
              Cadastrar e Gerar App
            </Button>
          </div>
          
          {/* Lista de Alunos */}
          {students.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Alunos Cadastrados ({students.length})</h3>
              <div className="space-y-3">
                {students.map((student) => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{student.name}</h4>
                          <Badge variant="secondary">{student.workoutName}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>📧 {student.email}</p>
                          {student.phone && <p>📱 {student.phone}</p>}
                          <p>📅 {student.createdAt.toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLink(student.publicLink)}
                        >
                          <Link className="h-3 w-3 mr-1" />
                          Copiar Link
                        </Button>
                        
                        {student.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendWhatsApp(student)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            📱 WhatsApp
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(student.publicLink, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver App
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveStudent(student.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {students.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum aluno cadastrado ainda.</p>
              <p className="text-sm">Cadastre alunos para gerar aplicativos personalizados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppBuilder;
