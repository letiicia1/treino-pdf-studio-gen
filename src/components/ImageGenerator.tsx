
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Image, Download } from "lucide-react";
import { Exercise, BrandingConfig } from "@/types/workout";
import html2canvas from 'html2canvas';

interface ImageGeneratorProps {
  exercises: Exercise[];
  branding: BrandingConfig;
}

const ImageGenerator = ({ exercises, branding }: ImageGeneratorProps) => {
  const fichaRef = useRef<HTMLDivElement>(null);
  const [generalInstructions, setGeneralInstructions] = React.useState('');

  const generateImage = async () => {
    if (!fichaRef.current || exercises.length === 0) return;

    try {
      const canvas = await html2canvas(fichaRef.current, {
        backgroundColor: '#ffffff',
        scale: 3, // Aumentado para melhor qualidade
        useCORS: true,
        allowTaint: true,
        height: fichaRef.current.scrollHeight,
        width: fichaRef.current.scrollWidth
      });

      const link = document.createElement('a');
      link.download = `fichaPPstudioPersonal-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
    }
  };

  // Group exercises by category
  const exercisesByCategory = exercises.reduce((acc, exercise) => {
    const category = exercise.category || 'A';
    if (!acc[category]) acc[category] = [];
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const categories = ['A', 'B', 'C', 'D', 'E'].filter(cat => exercisesByCategory[cat]?.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Gerar Ficha em Imagem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="image-instructions">Orientações Gerais (opcional)</Label>
          <Textarea
            id="image-instructions"
            value={generalInstructions}
            onChange={(e) => setGeneralInstructions(e.target.value)}
            placeholder="Adicione orientações gerais do treino..."
            rows={3}
          />
        </div>

        <Button
          onClick={generateImage}
          disabled={exercises.length === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          size="lg"
        >
          <Download className="h-5 w-5 mr-2" />
          {exercises.length > 0 ? 'Gerar e Baixar Imagem' : 'Adicione exercícios para gerar'}
        </Button>

        {/* Preview da Ficha */}
        <div 
          ref={fichaRef}
          className="bg-white border rounded-lg overflow-hidden"
          style={{ fontFamily: 'Arial, sans-serif', minWidth: '800px' }}
        >
          {categories.map((category) => (
            <div key={category} className="mb-8 page-break">
              {/* Header */}
              <div className="bg-[#192F59] text-white p-6 text-center">
                <h1 className="text-3xl font-bold mb-2">{branding.studioName}</h1>
                <h2 className="text-xl font-semibold">FICHA DE TREINO</h2>
              </div>

              {/* Título do Treino */}
              <div className="text-center py-6">
                <h3 className="text-2xl font-bold text-gray-800">TREINO {category}</h3>
              </div>

              {/* Tabela Completa */}
              <div className="mx-6 mb-6">
                <table className="w-full border-collapse border-2 border-[#192F59]">
                  <thead>
                    <tr className="bg-[#192F59] text-white">
                      <th className="border border-[#192F59] p-4 text-left font-bold text-sm">EXERCÍCIO</th>
                      <th className="border border-[#192F59] p-4 text-left font-bold text-sm">VÍDEO</th>
                      <th className="border border-[#192F59] p-4 text-center font-bold text-sm">SÉRIES</th>
                      <th className="border border-[#192F59] p-4 text-center font-bold text-sm">REPS</th>
                      <th className="border border-[#192F59] p-4 text-center font-bold text-sm">PAUSA</th>
                      <th className="border border-[#192F59] p-4 text-left font-bold text-sm">OBSERVAÇÃO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercisesByCategory[category].map((exercise, index) => (
                      <tr key={exercise.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-300 p-4 bg-[#192F59] text-white font-semibold text-sm">
                          {exercise.name}
                        </td>
                        <td className="border border-gray-300 p-4 text-sm">
                          {exercise.videoLink ? (
                            <a 
                              href={exercise.videoLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800 font-medium"
                            >
                              Ver vídeo
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="border border-gray-300 p-4 text-center font-semibold text-sm">
                          {exercise.series}
                        </td>
                        <td className="border border-gray-300 p-4 text-center font-semibold text-sm">
                          {exercise.repetitions}
                        </td>
                        <td className="border border-gray-300 p-4 text-center font-medium text-sm">
                          {exercise.rest || '-'}
                        </td>
                        <td className="border border-gray-300 p-4 text-sm">
                          {exercise.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Orientações Gerais */}
              {generalInstructions.trim() && (
                <div className="mx-6 mb-6 p-4 bg-gray-50 border border-gray-300 rounded">
                  <h4 className="font-bold text-lg mb-2 text-[#192F59]">ORIENTAÇÕES GERAIS:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {generalInstructions}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageGenerator;
