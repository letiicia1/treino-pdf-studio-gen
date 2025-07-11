
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, Clock, Repeat, Phone, Mail, MapPin, ShoppingBag, Dumbbell } from "lucide-react";
import { Exercise, BrandingConfig } from "@/types/workout";

interface WorkoutAppProps {
  exercises: Exercise[];
  branding: BrandingConfig;
  selectedCategory: string;
  appConfig?: {
    logoUrl: string;
    studioName: string;
    primaryColor: string;
    backgroundColor: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    storeLink: string;
    welcomeMessage: string;
  };
}

const WorkoutApp = ({ exercises, branding, selectedCategory, appConfig }: WorkoutAppProps) => {
  const categoryExercises = exercises.filter(ex => ex.category === selectedCategory);

  const getPublicLink = () => {
    const currentUrl = window.location.origin;
    const params = new URLSearchParams({
      studio: appConfig?.studioName || branding.studioName,
      category: selectedCategory,
      exercises: JSON.stringify(categoryExercises)
    });
    return `${currentUrl}/treino?${params.toString()}`;
  };

  const copyPublicLink = () => {
    const link = getPublicLink();
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const primaryColor = appConfig?.primaryColor || '#192F59';
  const studioName = appConfig?.studioName || branding.studioName;

  if (categoryExercises.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Adicione exercícios ao Treino {selectedCategory} para visualizar o aplicativo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header do App Personalizado */}
      <Card 
        className="text-white"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
          backgroundColor: appConfig?.backgroundColor || '#f8fafc'
        }}
      >
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {appConfig?.logoUrl ? (
              <img
                src={appConfig.logoUrl}
                alt="Logo"
                className="h-16 w-16 object-contain"
              />
            ) : (
              <Dumbbell className="h-16 w-16" />
            )}
            <div>
              <h1 className="text-2xl font-bold">{studioName}</h1>
              <p className="opacity-90 text-sm">Aplicativo de Treino</p>
            </div>
          </div>
          
          {appConfig?.welcomeMessage && (
            <p className="text-sm opacity-80 mb-3">{appConfig.welcomeMessage}</p>
          )}
          <Badge variant="secondary" className="mx-auto w-fit">
            TREINO {selectedCategory}
          </Badge>
        </CardHeader>
      </Card>

      {/* Botões de Ação */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={copyPublicLink}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Copiar Link Público do Treino
        </Button>

        {/* Contatos */}
        {appConfig && (
          <div className="grid grid-cols-2 gap-2">
            {appConfig.contactPhone && (
              <Button
                variant="outline"
                onClick={() => window.open(`https://wa.me/${appConfig.contactPhone.replace(/\D/g, '')}`, '_blank')}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Phone className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
            )}
            
            {appConfig.storeLink && (
              <Button
                variant="outline"
                onClick={() => window.open(appConfig.storeLink, '_blank')}
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                <ShoppingBag className="h-4 w-4 mr-1" />
                Loja
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Lista de Exercícios com Vídeos Integrados */}
      <div className="space-y-4">
        {categoryExercises.map((exercise, index) => {
          const videoId = exercise.videoLink ? getYouTubeVideoId(exercise.videoLink) : null;
          
          return (
            <Card key={exercise.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header do Exercício */}
                <div 
                  className="text-white p-4 flex items-center justify-between"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-lg">{exercise.name}</h3>
                  </div>
                </div>

                <div className="p-4">
                  {/* Vídeo do YouTube Integrado */}
                  {videoId && (
                    <div className="mb-4">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={exercise.name}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Informações do Exercício */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700 mb-1">
                        <Repeat className="h-4 w-4" />
                        <span>Séries</span>
                      </div>
                      <div className="text-xl font-bold" style={{ color: primaryColor }}>
                        {exercise.series}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700 mb-1">
                        <Play className="h-4 w-4" />
                        <span>Repetições</span>
                      </div>
                      <div className="text-xl font-bold" style={{ color: primaryColor }}>
                        {exercise.repetitions}
                      </div>
                    </div>
                    
                    {exercise.rest && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700 mb-1">
                          <Clock className="h-4 w-4" />
                          <span>Pausa</span>
                        </div>
                        <div className="text-lg font-bold" style={{ color: primaryColor }}>
                          {exercise.rest}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Observações */}
                  {exercise.notes && (
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4" style={{ borderLeftColor: primaryColor }}>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Observações:</h4>
                      <p className="text-sm text-gray-600">{exercise.notes}</p>
                    </div>
                  )}

                  {/* Link do Vídeo como Botão Alternativo */}
                  {exercise.videoLink && !videoId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(exercise.videoLink, '_blank')}
                      className="w-full mt-3"
                      style={{ color: primaryColor, borderColor: primaryColor }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Assistir Vídeo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer com Informações */}
      {appConfig && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold">{studioName}</p>
              {appConfig.address && (
                <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {appConfig.address}
                </p>
              )}
              {appConfig.contactEmail && (
                <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                  <Mail className="h-3 w-3" />
                  {appConfig.contactEmail}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">💪 Bom treino!</p>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Compartilhe o link público com seus alunos para acesso direto ao treino
      </p>
    </div>
  );
};

export default WorkoutApp;
