export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
}

export interface ContactInfo {
  whatsapp: string;
  instagram: string;
  email: string;
  about: string;
  profileImageUrl?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  github?: string;
  gitlab?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
}
