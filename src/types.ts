export interface NewsletterPreview {
  id: string;
  title: string;
  category: string;
  summary: string;
  benefit: string;
}

export interface Section {
  header: string;
  content: string;
}

export interface UseCase {
  title: string;
  description: string;
}

export interface NewsletterDetail {
  headline: string;
  summary3Line: string;
  whyNow: string;
  sections: Section[];
  useCases: UseCase[];
  expertThought: string;
}
