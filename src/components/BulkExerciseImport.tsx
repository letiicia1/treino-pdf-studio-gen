
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload } from "lucide-react";
import { Exercise } from "@/types/workout";

interface BulkExerciseImportProps {
  onImportExercises: (exercises: Exercise[]) => void;
}

const BulkExerciseImport = ({ onImportExercises }: BulkExerciseImportProps) => {
  const [bulkText, setBulkText] = useState('');
  const [defaultCategory, setDefaultCategory] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  const parseExercises = (text: string): Exercise[] => {
    const exercises: Exercise[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    let currentCategory = defaultCategory;
    
    for (const line of lines) {
      // Check if line is a workout category header
      const categoryMatch = line.match(/^TREINO ([A-E])/i);
      if (categoryMatch) {
        currentCategory = categoryMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
        continue;
      }
      
      // Split by tabs or multiple spaces
      const parts = line.split(/\t+|\s{2,}/).filter(part => part.trim());
      
      if (parts.length >= 4) {
        const [name, videoLink, series, repetitions, ...restParts] = parts;
        const rest = restParts.join(' ').trim();
        
        // Skip if name or basic fields are missing
        if (!name.trim() || !series || !repetitions) {
          continue;
        }
        
        exercises.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: name.trim(),
          series: parseInt(series) || 1,
          repetitions: repetitions.trim(),
          rest: rest || '',
          videoLink: videoLink && videoLink.startsWith('http') ? videoLink.trim() : '',
          notes: '',
          category: currentCategory
        });
      }
    }
    
    return exercises;
  };

  const handleImport = () => {
    if (!bulkText.trim()) return;
    
    const exercises = parseExercises(bulkText);
    if (exercises.length > 0) {
      onImportExercises(exercises);
      setBulkText('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Exercícios em Lote
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="defaultCategory">Categoria Padrão</Label>
          <Select value={defaultCategory} onValueChange={(value: 'A' | 'B' | 'C' | 'D' | 'E') => setDefaultCategory(value)}>
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
            Categoria aplicada quando não especificada no texto
          </p>
        </div>

        <div>
          <Label htmlFor="bulkImport">
            Cole aqui sua lista de exercícios
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Formato: Nome do Exercício [TAB] Link do Vídeo [TAB] Séries [TAB] Repetições [TAB] Pausa
            <br />
            Use "TREINO A", "TREINO B", etc. para separar categorias
          </p>
          <Textarea
            id="bulkImport"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Cole aqui sua lista de exercícios...

Exemplo:
TREINO A
Leg press 45	https://www.youtube.com/watch?v=exemplo	4	15	1 min.
Rosca martelo com halter	https://youtu.be/exemplo	4	15	1 min.

TREINO B
Supino articulado inclinado	https://www.youtube.com/watch?v=exemplo	4	15	1 min."
            className="min-h-[120px] resize-none font-mono text-sm"
            rows={8}
          />
        </div>
        
        <Button 
          onClick={handleImport} 
          className="w-full"
          disabled={!bulkText.trim()}
        >
          <FileText className="h-4 w-4 mr-2" />
          Importar {bulkText.trim() ? `(${parseExercises(bulkText).length} exercícios)` : 'Exercícios'}
        </Button>
        
        {bulkText.trim() && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Pré-visualização:</p>
            <p>{parseExercises(bulkText).length} exercícios serão importados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkExerciseImport;
