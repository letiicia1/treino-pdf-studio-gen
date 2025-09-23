
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Exercise, BrandingConfig } from "@/types/workout";

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
          exercise.videoLink ? { f: `=HYPERLINK("${exercise.videoLink}","Ver Vídeo")` } : '',
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
    
    // Save Excel file
    XLSX.writeFile(workbook, 'planilha-treino.xlsx');
  };

  const generatePDF = () => {
    if (categoriesWithExercises.length === 0) {
      alert('Adicione exercícios aos treinos primeiro.');
      return;
    }

    const doc = new jsPDF();
    let isFirstPage = true;

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

      // General instructions (only on the first page)
      if (category === categoriesWithExercises[0] && generalInstructions) {
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        
        doc.setFontSize(12);
        doc.setTextColor(25, 47, 89);
        doc.text('Orientações Gerais:', 20, finalY);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const splitText = doc.splitTextToSize(generalInstructions, 170);
        doc.text(splitText, 20, finalY + 8);
      }
    });

    // Save PDF
    const fileName = `ficha-treino-${weeklyFrequency}x-semana.pdf`;
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
