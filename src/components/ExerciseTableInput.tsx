import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, TableIcon, Download, FileSpreadsheet } from "lucide-react";
import { Exercise } from "@/types/workout";
import { separateExerciseNameAndLink } from "@/lib/utils";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExerciseTableInputProps {
  onImportExercises: (exercises: Exercise[]) => void;
}

interface TableRow {
  id: string;
  name: string;
  videoLink: string;
  series: string;
  repetitions: string;
  rest: string;
  notes: string;
}

const ExerciseTableInput = ({ onImportExercises }: ExerciseTableInputProps) => {
  const [selectedCategory, setSelectedCategory] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [rows, setRows] = useState<TableRow[]>(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: `row-${i}`,
      name: '',
      videoLink: '',
      series: '',
      repetitions: '',
      rest: '',
      notes: ''
    }))
  );

  const handleCellChange = (rowId: string, field: keyof TableRow, value: string) => {
    setRows(prevRows => 
      prevRows.map(row => 
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  const handlePaste = (e: React.ClipboardEvent, rowIndex: number, field: keyof TableRow) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Detectar se é uma colagem de múltiplas células (tabs e quebras de linha)
    if (pastedData.includes('\t') || pastedData.includes('\n')) {
      const lines = pastedData.split('\n').filter(line => line.trim());
      const newRows = [...rows];
      
      lines.forEach((line, lineIndex) => {
        const targetRowIndex = rowIndex + lineIndex;
        if (targetRowIndex >= newRows.length) {
          // Adicionar nova linha se necessário
          newRows.push({
            id: `row-${Date.now()}-${lineIndex}`,
            name: '',
            videoLink: '',
            series: '',
            repetitions: '',
            rest: '',
            notes: ''
          });
        }
        
        const cells = line.split('\t');
        const targetRow = newRows[targetRowIndex];
        
        // Determinar a partir de qual coluna começar
        const fieldOrder: (keyof TableRow)[] = ['name', 'videoLink', 'series', 'repetitions', 'rest', 'notes'];
        const startFieldIndex = fieldOrder.indexOf(field);
        
        cells.forEach((cell, cellIndex) => {
          const targetField = fieldOrder[startFieldIndex + cellIndex];
          if (targetField && targetField !== 'id') {
            // Processar o nome do exercício para separar link se necessário
            if (targetField === 'name' && cell.trim()) {
              const { name, videoLink } = separateExerciseNameAndLink(cell.trim());
              targetRow.name = name;
              if (videoLink && !targetRow.videoLink) {
                targetRow.videoLink = videoLink;
              }
            } else {
              targetRow[targetField] = cell.trim();
            }
          }
        });
      });
      
      setRows(newRows);
    } else {
      // Colagem simples em uma célula
      handleCellChange(rows[rowIndex].id, field, pastedData);
    }
  };

  const addMoreRows = () => {
    const newRows = Array.from({ length: 10 }, (_, i) => ({
      id: `row-${Date.now()}-${i}`,
      name: '',
      videoLink: '',
      series: '',
      repetitions: '',
      rest: '',
      notes: ''
    }));
    setRows([...rows, ...newRows]);
  };

  const clearTable = () => {
    setRows(Array.from({ length: 20 }, (_, i) => ({
      id: `row-${i}`,
      name: '',
      videoLink: '',
      series: '',
      repetitions: '',
      rest: '',
      notes: ''
    })));
  };

  const handleImport = () => {
    const exercises: Exercise[] = rows
      .filter(row => row.name.trim())
      .map(row => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: row.name.trim(),
        series: row.series ? parseInt(row.series) || 0 : 0,
        repetitions: row.repetitions.trim(),
        rest: row.rest.trim(),
        videoLink: row.videoLink.trim(),
        notes: row.notes.trim(),
        category: selectedCategory
      }));

    if (exercises.length > 0) {
      onImportExercises(exercises);
      clearTable();
    }
  };

  const filledRowsCount = rows.filter(row => row.name.trim()).length;

  const exportToExcel = () => {
    const filledRows = rows.filter(row => row.name.trim());
    
    if (filledRows.length === 0) {
      alert('Nenhum exercício para exportar!');
      return;
    }

    const excelData = filledRows.map((row, index) => ({
      '#': index + 1,
      'Exercício': row.name,
      'Vídeo': row.videoLink,
      'Séries': row.series,
      'Repetições': row.repetitions,
      'Pausa': row.rest,
      'Observações': row.notes
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Treino ${selectedCategory}`);
    
    XLSX.writeFile(workbook, `Treino_${selectedCategory}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const filledRows = rows.filter(row => row.name.trim());
    
    if (filledRows.length === 0) {
      alert('Nenhum exercício para exportar!');
      return;
    }

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text(`Treino ${selectedCategory}`, 14, 20);
    
    // Preparar dados para a tabela
    const tableData = filledRows.map((row, index) => [
      index + 1,
      row.name,
      row.series,
      row.repetitions,
      row.rest,
      row.notes
    ]);

    // Gerar tabela
    autoTable(doc, {
      startY: 30,
      head: [['#', 'Exercício', 'Séries', 'Repetições', 'Pausa', 'Observações']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 50 }
      }
    });

    doc.save(`Treino_${selectedCategory}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Como usar a tabela:</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Selecione a categoria do treino (A, B, C, D ou E)</li>
          <li>2. Cole os dados diretamente do Excel/Sheets na primeira célula</li>
          <li>3. Os dados serão automaticamente distribuídos nas colunas</li>
          <li>4. Clique em "Adicionar ao PDF" quando terminar</li>
        </ol>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Tabela de Exercícios - Treino {selectedCategory}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Categoria do Treino</label>
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
          </div>

          <div className="border rounded-lg overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead className="min-w-[200px]">EXERCÍCIO</TableHead>
                  <TableHead className="min-w-[200px]">VÍDEO</TableHead>
                  <TableHead className="w-[100px]">SÉRIES</TableHead>
                  <TableHead className="w-[120px]">REPETIÇÃO</TableHead>
                  <TableHead className="w-[100px]">PAUSA</TableHead>
                  <TableHead className="min-w-[150px]">OBSERVAÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => handleCellChange(row.id, 'name', e.target.value)}
                        onPaste={(e) => handlePaste(e, index, 'name')}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-primary rounded"
                        placeholder="Nome do exercício"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={row.videoLink}
                        onChange={(e) => handleCellChange(row.id, 'videoLink', e.target.value)}
                        onPaste={(e) => handlePaste(e, index, 'videoLink')}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-primary rounded text-xs"
                        placeholder="Link do vídeo"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={row.series}
                        onChange={(e) => handleCellChange(row.id, 'series', e.target.value)}
                        onPaste={(e) => handlePaste(e, index, 'series')}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-primary rounded text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={row.repetitions}
                        onChange={(e) => handleCellChange(row.id, 'repetitions', e.target.value)}
                        onPaste={(e) => handlePaste(e, index, 'repetitions')}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-primary rounded text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={row.rest}
                        onChange={(e) => handleCellChange(row.id, 'rest', e.target.value)}
                        onPaste={(e) => handlePaste(e, index, 'rest')}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-primary rounded text-center"
                        placeholder="0s"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => handleCellChange(row.id, 'notes', e.target.value)}
                        onPaste={(e) => handlePaste(e, index, 'notes')}
                        className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-1 focus:ring-primary rounded"
                        placeholder="Observações"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={addMoreRows} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar mais linhas
            </Button>
            <Button onClick={clearTable} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar tabela
            </Button>
            <Button 
              onClick={exportToExcel} 
              variant="outline" 
              disabled={filledRowsCount === 0}
              className="bg-green-50 hover:bg-green-100"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar para Excel
            </Button>
            <Button 
              onClick={exportToPDF} 
              variant="outline" 
              disabled={filledRowsCount === 0}
              className="bg-red-50 hover:bg-red-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar para PDF
            </Button>
          </div>

          {filledRowsCount > 0 && (
            <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
              <p className="font-medium">Pré-visualização:</p>
              <p>{filledRowsCount} exercícios serão adicionados ao <strong>Treino {selectedCategory}</strong></p>
            </div>
          )}

          <Button 
            onClick={handleImport} 
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            disabled={filledRowsCount === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar ao PDF - Treino {selectedCategory} {filledRowsCount > 0 ? `(${filledRowsCount} exercícios)` : ''}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseTableInput;
