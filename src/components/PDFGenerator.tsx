
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, FileText } from "lucide-react";
import jsPDF from 'jspdf';
import { BrandingConfig } from "@/types/workout";

interface PDFGeneratorProps {
  exercises: any[];
  branding: BrandingConfig;
}

const PDFGenerator = ({ exercises, branding }: PDFGeneratorProps) => {
  const [workoutData, setWorkoutData] = React.useState({
    title: 'Ficha de Treino',
    generalInstructions: ''
  });

  const generatePDF = async () => {
    if (exercises.length === 0) {
      alert('Adicione pelo menos um exercício antes de gerar o PDF.');
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    // Group exercises by category
    const exercisesByCategory = exercises.reduce((acc, exercise) => {
      const category = exercise.category || 'A';
      if (!acc[category]) acc[category] = [];
      acc[category].push(exercise);
      return acc;
    }, {} as Record<string, any[]>);

    const categories = ['A', 'B', 'C', 'D', 'E'].filter(cat => exercisesByCategory[cat]?.length > 0);
    
    categories.forEach((category, pageIndex) => {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      let yPosition = 20;

      // Header azul marinho
      pdf.setFillColor(25, 47, 89); // Azul marinho
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      // Logo (se disponível)
      if (branding.logo) {
        try {
          pdf.addImage(branding.logo, 'JPEG', 15, 5, 20, 20);
        } catch (error) {
          console.log('Erro ao adicionar logo:', error);
        }
      }

      // Nome do studio centralizado
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text(branding.studioName, pageWidth / 2, 18, { align: 'center' });

      // Título FICHA DE TREINO centralizado
      yPosition = 45;
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('FICHA DE TREINO', pageWidth / 2, yPosition, { align: 'center' });

      // Título do treino centralizado
      yPosition = 65;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text(`TREINO ${category}`, pageWidth / 2, yPosition, { align: 'center' });

      // Preparar tabela
      yPosition = 85;
      const tableStartX = 15;
      const tableWidth = pageWidth - 30;
      const colWidths = [tableWidth * 0.25, tableWidth * 0.15, tableWidth * 0.08, tableWidth * 0.08, tableWidth * 0.08, tableWidth * 0.18, tableWidth * 0.18];
      const rowHeight = 12;

      // Header da tabela
      pdf.setFillColor(25, 47, 89); // Azul marinho
      pdf.rect(tableStartX, yPosition, tableWidth, rowHeight, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      
      let currentX = tableStartX + 2;
      pdf.text('EXERCÍCIO', currentX, yPosition + 8);
      currentX += colWidths[0];
      pdf.text('VÍDEO', currentX, yPosition + 8);
      currentX += colWidths[1];
      pdf.text('SÉRIES', currentX, yPosition + 8);
      currentX += colWidths[2];
      pdf.text('REPS', currentX, yPosition + 8);
      currentX += colWidths[3];
      pdf.text('PAUSA', currentX, yPosition + 8);
      currentX += colWidths[4];
      pdf.text('OBSERVAÇÃO', currentX, yPosition + 8);

      yPosition += rowHeight;

      // Linhas da tabela
      exercisesByCategory[category].forEach((exercise, index) => {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 30;
        }

        // Fundo azul marinho para nome do exercício
        pdf.setFillColor(25, 47, 89);
        pdf.rect(tableStartX, yPosition, colWidths[0], rowHeight, 'F');

        // Fundo alternado para as outras colunas
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(tableStartX + colWidths[0], yPosition, tableWidth - colWidths[0], rowHeight, 'F');
        }

        currentX = tableStartX + 2;
        
        // Nome do exercício com texto branco
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        const exerciseName = pdf.splitTextToSize(exercise.name, colWidths[0] - 4);
        pdf.text(exerciseName[0], currentX, yPosition + 8);
        
        currentX += colWidths[0];
        
        // Resetar cor para preto para outras colunas
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        // Link do vídeo clicável
        if (exercise.videoLink) {
          pdf.setTextColor(59, 130, 246);
          pdf.textWithLink('Ver vídeo', currentX, yPosition + 8, { url: exercise.videoLink });
          pdf.setTextColor(0, 0, 0);
        } else {
          pdf.text('-', currentX, yPosition + 8);
        }
        
        currentX += colWidths[1];
        
        // Séries
        pdf.text(String(exercise.series), currentX, yPosition + 8);
        
        currentX += colWidths[2];
        
        // Repetições
        pdf.text(exercise.repetitions, currentX, yPosition + 8);

        currentX += colWidths[3];
        
        // Pausa
        pdf.text(exercise.rest || '-', currentX, yPosition + 8);

        currentX += colWidths[4];
        
        // Observações
        const notes = pdf.splitTextToSize(exercise.notes || '-', colWidths[5] - 4);
        pdf.text(notes[0], currentX, yPosition + 8);

        // Linha de separação
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.line(tableStartX, yPosition + rowHeight, tableStartX + tableWidth, yPosition + rowHeight);

        yPosition += rowHeight;
      });

      // Orientações gerais (se houver)
      if (workoutData.generalInstructions.trim()) {
        yPosition += 10;
        
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 30;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('ORIENTAÇÕES GERAIS:', tableStartX, yPosition);
        
        yPosition += 10;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const instructions = pdf.splitTextToSize(workoutData.generalInstructions, tableWidth);
        pdf.text(instructions, tableStartX, yPosition);
      }

      // Borda da tabela
      pdf.setDrawColor(25, 47, 89);
      pdf.setLineWidth(1);
      pdf.rect(tableStartX, 85, tableWidth, yPosition - 85 - (workoutData.generalInstructions.trim() ? 30 : 0));
    });

    const fileName = `fichaPPstudioPersonal-${Date.now()}.pdf`;
    pdf.save(fileName);
  };

  const canGenerate = exercises.length > 0;

  // Count exercises by category
  const exercisesByCategory = exercises.reduce((acc, exercise) => {
    const category = exercise.category || 'A';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gerar Ficha em PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Título da Ficha</Label>
          <Input
            id="title"
            value={workoutData.title}
            onChange={(e) => setWorkoutData({ ...workoutData, title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="instructions">Orientações Gerais (opcional)</Label>
          <Textarea
            id="instructions"
            value={workoutData.generalInstructions}
            onChange={(e) => setWorkoutData({ ...workoutData, generalInstructions: e.target.value })}
            placeholder="Adicione orientações gerais do treino..."
            rows={3}
          />
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-2">Preview da Ficha:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Studio:</strong> {branding.studioName}</p>
            <p><strong>Total de exercícios:</strong> {exercises.length}</p>
            {Object.entries(exercisesByCategory).map(([category, count]) => (
              <p key={category}><strong>Treino {category}:</strong> {count} exercício(s)</p>
            ))}
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
          {canGenerate ? 'Gerar e Baixar PDF' : 'Adicione exercícios para gerar'}
        </Button>

        {!canGenerate && (
          <p className="text-sm text-muted-foreground text-center">
            Adicione exercícios para gerar o PDF
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFGenerator;
