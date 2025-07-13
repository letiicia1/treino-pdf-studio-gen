
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  const [generalInstructions, setGeneralInstructions] = useState('');

  const generatePDF = () => {
    // Agrupar exercícios por categoria
    const exercisesByCategory = exercises.reduce((acc, exercise) => {
      const category = exercise.category || 'A';
      if (!acc[category]) acc[category] = [];
      acc[category].push(exercise);
      return acc;
    }, {} as Record<string, Exercise[]>);

    const categoriesWithExercises = Object.keys(exercisesByCategory).filter(
      category => exercisesByCategory[category].length > 0
    ).sort();

    if (categoriesWithExercises.length === 0) {
      alert('Adicione exercícios aos treinos primeiro.');
      return;
    }

    const doc = new jsPDF();
    let isFirstPage = true;

    // Gerar uma página para cada categoria
    categoriesWithExercises.forEach((category) => {
      const categoryExercises = exercisesByCategory[category];
      
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

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
      const categoryText = `TREINO ${category}`;
      const categoryWidth = doc.getTextWidth(categoryText);
      const categoryCenterX = (210 - categoryWidth) / 2;
      doc.text(categoryText, categoryCenterX, currentY);
      currentY += 10;

      // Preparar dados da tabela
      const tableData = categoryExercises.map(exercise => [
        exercise.name,
        exercise.videoLink ? 'Ver Vídeo' : '',
        exercise.series.toString(),
        exercise.repetitions,
        exercise.rest || '',
        exercise.notes || ''
      ]);

      // Gerar tabela usando autoTable
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
          // Adicionar links clicáveis para os vídeos
          if (data.column.index === 1 && data.row.index >= 0) {
            const exercise = categoryExercises[data.row.index];
            if (exercise?.videoLink && data.cell.text[0] === 'Ver Vídeo') {
              doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
                url: exercise.videoLink
              });
            }
          }
        }
      });

      // Orientações gerais (apenas na primeira página)
      if (generalInstructions && category === categoriesWithExercises[0]) {
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

    // Salvar
    const fileName = `ficha-treino${studentName ? `-${studentName.replace(/\s+/g, '-')}` : ''}.pdf`;
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
          <Label htmlFor="general-instructions">Orientações Gerais (opcional)</Label>
          <Textarea
            id="general-instructions"
            value={generalInstructions}
            onChange={(e) => setGeneralInstructions(e.target.value)}
            placeholder="Orientações gerais do treino, como aquecimento, alongamento, etc."
            rows={3}
          />
        </div>

        <Button onClick={generatePDF} className="w-full" disabled={exercises.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          {exercises.length === 0 ? 'Adicione exercícios primeiro' : 'Gerar PDF'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PDFGenerator;
