
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Exercise } from "@/types/workout";
import * as XLSX from 'xlsx';

interface FileUploaderProps {
  onImportExercises: (exercises: Exercise[]) => void;
}

const FileUploader = ({ onImportExercises }: FileUploaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      const exercises: Exercise[] = [];
      let currentCategory = 'A';

      for (const row of jsonData) {
        if (!row || row.length === 0) continue;

        const firstCell = String(row[0] || '').trim();
        
        // Check for category headers
        const categoryMatch = firstCell.match(/^TREINO ([A-E])/i);
        if (categoryMatch) {
          currentCategory = categoryMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
          continue;
        }

        // Skip headers or empty rows
        if (firstCell.toLowerCase().includes('exercício') || 
            firstCell.toLowerCase().includes('exercise') ||
            !firstCell) {
          continue;
        }

        // Process exercise row
        if (row.length >= 3) {
          const [name, videoLink, series, repetitions, rest, notes] = row;
          
          if (name && String(name).trim()) {
            exercises.push({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name: String(name).trim(),
              series: parseInt(String(series)) || 1,
              repetitions: String(repetitions || '').trim(),
              rest: String(rest || '').trim(),
              videoLink: String(videoLink || '').trim(),
              notes: String(notes || '').trim(),
              category: currentCategory
            });
          }
        }
      }

      if (exercises.length > 0) {
        onImportExercises(exercises);
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert('Erro ao processar arquivo. Verifique o formato e tente novamente.');
    } finally {
      setIsProcessing(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload de Planilha
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Formatos aceitos: Excel (.xlsx, .xls) e CSV (.csv)</p>
          <p className="mb-2">Estrutura da planilha:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Coluna A: Nome do Exercício</li>
            <li>Coluna B: Link do Vídeo</li>
            <li>Coluna C: Séries</li>
            <li>Coluna D: Repetições</li>
            <li>Coluna E: Pausa</li>
            <li>Coluna F: Observações</li>
          </ul>
          <p className="mt-2 text-xs">Use "TREINO A", "TREINO B", etc. para separar categorias</p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              {isProcessing ? 'Processando...' : 'Clique para selecionar arquivo'}
            </span>
          </label>
        </div>

        <Button
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isProcessing}
          className="w-full"
          variant="outline"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isProcessing ? 'Processando Arquivo...' : 'Selecionar Arquivo'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
