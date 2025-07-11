
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Download } from "lucide-react";
import { Exercise, BrandingConfig } from "@/types/workout";
import html2canvas from 'html2canvas';

interface ImageGeneratorProps {
  exercises: Exercise[];
  branding: BrandingConfig;
}

const ImageGenerator = ({ exercises, branding }: ImageGeneratorProps) => {
  const fichaRef = useRef<HTMLDivElement>(null);

  const generateImage = async () => {
    if (!fichaRef.current || exercises.length === 0) return;

    try {
      const canvas = await html2canvas(fichaRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `ficha-treino-${Date.now()}.png`;
      link.href = canvas.toDataURL();
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
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {categories.map((category) => (
            <div key={category} className="mb-8 page-break">
              {/* Header */}
              <div className="bg-[#192F59] text-white p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">{branding.studioName}</h1>
                <h2 className="text-lg font-semibold">FICHA DE TREINO</h2>
              </div>

              {/* Título do Treino */}
              <div className="text-center py-4">
                <h3 className="text-xl font-bold text-gray-800">TREINO {category}</h3>
              </div>

              {/* Tabela */}
              <div className="mx-4 mb-6">
                <table className="w-full border-collapse border-2 border-[#192F59]">
                  <thead>
                    <tr className="bg-[#192F59] text-white">
                      <th className="border border-[#192F59] p-3 text-left font-bold">EXERCÍCIO</th>
                      <th className="border border-[#192F59] p-3 text-left font-bold">VÍDEO</th>
                      <th className="border border-[#192F59] p-3 text-center font-bold">SÉRIES</th>
                      <th className="border border-[#192F59] p-3 text-center font-bold">REPS</th>
                      <th className="border border-[#192F59] p-3 text-center font-bold">PAUSA</th>
                      <th className="border border-[#192F59] p-3 text-left font-bold">OBSERVAÇÃO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercisesByCategory[category].map((exercise, index) => (
                      <tr key={exercise.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-300 p-3 font-medium">{exercise.name}</td>
                        <td className="border border-gray-300 p-3">
                          {exercise.videoLink ? (
                            <span className="text-blue-600 underline">Ver vídeo</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">{exercise.series}</td>
                        <td className="border border-gray-300 p-3 text-center">{exercise.repetitions}</td>
                        <td className="border border-gray-300 p-3 text-center">{exercise.rest || '-'}</td>
                        <td className="border border-gray-300 p-3">{exercise.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageGenerator;
