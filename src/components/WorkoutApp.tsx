
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, Clock, Repeat, Phone, Mail, MapPin, ShoppingBag } from "lucide-react";
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
          {appConfig?.logoUrl && (
            <img
              src={appConfig.logoUrl}
              alt="Logo"
              className="h-16 w-16 mx-auto mb-4 object-contain"
            />
          )}
          <h1 className="text-2xl font-bold">{studioName}</h1>
          <p className="opacity-90">Aplicativo de Treino</p>
          {appConfig?.welcomeMessage && (
            <p className="text-sm opacity-80 mt-2">{appConfig.welcomeMessage}</p>
          )}
          <Badge variant="secondary" className="mx-auto w-fit mt-2">
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

      {/* Lista de Exercícios */}
      <div className="space-y-3">
        {categoryExercises.map((exercise, index) => (
          <Card key={exercise.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div 
                  className="text-white p-4 flex items-center justify-center min-w-[60px]"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-lg font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 p-4">
                  <h3 className="font-semibold text-lg mb-2">{exercise.name}</h3>
                  
                  <div className="flex flex-wrap gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Repeat className="h-4 w-4" />
                      <span>{exercise.series} séries</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Play className="h-4 w-4" />
                      <span>{exercise.repetitions} reps</span>
                    </div>
                    {exercise.rest && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{exercise.rest}</span>
                      </div>
                    )}
                  </div>

                  {exercise.notes && (
                    <p className="text-sm text-gray-600 mb-3 italic">
                      {exercise.notes}
                    </p>
                  )}

                  {exercise.videoLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(exercise.videoLink, '_blank')}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Ver Vídeo
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
