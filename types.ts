import React from 'react';

export type PageType = 'home' | 'video' | 'graphic' | 'contact';
export type Language = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko';
export type Theme = 'light' | 'dark';

export interface WorkItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  mediaSrc: string; // Video URL or Image URL
  poster?: string;  // For videos
  type: 'video' | 'image';
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: string;
  updatedAt: Date;
}