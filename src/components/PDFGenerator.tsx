
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText } from "lucide-react";
import jsPDF from 'jspdf';
import { WorkoutSheet, BrandingConfig } from "@/types/workout";

interface PDFGeneratorProps {
  exercises: any[];
  branding: BrandingConfig;
}

const PDFGenerator = ({ exercises, branding }: PDFGeneratorProps) => {
  const [workoutData, setWorkoutData] = React.useState({
    title: 'Ficha de Treino',
    studentName: ''
  });

  const generatePDF = async () => {
    if (!workoutData.studentName.trim()) {
      alert('Por favor, insira o nome do aluno.');
      return;
    }

    if (exercises.length === 0) {
      alert('Adicione pelo menos um exercício antes de gerar o PDF.');
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 30;

    // Header com gradiente simulado
    pdf.setFillColor(59, 130, 246); // Blue
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    // Logo (se disponível)
    if (branding.logo) {
      try {
        pdf.addImage(branding.logo, 'JPEG', 15, 5, 15, 15);
      } catch (error) {
        console.log('Erro ao adicionar logo:', error);
      }
    }

    // Nome do studio
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(branding.studioName, branding.logo ? 35 : 15, 15);

    // Título da ficha
    yPosition = 45;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text(workoutData.title, pageWidth / 2, yPosition, { align: 'center' });

    // Nome do aluno
    yPosition += 20;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.text(`Aluno: ${workoutData.studentName}`, 15, yPosition);

    // Data
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 15, yPosition);

    // Linha separadora
    yPosition += 15;
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.line(15, yPosition, pageWidth - 15, yPosition);

    // Exercícios
    yPosition += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('EXERCÍCIOS', 15, yPosition);

    yPosition += 15;
    exercises.forEach((exercise, index) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 30;
      }

      // Número e nome do exercício
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(`${index + 1}. ${exercise.name}`, 15, yPosition);

      yPosition += 8;

      // Detalhes do exercício
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      
      const details = [];
      details.push(`Séries: ${exercise.series}`);
      details.push(`Repetições: ${exercise.repetitions}`);
      if (exercise.rest) details.push(`Pausa: ${exercise.rest}`);

      pdf.text(details.join(' | '), 20, yPosition);

      yPosition += 6;

      // Observações
      if (exercise.notes) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        const splitNotes = pdf.splitTextToSize(`Obs: ${exercise.notes}`, pageWidth - 40);
        pdf.text(splitNotes, 20, yPosition);
        yPosition += splitNotes.length * 4;
      }

      // Link do vídeo
      if (exercise.videoLink) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(59, 130, 246);
        pdf.text('📹 Link do vídeo disponível', 20, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 4;
      }

      yPosition += 10;

      // Linha separadora entre exercícios
      if (index < exercises.length - 1) {
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.line(15, yPosition, pageWidth - 15, yPosition);
        yPosition += 8;
      }
    });

    // Footer
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Gerado por ${branding.studioName} - Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    const fileName = `ficha-treino-${workoutData.studentName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
    pdf.save(fileName);
  };

  const canGenerate = exercises.length > 0 && workoutData.studentName.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gerar Ficha em PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Título da Ficha</Label>
            <Input
              id="title"
              value={workoutData.title}
              onChange={(e) => setWorkoutData({ ...workoutData, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="studentName">Nome do Aluno *</Label>
            <Input
              id="studentName"
              value={workoutData.studentName}
              onChange={(e) => setWorkoutData({ ...workoutData, studentName: e.target.value })}
              placeholder="Digite o nome do aluno"
              required
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-2">Preview da Ficha:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Studio:</strong> {branding.studioName}</p>
            <p><strong>Título:</strong> {workoutData.title}</p>
            <p><strong>Aluno:</strong> {workoutData.studentName || 'Nome do aluno'}</p>
            <p><strong>Exercícios:</strong> {exercises.length} exercise(s)</p>
            <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <Button
          onClick={generatePDF}
          disabled={!canGenerate}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
          size="lg"
        >
          <Download className="h-5 w-5 mr-2" />
          {canGenerate ? 'Gerar e Baixar PDF' : 'Complete os dados para gerar'}
        </Button>

        {!canGenerate && (
          <p className="text-sm text-muted-foreground text-center">
            {exercises.length === 0 
              ? 'Adicione exercícios e insira o nome do aluno para gerar o PDF'
              : 'Insira o nome do aluno para gerar o PDF'
            }
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFGenerator;
