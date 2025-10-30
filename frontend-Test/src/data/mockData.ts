import { User, Project, Ticket } from '../types'

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
    comments: [],
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
    comments: [],
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
    comments: [],
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
    comments: [],
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
    comments: [],
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

