
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Plus } from "lucide-react";
import { Exercise } from "@/types/workout";
import { separateExerciseNameAndLink } from "@/lib/utils";

interface BulkExerciseImportProps {
  onImportExercises: (exercises: Exercise[]) => void;
}

const BulkExerciseImport = ({ onImportExercises }: BulkExerciseImportProps) => {
  const [bulkText, setBulkText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  const parseExercises = (text: string, category: 'A' | 'B' | 'C' | 'D' | 'E'): Exercise[] => {
    const exercises: Exercise[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Skip empty lines and potential headers
      if (!line.trim() || line.toLowerCase().includes('exercício') || line.toLowerCase().includes('treino')) {
        continue;
      }
      
      // Split by tabs or multiple spaces
      const parts = line.split(/\t+|\s{2,}/).filter(part => part.trim());
      
      if (parts.length >= 2) {
        const [nameWithPossibleLink, videoLink, series, repetitions, rest, ...notesParts] = parts;
        const notes = notesParts.join(' ').trim();
        
        // Skip if name is missing
        if (!nameWithPossibleLink.trim()) {
          continue;
        }
        
        // Separar nome do exercício do link se estiverem colados
        const { name, videoLink: extractedLink } = separateExerciseNameAndLink(nameWithPossibleLink.trim());
        
        // Usar o link extraído se não há link separado, ou o link separado se existe
        const finalVideoLink = (videoLink && videoLink.startsWith('http')) 
          ? videoLink.trim() 
          : extractedLink || '';
        
        exercises.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name,
          series: parseInt(series) || 1,
          repetitions: repetitions?.trim() || '10',
          rest: rest?.trim() || '60s',
          videoLink: finalVideoLink,
          notes: notes || '',
          category: category
        });
      }
    }
    
    return exercises;
  };

  const handleImport = () => {
    if (!bulkText.trim()) return;
    
    const exercises = parseExercises(bulkText, selectedCategory);
    if (exercises.length > 0) {
      onImportExercises(exercises);
      setBulkText('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Como Importar Todos os Treinos:</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Selecione "Treino A" e cole os exercícios do Treino A</li>
          <li>2. Clique em "Adicionar ao PDF"</li>
          <li>3. Repita para Treinos B, C, D e E</li>
          <li>4. Quando todos estiverem adicionados, gere o PDF completo</li>
        </ol>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Exercícios por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="categorySelect">Selecione a Categoria do Treino</Label>
            <Select value={selectedCategory} onValueChange={(value: 'A' | 'B' | 'C' | 'D' | 'E') => setSelectedCategory(value)}>
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
            <p className="text-xs text-muted-foreground mt-1">
              Todos os exercícios colados serão adicionados ao <strong>Treino {selectedCategory}</strong>
            </p>
          </div>

          <div>
            <Label htmlFor="bulkImport">
              Cole aqui os exercícios do Treino {selectedCategory}
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Formato: Nome do Exercício [TAB] Link do Vídeo [TAB] Séries [TAB] Repetições [TAB] Pausa [TAB] Observações
            </p>
            <Textarea
              id="bulkImport"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Cole aqui os exercícios do Treino ${selectedCategory}...

Exemplo:
Leg press 45	https://www.youtube.com/watch?v=exemplo	4	15	1 min.	
Rosca martelo com halter	https://youtu.be/exemplo	4	15	1 min.	Manter postura
Supino articulado inclinado		4	15	1 min.`}
              className="min-h-[120px] resize-none font-mono text-sm"
              rows={8}
            />
          </div>
          
          <Button 
            onClick={handleImport} 
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            disabled={!bulkText.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar ao PDF - Treino {selectedCategory} {bulkText.trim() ? `(${parseExercises(bulkText, selectedCategory).length} exercícios)` : ''}
          </Button>
          
          {bulkText.trim() && (
            <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
              <p className="font-medium">Pré-visualização:</p>
              <p>{parseExercises(bulkText, selectedCategory).length} exercícios serão adicionados ao <strong>Treino {selectedCategory}</strong></p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkExerciseImport;
