
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Exercise } from "@/types/workout";
import * as XLSX from 'xlsx';

interface FileUploaderProps {
  onImportExercises: (exercises: Exercise[]) => void;
}

const FileUploader = ({ onImportExercises }: FileUploaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files.slice(0, 5)); // Máximo 5 arquivos (A, B, C, D, E)
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);

    try {
      const allExercises: Exercise[] = [];
      const categories: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

      for (let fileIndex = 0; fileIndex < selectedFiles.length; fileIndex++) {
        const file = selectedFiles[fileIndex];
        const currentCategory = categories[fileIndex];

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        for (const row of jsonData) {
          if (!row || row.length === 0) continue;

          const firstCell = String(row[0] || '').trim();
          
          // Skip headers or empty rows
          if (firstCell.toLowerCase().includes('exercício') || 
              firstCell.toLowerCase().includes('exercise') ||
              firstCell.toLowerCase().includes('treino') ||
              !firstCell) {
            continue;
          }

          // Process exercise row
          if (row.length >= 3) {
            const [name, videoLink, series, repetitions, rest, notes] = row;
            
            if (name && String(name).trim()) {
              allExercises.push({
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
      }

      if (allExercises.length > 0) {
        onImportExercises(allExercises);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      alert('Erro ao processar arquivos. Verifique o formato e tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryForFile = (index: number) => {
    const categories = ['A', 'B', 'C', 'D', 'E'];
    return categories[index] || 'A';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload de Planilhas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Formatos aceitos: Excel (.xlsx, .xls) e CSV (.csv)</p>
          <p className="mb-2 font-medium text-blue-600">Ordem dos arquivos:</p>
          <ul className="list-disc list-inside space-y-1 text-xs mb-3">
            <li>1º arquivo = Treino A</li>
            <li>2º arquivo = Treino B</li>
            <li>3º arquivo = Treino C</li>
            <li>4º arquivo = Treino D</li>
            <li>5º arquivo = Treino E</li>
          </ul>
          <p className="mb-2">Estrutura de cada planilha:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Coluna A: Nome do Exercício</li>
            <li>Coluna B: Link do Vídeo</li>
            <li>Coluna C: Séries</li>
            <li>Coluna D: Repetições</li>
            <li>Coluna E: Pausa</li>
            <li>Coluna F: Observações</li>
          </ul>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelection}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
            multiple
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              {isProcessing ? 'Processando...' : 'Clique para selecionar arquivos (máx. 5)'}
            </span>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Arquivos selecionados:</p>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Treino {getCategoryForFile(index)}
                  </span>
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isProcessing}
            variant="outline"
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {selectedFiles.length > 0 ? 'Alterar Arquivos' : 'Selecionar Arquivos'}
          </Button>
          
          {selectedFiles.length > 0 && (
            <Button
              onClick={processFiles}
              disabled={isProcessing}
              className="flex-1"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processando...' : `Processar ${selectedFiles.length} arquivo(s)`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
