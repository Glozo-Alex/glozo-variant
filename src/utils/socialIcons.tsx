import React from 'react';
import { Linkedin, Github, MessageSquare, Monitor, FileText, Globe } from 'lucide-react';

export const getSocialIcon = (platform: string) => {
  const iconMap: Record<string, React.ElementType> = {
    linkedin: Linkedin,
    github: Github,
    x: MessageSquare, // Twitter/X
    twitter: MessageSquare,
    instagram: Monitor,
    medium: FileText,
    stackoverflow: Monitor,
    gitlab: Github,
    globe: Globe,
  };
  
  return iconMap[platform.toLowerCase()] || Globe;
};