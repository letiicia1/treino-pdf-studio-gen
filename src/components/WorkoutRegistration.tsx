
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText } from "lucide-react";
import { WorkoutSheet } from "@/types/workout";

interface WorkoutRegistrationProps {
  onCreateWorkout: (workout: Omit<WorkoutSheet, 'id' | 'exercises' | 'createdAt' | 'lastModified'>) => void;
  currentWorkout?: WorkoutSheet | null;
}

const WorkoutRegistration = ({ onCreateWorkout, currentWorkout }: WorkoutRegistrationProps) => {
  const [formData, setFormData] = useState({
    title: currentWorkout?.title || '',
    studentName: currentWorkout?.studentName || '',
    gender: currentWorkout?.gender || 'masculino' as 'masculino' | 'feminino',
    weeklyFrequency: currentWorkout?.weeklyFrequency || 3,
    level: currentWorkout?.level || 'iniciante' as 'iniciante' | 'intermediario' | 'avancado',
    objective: currentWorkout?.objective || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Por favor, preencha o título do treino');
      return;
    }
    onCreateWorkout(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {currentWorkout ? 'Editar Informações do Treino' : 'Cadastrar Novo Treino'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título do Treino *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Treino Hipertrofia - João"
                required
              />
            </div>

            <div>
              <Label htmlFor="student-name">Nome do Aluno</Label>
              <Input
                id="student-name"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                placeholder="Nome do aluno (opcional)"
              />
            </div>

            <div>
              <Label htmlFor="gender">Gênero</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value: 'masculino' | 'feminino') => handleInputChange('gender', value)}
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
              <Label htmlFor="frequency">Frequência Semanal</Label>
              <Select 
                value={formData.weeklyFrequency.toString()} 
                onValueChange={(value) => handleInputChange('weeklyFrequency', parseInt(value))}
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
              <Label htmlFor="level">Nível do Treino</Label>
              <Select 
                value={formData.level} 
                onValueChange={(value: 'iniciante' | 'intermediario' | 'avancado') => handleInputChange('level', value)}
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
            <Label htmlFor="objective">Objetivo (opcional)</Label>
            <Textarea
              id="objective"
              value={formData.objective}
              onChange={(e) => handleInputChange('objective', e.target.value)}
              placeholder="Descreva o objetivo do treino (ex: hipertrofia, emagrecimento, condicionamento...)"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            {currentWorkout ? 'Atualizar Treino' : 'Criar Treino'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkoutRegistration;
