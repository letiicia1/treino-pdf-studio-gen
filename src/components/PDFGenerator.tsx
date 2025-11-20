
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Download, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Exercise, BrandingConfig } from "@/types/workout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PDFGeneratorProps {
  exercises: Exercise[];
  branding: BrandingConfig;
  weeklyFrequency?: number;
  onWeeklyFrequencyChange?: (frequency: number) => void;
  onDownload?: () => void;
  onClearExercises?: () => void;
}

const PDFGenerator = ({ exercises, branding, weeklyFrequency = 3, onWeeklyFrequencyChange, onDownload, onClearExercises }: PDFGeneratorProps) => {
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [studentName, setStudentName] = useState('');
  const [level, setLevel] = useState<'iniciante' | 'intermediario' | 'avancado' | ''>('');
  const [subLevel, setSubLevel] = useState<'1' | '2' | '3' | ''>('');
  const [levelComplement, setLevelComplement] = useState('');

  // Count exercises by category
  const exercisesByCategory = exercises.reduce((acc, exercise) => {
    const category = exercise.category || 'A';
    if (!acc[category]) acc[category] = [];
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const categoriesWithExercises = Object.keys(exercisesByCategory).filter(
    category => exercisesByCategory[category].length > 0
  ).sort();

  const generateExcel = () => {
    // Create Excel workbook
    const workbook = XLSX.utils.book_new();
    
    // Add Orientações sheet if there are general instructions
    if (generalInstructions) {
      const orientacoesData: any[] = [
        ['Orientações Gerais'],
        [''],
        [generalInstructions]
      ];
      
      const orientacoesSheet = XLSX.utils.aoa_to_sheet(orientacoesData);
      
      // Set column width
      orientacoesSheet['!cols'] = [{ width: 100 }];
      
      // Add as first sheet
      XLSX.utils.book_append_sheet(workbook, orientacoesSheet, 'Orientações');
    }
    
    // Create a separate worksheet for each category
    categoriesWithExercises.forEach((category) => {
      const categoryExercises = exercisesByCategory[category];
      
      // Prepare data for this category
      const excelData: any[] = [];
      
      // Add header row
      excelData.push(['#', 'Exercício', 'Link do Vídeo', 'Série', 'Repetição', 'Pausa', 'Observação']);
      
      // Add exercises data with numbering
      categoryExercises.forEach((exercise, index) => {
        excelData.push([
          index + 1, // Exercise number
          exercise.name,
          exercise.videoLink || '', // Direct link, not hyperlink
          exercise.series.toString(),
          exercise.repetitions,
          exercise.rest || '',
          exercise.notes || ''
        ]);
      });
      
      // Create worksheet for this category
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);
      
      // Set column widths
      worksheet['!cols'] = [
        { width: 5 },   // #
        { width: 40 },  // Exercício
        { width: 50 },  // Link do Vídeo
        { width: 10 },  // Série
        { width: 15 },  // Repetição
        { width: 15 },  // Pausa
        { width: 30 }   // Observação
      ];
      
      // Add worksheet to workbook with category name
      XLSX.utils.book_append_sheet(workbook, worksheet, `Treino ${category}`);
    });
    
    // Generate filename based on level, sublevel, frequency and complement
    const levelText = level ? level.charAt(0).toUpperCase() + level.slice(1) : '';
    const subLevelText = subLevel ? ` Nível ${subLevel}` : '';
    const frequencyText = `${weeklyFrequency}x`;
    const complementText = levelComplement ? `-${levelComplement}` : '';
    const fileName = `${levelText}${subLevelText}-${frequencyText}${complementText}.xlsx`;
    
    // Save Excel file
    XLSX.writeFile(workbook, fileName);
  };

  const saveExercisesToDatabase = async () => {
    try {
      // TODO: Descomentar quando a tabela exercise_database for criada no Supabase
      // Preparar dados dos exercícios para salvar
      const exercisesToSave = exercises.map(exercise => ({
        name: exercise.name,
        video_link: exercise.videoLink || null,
        series: exercise.series,
        repetitions: exercise.repetitions,
        rest: exercise.rest || null,
        notes: exercise.notes || null,
        category: exercise.category
      }));

      console.log('Exercícios prontos para salvar:', exercisesToSave);
      toast.info('Base de dados será ativada quando o servidor Supabase estiver disponível');
      
      // Descomentar quando a tabela for criada:
      // const { error } = await supabase
      //   .from('exercise_database')
      //   .insert(exercisesToSave);
      // 
      // if (error) {
      //   console.error('Erro ao salvar exercícios:', error);
      //   toast.error('Erro ao salvar exercícios na base de dados');
      // } else {
      //   toast.success(`${exercisesToSave.length} exercícios salvos na base de dados`);
      // }
    } catch (error) {
      console.error('Erro ao salvar exercícios:', error);
    }
  };

  const generatePDF = async () => {
    if (categoriesWithExercises.length === 0) {
      alert('Adicione exercícios aos treinos primeiro.');
      return;
    }

    // Salvar exercícios na base de dados automaticamente
    await saveExercisesToDatabase();

    const doc = new jsPDF();
    let isFirstPage = true;

    // Add general instructions page if provided
    if (generalInstructions) {
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
      
      // Orientações Gerais title
      doc.setFontSize(18);
      doc.setTextColor(25, 47, 89);
      const titleText = 'Orientações Gerais';
      const titleWidth = doc.getTextWidth(titleText);
      const titleCenterX = (210 - titleWidth) / 2;
      doc.text(titleText, titleCenterX, 40);
      
      // Instructions text
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const splitText = doc.splitTextToSize(generalInstructions, 170);
      doc.text(splitText, 20, 60);
      
      // Add page break after instructions
      doc.addPage();
      isFirstPage = true;
    }

    // Generate a page for each category that has exercises
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
      
      // Centered WORKOUT SHEET title
      doc.setFontSize(18);
      doc.setTextColor(25, 47, 89);
      const titleText = 'FICHA DE TREINO';
      const titleWidth = doc.getTextWidth(titleText);
      const titleCenterX = (210 - titleWidth) / 2;
      doc.text(titleText, titleCenterX, 32);
      
      // Weekly frequency below title
      doc.setFontSize(12);
      const frequencyText = `${weeklyFrequency}x por semana`;
      const frequencyWidth = doc.getTextWidth(frequencyText);
      const frequencyCenterX = (210 - frequencyWidth) / 2;
      doc.text(frequencyText, frequencyCenterX, 42);
      
      let currentY = 60;
      
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
        didDrawCell: function(data) {
          // Add clickable links for videos
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
    const fileName = `Ficha de treino ${weeklyFrequency}x.pdf`;
    doc.save(fileName);
    
    // Generate Excel file
    generateExcel();
    
    // Clear exercises after generating files
    if (onClearExercises) {
      onClearExercises();
    }
    
    // Clear general instructions
    setGeneralInstructions('');
    
    if (onDownload) {
      onDownload();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gerar PDF Completo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exercise summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Exercícios Adicionados:</h4>
          {categoriesWithExercises.length > 0 ? (
            <div className="grid grid-cols-5 gap-2 text-sm">
              {['A', 'B', 'C', 'D', 'E'].map(category => (
                <div key={category} className={`text-center p-2 rounded ${
                  exercisesByCategory[category]?.length > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <div className="font-semibold">Treino {category}</div>
                  <div>{exercisesByCategory[category]?.length || 0} exercícios</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nenhum exercício adicionado ainda</p>
          )}
        </div>

        <div>
          <Label htmlFor="weekly-frequency">Frequência Semanal</Label>
          <Select 
            value={weeklyFrequency.toString()} 
            onValueChange={(value) => onWeeklyFrequencyChange?.(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a frequência" />
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
          <Label htmlFor="general-instructions">Orientações Gerais (opcional)</Label>
          <Textarea
            id="general-instructions"
            value={generalInstructions}
            onChange={(e) => setGeneralInstructions(e.target.value)}
            placeholder="Orientações gerais do treino, como aquecimento, alongamento, etc."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Button 
            onClick={generatePDF} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
            disabled={exercises.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {exercises.length === 0 ? 'Adicione exercícios primeiro' : `Gerar PDF Completo (${categoriesWithExercises.length} treinos)`}
          </Button>
        </div>

        {/* Área de Cadastro para Salvar Treino */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Salvar Treino Pronto</CardTitle>
            <p className="text-sm text-muted-foreground">Salve o treino atual para reutilizar depois</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="student-name">Nome do Aluno</Label>
              <input
                id="student-name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Nível</Label>
                <Select value={level} onValueChange={(value: any) => setLevel(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sub-level">Número do Nível</Label>
                <Select value={subLevel} onValueChange={(value: any) => setSubLevel(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="1, 2 ou 3" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="level-complement">Complemento do Nível (opcional)</Label>
              <input
                id="level-complement"
                type="text"
                value={levelComplement}
                onChange={(e) => setLevelComplement(e.target.value)}
                placeholder="Ex: Foco em membros superiores"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">

          {exercises.length > 0 && onClearExercises && (
            <Button 
              onClick={onClearExercises} 
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Todos os Exercícios
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFGenerator;
