import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function separateExerciseNameAndLink(text: string): { name: string; videoLink: string } {
  // Regex mais abrangente para capturar todos os formatos de YouTube
  const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?[^\s]*|shorts\/[^\s]*)|youtu\.be\/[^\s]*))(?:\s|$)/i;
  
  const match = text.match(youtubeRegex);
  
  if (match && match.index !== undefined) {
    const videoLink = match[1];
    const name = text.substring(0, match.index).trim();
    
    return {
      name: name || text.trim(),
      videoLink
    };
  }
  
  // Fallback: se não encontrou com a primeira regex, tenta uma mais simples
  const simpleRegex = /(https?:\/\/[^\s]+)/i;
  const simpleMatch = text.match(simpleRegex);
  
  if (simpleMatch && simpleMatch.index !== undefined) {
    const videoLink = simpleMatch[1];
    const name = text.substring(0, simpleMatch.index).trim();
    
    return {
      name: name || text.trim(),
      videoLink
    };
  }
  
  return {
    name: text.trim(),
    videoLink: ""
  };
}
