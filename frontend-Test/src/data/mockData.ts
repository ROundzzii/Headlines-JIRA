import { User, Project, Ticket, Comment } from '../types'

const now = Date.now()

const minutesAgo = (minutes: number): string =>
  new Date(now - minutes * 60 * 1000).toISOString()

// Données mock pour le mode démo
export const mockUser: User = {
  id: 1,
  email: 'demo@example.com',
  username: 'demo_user',
  full_name: 'Utilisateur Démo',
  is_active: true,
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const mockUsers: User[] = [
  mockUser,
  {
    id: 2,
    email: 'emma.dupont@example.com',
    username: 'emma',
    full_name: 'Emma Dupont',
    is_active: true,
    role: 'developer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    email: 'luc.martin@example.com',
    username: 'luc',
    full_name: 'Luc Martin',
    is_active: true,
    role: 'project_manager',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    email: 'sara.nguyen@example.com',
    username: 'sara',
    full_name: 'Sara Nguyen',
    is_active: true,
    role: 'developer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    email: 'paul.moreau@example.com',
    username: 'paul',
    full_name: 'Paul Moreau',
    is_active: true,
    role: 'developer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    email: 'ines.bernard@example.com',
    username: 'ines',
    full_name: 'Inès Bernard',
    is_active: true,
    role: 'viewer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 7,
    email: 'nicolas.renard@example.com',
    username: 'nicolas',
    full_name: 'Nicolas Renard',
    is_active: true,
    role: 'developer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 8,
    email: 'lea.perez@example.com',
    username: 'lea',
    full_name: 'Léa Perez',
    is_active: true,
    role: 'developer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 9,
    email: 'youssef.kamal@example.com',
    username: 'youssef',
    full_name: 'Youssef Kamal',
    is_active: true,
    role: 'developer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 10,
    email: 'julie.roche@example.com',
    username: 'julie',
    full_name: 'Julie Roche',
    is_active: true,
    role: 'project_manager',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const getUser = (id: number): User => {
  const user = mockUsers.find(item => item.id === id)

  if (!user) {
    throw new Error(`User ${id} not found in mockUsers`)
  }

  return user
}

const sampleImageBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

const samplePdfBase64 =
  'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKPj4KZW5kb2JqCgo='

export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Projet E-commerce',
    key: 'ECOMM',
    description: 'Développement d\'une plateforme e-commerce moderne avec React et Node.js. Ce projet inclut un système de paiement, gestion des stocks, et interface d\'administration.',
    is_active: true,
    owner_id: 1,
    members: [
      { id: 1, user_id: 1, role: 'admin', joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, user_id: 2, role: 'developer', joined_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, user_id: 3, role: 'developer', joined_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 30 jours
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // Il y a 2 jours
  },
  {
    id: 2,
    name: 'Application Mobile',
    key: 'MOBILE',
    description: 'Application mobile cross-platform développée avec React Native. Fonctionnalités principales : géolocalisation, notifications push, et synchronisation offline.',
    is_active: true,
    owner_id: 1,
    members: [
      { id: 4, user_id: 1, role: 'admin', joined_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 5, user_id: 4, role: 'developer', joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 15 jours
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // Il y a 1 jour
  },
  {
    id: 3,
    name: 'API Backend',
    key: 'API',
    description: 'API REST développée avec FastAPI et PostgreSQL. Fournit des endpoints pour l\'authentification, gestion des données, et intégrations tierces.',
    is_active: true,
    owner_id: 1,
    members: [
      { id: 6, user_id: 1, role: 'admin', joined_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 7, user_id: 3, role: 'developer', joined_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 8, user_id: 5, role: 'developer', joined_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 45 jours
    updated_at: new Date().toISOString() // Aujourd'hui
  }
]

export const mockComments: Comment[] = [
  {
    id: 1,
    content: "J'ai partage la maquette finale. Merci de jeter un oeil @luc.",
    author_id: 2,
    ticket_id: 1,
    created_at: minutesAgo(360),
    updated_at: minutesAgo(330),
    author: getUser(2),
    attachments: [
      {
        id: 'comment-att-1',
        filename: 'wireframe-v2.png',
        mime_type: 'image/png',
        size: 20480,
        data: sampleImageBase64,
        file_path: sampleImageBase64,
        uploaded_by: 2,
        uploaded_at: minutesAgo(360),
        preview_url: sampleImageBase64
      }
    ],
    mentions: [3],
    mentions_details: [getUser(3)]
  },
  {
    id: 2,
    content: `Mise a jour de la spec API.

## Taches
- Ajuster la route \`POST /auth\`
- Ajouter un test de regression`,
    author_id: 3,
    ticket_id: 1,
    created_at: minutesAgo(240),
    updated_at: minutesAgo(120),
    author: getUser(3),
    attachments: [
      {
        id: 'comment-att-2',
        filename: 'specifications.pdf',
        mime_type: 'application/pdf',
        size: 53248,
        data: samplePdfBase64,
        file_path: samplePdfBase64,
        uploaded_by: 3,
        uploaded_at: minutesAgo(240)
      }
    ],
    mentions: [2, 4],
    mentions_details: [getUser(2), getUser(4)]
  },
  {
    id: 3,
    content: 'Le responsive est pret pour revue. Merci @emma pour les tests.',
    author_id: 4,
    ticket_id: 2,
    created_at: minutesAgo(90),
    updated_at: minutesAgo(80),
    author: getUser(4),
    mentions: [2],
    mentions_details: [getUser(2)]
  },
  {
    id: 4,
    content: `Planification de la version 2.0:

## Fonctionnalités principales
- Système de notifications
  - Emails automatiques
  - Notifications push
  - Badge de compteur
- API GraphQL
  - Queries avancées
  - Mutations optimisées
  - Subscriptions temps réel
- Dashboard analytics
  - Métriques utilisateurs
  - Rapports hebdomadaires
  - Export CSV/PDF

## Tâches techniques
1. Refactoring du code
   - Nettoyage des dépendances
   - Optimisation des requêtes
2. Tests automatisés
   - Tests unitaires
   - Tests d'intégration
   - Tests E2E avec Cypress
3. Documentation
   - README mis à jour
   - Guide API
   - Tutoriels vidéo`,
    author_id: 3,
    ticket_id: 1,
    created_at: minutesAgo(180),
    updated_at: minutesAgo(150),
    author: getUser(3),
    mentions: [2, 4],
    mentions_details: [getUser(2), getUser(4)]
  }
]

export const mockTickets: Ticket[] = [
  {
    id: 1,
    title: 'Implémenter authentification utilisateur',
    description: 'Créer le système d\'authentification avec JWT',
    status: 'In Progress',
    priority: 'high',
    type: 'task',
    project_id: 1,
    assignee_id: 1,
    creator_id: 1,
    tags: ['auth', 'security'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: mockUser,
    creator: mockUser,
    project: mockProjects[0],
    comments: mockComments.filter(comment => comment.ticket_id === 1),
    attachments: []
  },
  {
    id: 2,
    title: 'Design responsive pour mobile',
    description: 'Adapter l\'interface pour les écrans mobiles',
    status: 'To Do',
    priority: 'medium',
    type: 'feature',
    project_id: 2,
    assignee_id: 1,
    creator_id: 1,
    tags: ['ui', 'mobile'],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: mockUser,
    creator: mockUser,
    project: mockProjects[1],
    comments: mockComments.filter(comment => comment.ticket_id === 2),
    attachments: []
  },
  {
    id: 3,
    title: 'Optimiser les performances API',
    description: 'Améliorer les temps de réponse de l\'API',
    status: 'Done',
    priority: 'low',
    type: 'bug',
    project_id: 3,
    assignee_id: 1,
    creator_id: 1,
    tags: ['performance', 'api'],
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: mockUser,
    creator: mockUser,
    project: mockProjects[2],
    comments: mockComments.filter(comment => comment.ticket_id === 3),
    attachments: []
  },
  {
    id: 4,
    title: 'Tests unitaires',
    description: 'Ajouter des tests unitaires pour les composants',
    status: 'In Progress',
    priority: 'high',
    type: 'task',
    project_id: 1,
    assignee_id: 1,
    creator_id: 1,
    tags: ['testing', 'quality'],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: mockUser,
    creator: mockUser,
    project: mockProjects[0],
    comments: mockComments.filter(comment => comment.ticket_id === 4),
    attachments: []
  },
  {
    id: 5,
    title: 'Documentation API',
    description: 'Créer la documentation Swagger pour l\'API',
    status: 'To Do',
    priority: 'medium',
    type: 'feature',
    project_id: 3,
    assignee_id: 1,
    creator_id: 1,
    tags: ['documentation', 'api'],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: mockUser,
    creator: mockUser,
    project: mockProjects[2],
    comments: mockComments.filter(comment => comment.ticket_id === 5),
    attachments: []
  }
]

export const mockStats = {
  totalProjects: mockProjects.length,
  totalTickets: mockTickets.length,
  ticketsByStatus: {
    'To Do': mockTickets.filter(t => t.status === 'To Do').length,
    'In Progress': mockTickets.filter(t => t.status === 'In Progress').length,
    'Done': mockTickets.filter(t => t.status === 'Done').length
  },
  ticketsByPriority: {
    'high': mockTickets.filter(t => t.priority === 'high').length,
    'medium': mockTickets.filter(t => t.priority === 'medium').length,
    'low': mockTickets.filter(t => t.priority === 'low').length
  }
}

