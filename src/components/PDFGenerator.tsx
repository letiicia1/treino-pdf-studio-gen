
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Exercise, BrandingConfig } from "@/types/workout";

interface PDFGeneratorProps {
  exercises: Exercise[];
  branding: BrandingConfig;
}

const PDFGenerator = ({ exercises, branding }: PDFGeneratorProps) => {
  const [studentName, setStudentName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [generalInstructions, setGeneralInstructions] = useState('');

  const generatePDF = () => {
    const categoryExercises = exercises.filter(ex => ex.category === selectedCategory);
    
    if (categoryExercises.length === 0) {
      alert('Adicione exercícios ao treino selecionado primeiro.');
      return;
    }

    const doc = new jsPDF();
    
    // Faixa azul marinho no topo
    doc.setFillColor(25, 47, 89);
    doc.rect(0, 0, 210, 20, 'F');
    
    // Nome do estúdio centralizado na faixa
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    const studioNameWidth = doc.getTextWidth(branding.studioName);
    const centerX = (210 - studioNameWidth) / 2;
    doc.text(branding.studioName, centerX, 13);
    
    // Título FICHA DE TREINO centralizado
    doc.setFontSize(18);
    doc.setTextColor(25, 47, 89);
    const titleText = 'FICHA DE TREINO';
    const titleWidth = doc.getTextWidth(titleText);
    const titleCenterX = (210 - titleWidth) / 2;
    doc.text(titleText, titleCenterX, 32);
    
    let currentY = 45;
    
    // Nome do aluno centralizado (se fornecido)
    if (studentName) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const studentText = `Aluno: ${studentName}`;
      const studentWidth = doc.getTextWidth(studentText);
      const studentCenterX = (210 - studentWidth) / 2;
      doc.text(studentText, studentCenterX, currentY);
      currentY += 10;
    }
    
    // Categoria do treino centralizada
    doc.setFontSize(14);
    doc.setTextColor(25, 47, 89);
    const categoryText = `TREINO ${selectedCategory}`;
    const categoryWidth = doc.getTextWidth(categoryText);
    const categoryCenterX = (210 - categoryWidth) / 2;
    doc.text(categoryText, categoryCenterX, currentY);
    currentY += 10;

    // Preparar dados da tabela com links do vídeo
    const tableData = categoryExercises.map(exercise => {
      const exerciseName = exercise.name;
      const videoText = exercise.videoLink ? 'Ver Vídeo' : '';
      const exerciseCell = exercise.videoLink 
        ? `${exerciseName}\n${videoText}`
        : exerciseName;
      
      return [
        exerciseCell,
        exercise.series.toString(),
        exercise.repetitions,
        exercise.rest || '',
        exercise.notes || ''
      ];
    });

    // Gerar tabela usando autoTable
    autoTable(doc, {
      head: [['Exercício', 'Séries', 'Repetições', 'Pausa', 'Observações']],
      body: tableData,
      startY: currentY,
      styles: {
        fontSize: 11,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        valign: 'top',
        halign: 'left',
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [70, 130, 180],
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center',
        minCellHeight: 10
      },
      bodyStyles: {
        fillColor: [245, 245, 245],
        fontSize: 10,
        minCellHeight: 15
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      columnStyles: {
        0: { 
          cellWidth: 50,
          fillColor: [25, 47, 89],
          textColor: 255,
          fontStyle: 'bold'
        },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 45 }
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        // Adicionar links clicáveis para vídeos
        if (data.column.index === 0 && data.row.index >= 0) {
          const exercise = categoryExercises[data.row.index];
          if (exercise?.videoLink) {
            data.cell.styles.textColor = [0, 0, 255];
          }
        }
      },
      didDrawCell: function(data) {
        // Adicionar links clicáveis para os vídeos
        if (data.column.index === 0 && data.row.index >= 0) {
          const exercise = categoryExercises[data.row.index];
          if (exercise?.videoLink) {
            const linkY = data.cell.y + data.cell.height - 8;
            doc.link(data.cell.x, linkY - 3, data.cell.width, 6, {
              url: exercise.videoLink
            });
          }
        }
      }
    });

    // Orientações gerais
    if (generalInstructions) {
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(25, 47, 89);
      doc.text('Orientações Gerais:', 20, finalY);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const splitText = doc.splitTextToSize(generalInstructions, 170);
      doc.text(splitText, 20, finalY + 8);
    }

    // Salvar
    const fileName = `ficha-treino-${selectedCategory}${studentName ? `-${studentName.replace(/\s+/g, '-')}` : ''}.pdf`;
    doc.save(fileName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gerar PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="student-name">Nome do Aluno (opcional)</Label>
          <Input
            id="student-name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="João Silva"
          />
        </div>

        <div>
          <Label htmlFor="category">Categoria do Treino</Label>
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

        <Button onClick={generatePDF} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Gerar PDF
        </Button>

        <p className="text-xs text-muted-foreground">
          Exercícios do Treino {selectedCategory}: {exercises.filter(ex => ex.category === selectedCategory).length}
        </p>
      </CardContent>
    </Card>
  );
};

export default PDFGenerator;
