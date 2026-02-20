// Local storage based client for offline/local mode
// Stores ideas in browser's localStorage for persistence

// Helper functions for localStorage management
const STORAGE_KEY = 'trace_app_ideas';

const getStoredIdeas = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : getDefaultIdeas();
  } catch (error) {
    console.error('Error loading ideas from localStorage:', error);
    return getDefaultIdeas();
  }
};

const saveIdeas = (ideas) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
  } catch (error) {
    console.error('Error saving ideas to localStorage:', error);
  }
};

const getDefaultIdeas = () => [
  {
    id: '1',
    statement: 'I want to explore the idea that continuous learning is essential for personal growth',
    reasoning: 'Every day I encounter new information that challenges my current understanding',
    evidence: 'Reading books, taking courses, and learning new skills has consistently helped me develop new perspectives',
    confidence: 8,
    what_would_change: 'Learning about approaches that don\'t require constant skill development might expand this idea',
    reflections: [],
    ai_reflections: [],
    is_archived: false,
    created_date: new Date('2024-01-15').toISOString()
  },
  {
    id: '2',
    statement: 'I\'m exploring the idea that honest communication builds stronger relationships',
    reasoning: 'Hidden issues tend to grow and cause bigger problems when left unaddressed',
    evidence: 'When I\'ve been open with friends and family, our connections have deepened and become more authentic',
    confidence: 9,
    what_would_change: 'Understanding situations where strategic communication might be more effective could refine this idea',
    reflections: [],
    ai_reflections: [],
    is_archived: false,
    created_date: new Date('2024-01-10').toISOString()
  }
];

export const base44 = {
  auth: {
    me: async () => ({ id: 'local-user', email: 'local@example.com', name: 'Local User' }),
    logout: () => { console.log('Logout called (local mode)'); },
    redirectToLogin: () => { console.log('Redirect to login called (local mode)'); }
  },
  appLogs: {
    logUserInApp: async (pageName) => {
      console.log('User navigated to:', pageName);
      return { success: true };
    }
  },
  entities: {
    Belief: {
      findMany: async () => getStoredIdeas(),
      list: async (orderBy, limit) => getStoredIdeas().slice(0, limit || 100),
      findUnique: async ({ where }) => getStoredIdeas().find(b => b.id === where.id),
      create: async (args) => {
        const ideas = getStoredIdeas();
        const newBelief = { 
          ...args.data, 
          id: String(Date.now()),
          created_date: new Date().toISOString(),
          reflections: [],
          ai_reflections: [],
          is_archived: false
        };
        ideas.push(newBelief);
        saveIdeas(ideas);
        return newBelief;
      },
      update: async (args) => {
        const ideas = getStoredIdeas();
        const idx = ideas.findIndex(b => b.id === args.where.id);
        if (idx >= 0) {
          ideas[idx] = { ...ideas[idx], ...args.data };
          saveIdeas(ideas);
          return ideas[idx];
        }
        return null;
      },
      delete: async ({ where }) => {
        const ideas = getStoredIdeas();
        const idx = ideas.findIndex(b => b.id === where.id);
        if (idx >= 0) {
          ideas.splice(idx, 1);
          saveIdeas(ideas);
        }
        return { id: where.id };
      }
    },
    Thought: {
      findMany: async () => getStoredIdeas(),
      list: async (orderBy, limit) => getStoredIdeas().slice(0, limit || 100),
      findUnique: async ({ where }) => getStoredIdeas().find(b => b.id === where.id),
      create: async (args) => {
        console.log('Create function called with args:', args);
        const ideas = getStoredIdeas();
        const newIdea = { 
          id: String(Date.now()),
          created_date: new Date().toISOString(),
          reflections: [],
          ai_reflections: [],
          is_archived: false,
          ...args  // Spread args directly, not args.data
        };
        console.log('New idea to save:', newIdea);
        ideas.push(newIdea);
        saveIdeas(ideas);
        console.log('Saved ideas:', getStoredIdeas());
        return newIdea;
      },
      update: async (args) => {
        const ideas = getStoredIdeas();
        const idx = ideas.findIndex(b => b.id === args.where.id);
        if (idx >= 0) {
          ideas[idx] = { ...ideas[idx], ...args.data };
          saveIdeas(ideas);
          return ideas[idx];
        }
        return null;
      },
      delete: async ({ where }) => {
        const ideas = getStoredIdeas();
        const idx = ideas.findIndex(b => b.id === where.id);
        if (idx >= 0) {
          ideas.splice(idx, 1);
          saveIdeas(ideas);
        }
        return { id: where.id };
      }
    }
  },
  functions: {
    invoke: async (name, args) => {
      console.log('Function invoke called (local mode):', name, args);
      return null;
    }
  }
};
