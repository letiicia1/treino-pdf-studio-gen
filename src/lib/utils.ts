import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function separateExerciseNameAndLink(text: string): { name: string; videoLink: string } {
  // Regex para detectar URLs do YouTube coladas no final do nome do exercício
  const youtubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?[^\\s]+|youtu\.be\/[^\\s]+))/i;
  
  const match = text.match(youtubeRegex);
  
  if (match && match.index !== undefined) {
    const videoLink = match[1];
    const name = text.substring(0, match.index).trim();
    
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
