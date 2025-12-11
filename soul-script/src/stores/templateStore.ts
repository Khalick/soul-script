import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JournalTemplate } from '../data/templates';

interface CustomTemplate extends JournalTemplate {
  isCustom: true;
  createdAt: string;
}

interface TemplateState {
  customTemplates: CustomTemplate[];
  addCustomTemplate: (template: Omit<CustomTemplate, 'isCustom' | 'createdAt'>) => void;
  removeCustomTemplate: (id: string) => void;
  getAllTemplates: () => CustomTemplate[];
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      customTemplates: [],
      
      addCustomTemplate: (template) => {
        const newTemplate: CustomTemplate = {
          ...template,
          isCustom: true,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          customTemplates: [...state.customTemplates, newTemplate],
        }));
      },
      
      removeCustomTemplate: (id) => {
        set((state) => ({
          customTemplates: state.customTemplates.filter((t) => t.id !== id),
        }));
      },
      
      getAllTemplates: () => {
        return get().customTemplates;
      },
    }),
    {
      name: 'soul-script-templates',
    }
  )
);
