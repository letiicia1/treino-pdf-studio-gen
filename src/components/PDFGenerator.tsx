
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
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(25, 47, 89);
    doc.text(branding.studioName, 20, 25);
    
    doc.setFontSize(16);
    doc.text('FICHA DE TREINO', 20, 35);
    
    if (studentName) {
      doc.setFontSize(12);
      doc.text(`Aluno: ${studentName}`, 20, 45);
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`TREINO ${selectedCategory}`, 20, studentName ? 52 : 42);

    // Table data
    const tableData = categoryExercises.map(exercise => [
      exercise.name,
      exercise.videoLink || '',
      exercise.series.toString(),
      exercise.repetitions,
      exercise.rest || '',
      exercise.notes || ''
    ]);

    // Generate table using autoTable
    autoTable(doc, {
      head: [['Exercício', 'Vídeo', 'Séries', 'Repetições', 'Pausa', 'Observações']],
      body: tableData,
      startY: studentName ? 60 : 50,
      styles: {
        fontSize: 12,
        cellPadding: 6,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
        valign: 'middle',
        halign: 'left'
      },
      headStyles: {
        fillColor: [70, 130, 180], // Azul mais claro para cabeçalho
        textColor: 255,
        fontSize: 13,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fillColor: [245, 245, 245],
        fontSize: 11
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      columnStyles: {
        0: { 
          cellWidth: 35,
          fillColor: [25, 47, 89], // Azul marinho para nomes dos exercícios
          textColor: 255,
          fontStyle: 'bold'
        },
        1: { cellWidth: 30 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 35 }
      },
      margin: { left: 15, right: 15 }
    });

    // General instructions
    if (generalInstructions) {
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(12);
      doc.setTextColor(25, 47, 89);
      doc.text('Orientações Gerais:', 20, finalY);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const splitText = doc.splitTextToSize(generalInstructions, 170);
      doc.text(splitText, 20, finalY + 10);
    }

    // Save
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
