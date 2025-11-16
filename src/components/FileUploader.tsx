
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Exercise } from "@/types/workout";
import * as XLSX from 'xlsx';
import { separateExerciseNameAndLink } from "@/lib/utils";

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
        const currentCategory = categories[fileIndex]; // Garantir que cada arquivo tenha sua categoria

        console.log(`Processando arquivo ${fileIndex + 1}: ${file.name} como Treino ${currentCategory}`);

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        let exerciseCount = 0;

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
          if (row.length >= 1 && firstCell) {
            // Separar nome do exercício do link se estiverem colados
            const { name, videoLink: extractedLink } = separateExerciseNameAndLink(String(row[0]).trim());
            
            let videoLink = extractedLink || '';
            let series = 1;
            let repetitions = '10';
            let rest = '';
            let notes = '';
            
            // Processar as colunas restantes de forma inteligente
            for (let i = 1; i < row.length; i++) {
              const cell = String(row[i] || '').trim();
              if (!cell) continue;
              
              // Se for um link HTTP
              if (cell.startsWith('http')) {
                if (!videoLink) videoLink = cell;
                continue;
              }
              
              // Se for pausa (contém 's', 'min', 'seg' ou é apenas números seguidos de unidade)
              if (cell.match(/^\d+s$/i) || 
                  cell.match(/^\d+\s*min/i) || 
                  cell.match(/^\d+\s*seg/i)) {
                rest = cell;
                continue;
              }
              
              // Se for apenas um número (provavelmente séries)
              if (cell.match(/^\d+$/) && series === 1 && i === 1) {
                series = parseInt(cell);
                continue;
              }
              
              // Se for repetições (números com traço, vírgula, ou texto descritivo)
              if (cell.match(/^\d+[-,x]\d+/) || (cell.match(/^\d+$/) && i > 1)) {
                if (repetitions === '10') {
                  repetitions = cell;
                  continue;
                }
              }
              
              // Qualquer outra coisa é nota/observação
              notes = notes ? `${notes} ${cell}` : cell;
            }
            
            const newExercise: Exercise = {
              id: `${currentCategory}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name,
              series: series,
              repetitions: repetitions,
              rest: rest,
              videoLink: videoLink,
              notes: notes,
              category: currentCategory
            };

            allExercises.push(newExercise);
            exerciseCount++;
            
            console.log(`Adicionado exercício "${newExercise.name}" ao Treino ${currentCategory}`);
          }
        }

        console.log(`Total de exercícios adicionados ao Treino ${currentCategory}: ${exerciseCount}`);
      }

      console.log(`Total de exercícios processados: ${allExercises.length}`);
      console.log('Exercícios por categoria:', {
        A: allExercises.filter(ex => ex.category === 'A').length,
        B: allExercises.filter(ex => ex.category === 'B').length,
        C: allExercises.filter(ex => ex.category === 'C').length,
        D: allExercises.filter(ex => ex.category === 'D').length,
        E: allExercises.filter(ex => ex.category === 'E').length,
      });

      if (allExercises.length > 0) {
        onImportExercises(allExercises);
        setSelectedFiles([]);
        alert(`${allExercises.length} exercícios importados com sucesso!`);
      } else {
        alert('Nenhum exercício válido foi encontrado nos arquivos.');
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
