
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Palette } from "lucide-react";
import { BrandingConfig } from "@/types/workout";

interface BrandingSettingsProps {
  branding: BrandingConfig;
  onUpdateBranding: (branding: BrandingConfig) => void;
}

const BrandingSettings = ({ branding, onUpdateBranding }: BrandingSettingsProps) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpdateBranding({ ...branding, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Personalização da Marca
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="studioName">Nome do Studio/Personal</Label>
          <Input
            id="studioName"
            value={branding.studioName}
            onChange={(e) => onUpdateBranding({ ...branding, studioName: e.target.value })}
            placeholder="PP Studio Personal"
          />
        </div>

        <div>
          <Label htmlFor="logo">Logo (opcional)</Label>
          <div className="flex items-center gap-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('logo-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Escolher Logo
            </Button>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            {branding.logo && (
              <div className="flex items-center gap-2">
                <img
                  src={branding.logo}
                  alt="Logo preview"
                  className="h-8 w-8 object-contain border rounded"
                />
                <span className="text-sm text-green-600">Logo carregada</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Formatos aceitos: PNG, JPG, SVG. Tamanho recomendado: 200x200px
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandingSettings;
