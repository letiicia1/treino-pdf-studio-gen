
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Palette, Phone, Mail, MapPin, ShoppingBag } from "lucide-react";

interface AppCustomizationProps {
  appConfig: {
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
  onUpdateConfig: (config: any) => void;
}

const AppCustomization = ({ appConfig, onUpdateConfig }: AppCustomizationProps) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpdateConfig({ ...appConfig, logoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Personalização do Aplicativo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo */}
        <div>
          <Label htmlFor="app-logo">Logo do Aplicativo</Label>
          <div className="flex items-center gap-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('app-logo-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Escolher Logo
            </Button>
            <input
              id="app-logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            {appConfig.logoUrl && (
              <div className="flex items-center gap-2">
                <img
                  src={appConfig.logoUrl}
                  alt="Logo preview"
                  className="h-12 w-12 object-contain border rounded"
                />
                <span className="text-sm text-green-600">Logo carregada</span>
              </div>
            )}
          </div>
        </div>

        {/* Nome da Academia */}
        <div>
          <Label htmlFor="app-studio-name">Nome da Academia/Studio</Label>
          <Input
            id="app-studio-name"
            value={appConfig.studioName}
            onChange={(e) => onUpdateConfig({ ...appConfig, studioName: e.target.value })}
            placeholder="PP Studio Personal"
          />
        </div>

        {/* Cores */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primary-color">Cor Principal</Label>
            <Input
              id="primary-color"
              type="color"
              value={appConfig.primaryColor}
              onChange={(e) => onUpdateConfig({ ...appConfig, primaryColor: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="bg-color">Cor de Fundo</Label>
            <Input
              id="bg-color"
              type="color"
              value={appConfig.backgroundColor}
              onChange={(e) => onUpdateConfig({ ...appConfig, backgroundColor: e.target.value })}
            />
          </div>
        </div>

        {/* Contatos */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Informações de Contato
          </h4>
          
          <div>
            <Label htmlFor="phone">Telefone/WhatsApp</Label>
            <Input
              id="phone"
              value={appConfig.contactPhone}
              onChange={(e) => onUpdateConfig({ ...appConfig, contactPhone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={appConfig.contactEmail}
              onChange={(e) => onUpdateConfig({ ...appConfig, contactEmail: e.target.value })}
              placeholder="contato@ppstudio.com"
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={appConfig.address}
              onChange={(e) => onUpdateConfig({ ...appConfig, address: e.target.value })}
              placeholder="Rua das Academias, 123 - São Paulo, SP"
            />
          </div>
        </div>

        {/* Link da Loja */}
        <div>
          <Label htmlFor="store-link">Link da Loja/Site</Label>
          <Input
            id="store-link"
            value={appConfig.storeLink}
            onChange={(e) => onUpdateConfig({ ...appConfig, storeLink: e.target.value })}
            placeholder="https://loja.ppstudio.com"
          />
        </div>

        {/* Mensagem de Boas-vindas */}
        <div>
          <Label htmlFor="welcome">Mensagem de Boas-vindas</Label>
          <Textarea
            id="welcome"
            value={appConfig.welcomeMessage}
            onChange={(e) => onUpdateConfig({ ...appConfig, welcomeMessage: e.target.value })}
            placeholder="Bem-vindo ao seu treino personalizado!"
            rows={3}
          />
        </div>

        {/* Preview das Configurações */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-2">Preview das Configurações:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Studio:</strong> {appConfig.studioName}</p>
            <p><strong>Telefone:</strong> {appConfig.contactPhone}</p>
            <p><strong>E-mail:</strong> {appConfig.contactEmail}</p>
            <p><strong>Endereço:</strong> {appConfig.address}</p>
            {appConfig.storeLink && <p><strong>Loja:</strong> {appConfig.storeLink}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppCustomization;
