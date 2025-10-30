# Frontend JIRA-Headlines - Documentation du Projet

## 📋 Vue d'ensemble

Ce projet est une reproduction du frontend de JIRA, développé avec React + TypeScript + Vite + Tailwind CSS. Il s'agit d'un clone fonctionnel destiné à démontrer les capacités de gestion de projets et de tickets.

**État actuel**: Mode démo avec données mockées
**Architecture**: Frontend standalone (pas encore connecté au backend)

---

## ✅ Ce qui a été fait

### 1. Structure et Architecture
- ✅ Configuration du projet avec Vite + React + TypeScript
- ✅ Tailwind CSS configuré avec thème clair/sombre
- ✅ Architecture en composants réutilisables
- ✅ Routing avec React Router
- ✅ State management avec Zustand

### 2. Pages implémentées
- ✅ **Dashboard** (`src/pages/Dashboard.tsx`)
  - Statistiques globales (projets, tickets)
  - Tickets récents
  - Activité récente
  
- ✅ **Login/Register** (`src/pages/Login.tsx`, `src/pages/Register.tsx`)
  - Authentification de base en mode démo
  
- ✅ **Projects** (`src/pages/Projects.tsx`)
  - Liste des projets
  - Vue en grille responsive
  - Bouton "Nouveau projet" **FONCTIONNEL** ✅
  
- ✅ **Project Detail** (`src/pages/ProjectDetail.tsx`)
  - Détails d'un projet
  - Statistiques du projet
  - Tickets associés
  - Bouton "Paramètres" **FONCTIONNEL** ✅
  
- ✅ **Tickets** (`src/pages/Tickets.tsx`)
  - Liste des tickets
  - Recherche en temps réel **FONCTIONNELLE** ✅
  - Filtres (statut, priorité, type) **FONCTIONNELS** ✅
  - Bouton "Nouveau ticket" **FONCTIONNEL** ✅
  
- ✅ **Ticket Detail** (`src/pages/TicketDetail.tsx`)
  - Détails complets d'un ticket
  - Commentaires
  - Pièces jointes
  - Bouton "Modifier" **FONCTIONNEL** ✅
  - Ajout de commentaires **FONCTIONNEL** ✅
  
- ✅ **Kanban Board** (`src/pages/KanbanBoard.tsx`)
  - Vue en colonnes (To Do, In Progress, Done)
  - **Drag & Drop fonctionnel** ✅
  - Bouton "Nouveau ticket" **FONCTIONNEL** ✅
  
- ✅ **Settings** (`src/pages/Settings.tsx`)
  - Profil utilisateur
  - Préférences (thème, langue)
  - Notifications
  - Sécurité

### 3. Composants réutilisables
- ✅ **Layout** (`src/components/Layout.tsx`)
  - Sidebar responsive
  - Header avec thème clair/sombre
  - Navigation
  
- ✅ **Modal** (`src/components/Modal.tsx`)
  - Composant de base réutilisable
  - Overlay et animations
  - Tailles configurables (sm, md, lg, xl)
  
- ✅ **ThemeProvider** (`src/components/ThemeProvider.tsx`)
  - Gestion du thème clair/sombre
  - Persistance dans localStorage
  
- ✅ **Toast** (`src/components/Toast.tsx`)
  - Notifications toast
  - Types: success, error, warning, info
  - Auto-disparition après 5s

### 4. Modales fonctionnelles
- ✅ **CreateProjectModal** (`src/components/CreateProjectModal.tsx`)
  - Formulaire de création de projet
  - Validation
  - Génération automatique de clé
  
- ✅ **CreateTicketModal** (`src/components/CreateTicketModal.tsx`)
  - Formulaire de création de ticket
  - Tous les champs (type, priorité, projet, tags)
  
- ✅ **EditTicketModal** (`src/components/EditTicketModal.tsx`)
  - Édition complète d'un ticket
  - Mise à jour du statut
  
- ✅ **ProjectSettingsModal** (`src/components/ProjectSettingsModal.tsx`)
  - Paramètres du projet
  - Modification nom, clé, description

### 5. Stores (State Management)
- ✅ **authStore** (`src/stores/authStore.ts`)
  - Authentification
  - Gestion de l'utilisateur connecté
  
- ✅ **dataStore** (`src/stores/dataStore.ts`)
  - **ProjectStore**: gestion des projets
    - ✅ fetchProjects()
    - ✅ createProject()
    - ✅ updateProject()
    - ✅ deleteProject()
    - ✅ getProject()
  
  - **TicketStore**: gestion des tickets
    - ✅ fetchTickets()
    - ✅ createTicket()
    - ✅ updateTicket()
    - ✅ deleteTicket()
    - ✅ updateTicketStatus() (pour drag & drop)
    - ✅ getTicket()
  
  - **DashboardStore**: statistiques
    - ✅ fetchStats()
  
- ✅ **settingsStore** (`src/stores/settingsStore.ts`)
  - Préférences utilisateur
  
- ✅ **notificationStore** (`src/stores/notificationStore.ts`)
  - Gestion des notifications toast
  - addNotification()
  - removeNotification()

### 6. Services
- ✅ **mockApi** (`src/services/mockApi.ts`)
  - API en mémoire pour mode démo
  - Données mockées pour tous les endpoints
  - Simulation de délais réseau
  
- ✅ **projectService** (`src/services/projectService.ts`)
  - Abstraction des appels API
  
- ✅ **ticketService** (`src/services/ticketService.ts`)
  - Abstraction des appels API
  
- ✅ **authService** (`src/services/authService.ts`)
  - Gestion de l'authentification

### 7. Fonctionnalités UX/UI
- ✅ Thème clair/sombre fonctionnel
- ✅ Responsive design
- ✅ Loading states (squelettes)
- ✅ Notifications toast
- ✅ Validation de formulaires
- ✅ Feedback visuel pour actions
- ✅ États de chargement sur boutons

---

## 🔧 Ce qui reste à faire (Frontend uniquement)

### Priorité HAUTE (Core Features Frontend)

#### 1. Upload de fichiers 📎
**Description**: Permettre l'ajout de pièces jointes aux tickets
- [x] Component pour upload de fichiers (drag & drop)
- [x] Validation des types de fichiers (frontend)
- [x] Validation de la taille (frontend)
- [x] Preview des fichiers (images, PDF, etc.)
- [x] Suppression de fichiers (frontend)
- [x] Indicateur de progression d'upload
- [x] Gestion des erreurs d'upload

**Fichiers à créer**:
- `src/components/FileUploader.tsx`
- `src/components/FilePreview.tsx`
- `src/utils/fileValidation.ts`

**Fichiers à modifier**:
- `src/pages/TicketDetail.tsx`
- `src/stores/dataStore.ts` (ajouter gestion fichiers en local)

### Priorité MOYENNE (Amélioration UX)

#### 2. Assignation de tickets 👥
**Description**: Permettre d'assigner des tickets à des utilisateurs
- [x] Sélecteur d'utilisateurs avec liste déroulante
- [x] Dropdown avec recherche (filtrage côté frontend)
- [x] Avatar des utilisateurs avec initiales
- [x] Badge d'assignation visible
- [x] Utilisation des données mockées pour les utilisateurs

Recommandations (à faire plus tard):
- Accessibilité: rôles/aria-labels, focus trap des modales, retour focus à la fermeture
- UX sélecteur: navigation clavier complète (↑/↓/Enter/Échap) et item sélectionné en tête avec check
- Recherche: debounce (150 ms) et highlight des termes dans nom/email (implémentés en partie)
- Chargement: spinner visuel dans le dropdown (implémenté)
- Données: cache `users` en localStorage avec TTL (ex. 24h)
- Performance: mémoïser `UserAvatar`/`AssigneeBadge` si liste volumineuse

**Fichiers à créer**:
- `src/components/UserSelector.tsx`
- `src/components/UserAvatar.tsx`
- `src/components/AssigneeBadge.tsx`

**Fichiers à modifier**:
- `src/pages/TicketDetail.tsx`
- `src/components/EditTicketModal.tsx`
- `src/data/mockData.ts` (ajouter plus d'utilisateurs)

#### 3. Système de commentaires 💬
**Description**: Commentaires fonctionnels avec données locales
- [ ] Édition de commentaires (inline)
- [ ] Suppression de commentaires
- [ ] Mentions d'utilisateurs (@ avec autocomplétion)
- [ ] Upload d'images dans commentaires (base64 local)
- [ ] Formatage de texte (markdown ou rich text)
- [ ] Affichage des commentaires avec timestamps

**Fichiers à créer**:
- `src/components/CommentEditor.tsx` (avec toolbar)
- `src/components/CommentItem.tsx`
- `src/components/MentionSelector.tsx`
- `src/utils/markdown.ts` (formatage texte)

**Fichiers à modifier**:
- `src/pages/TicketDetail.tsx`
- `src/data/mockData.ts` (ajouter commentaires aux tickets)
- `src/stores/dataStore.ts` (gestion locale des commentaires)

#### 4. Recherche avancée 🔍
**Description**: Améliorer la recherche et les filtres
- [ ] Recherche par auteur (filtrage des tickets)
- [ ] Recherche par date (plage de dates)
- [ ] Filtres multiples combinés (AND/OR)
- [ ] Sauvegarde des filtres favoris dans localStorage
- [ ] Export des résultats en CSV/JSON (frontend)
- [ ] Recherche avec highlight des termes trouvés

**Fichiers à créer**:
- `src/components/TicketFilters.tsx` (composant réutilisable)
- `src/components/DateRangePicker.tsx`
- `src/components/FilterChips.tsx`
- `src/utils/filterTickets.ts` (logique de filtrage)
- `src/utils/exportData.ts` (export CSV/JSON)

**Fichiers à modifier**:
- `src/pages/Tickets.tsx`
- `src/stores/dataStore.ts` (ajouter filtres persistants)

#### 5. Workflow avancé 🎯
**Description**: Personnaliser les statuts et transitions côté frontend
- [ ] Gestion des workflows personnalisés (localStorage)
- [ ] États personnalisés par projet (couleurs, noms)
- [ ] Règles de transition visuelles (drag & drop pour workflow)
- [ ] Validation automatique des transitions permises
- [ ] Prévisualisation du workflow

**Fichiers à créer**:
- `src/components/WorkflowEditor.tsx`
- `src/components/StatusCreator.tsx`
- `src/components/TransitionBuilder.tsx`
- `src/pages/WorkflowSettings.tsx`
- `src/utils/workflowValidation.ts`

**Fichiers à modifier**:
- `src/pages/KanbanBoard.tsx` (intégrer workflows personnalisés)
- `src/stores/dataStore.ts` (gérer workflows locaux)

### Priorité BASSE (Features avancées Frontend)

#### 6. Composant de debugging 🔍
**Description**: Outils de debug pour développement
- [ ] Créer un panneau de debug flottant
- [ ] Afficher l'état des stores en temps réel
- [ ] Logger les actions
- [ ] Inspecter les données mockées
- [ ] Réinitialiser les stores

**Fichiers à créer**:
- `src/components/StoreDebug.tsx`

#### 7. Notifications système local 🔔
**Description**: Notifications navigateur améliorées
- [ ] Demander permission notifications navigateur
- [ ] Notifications push navigateur (Browser API)
- [ ] Centre de notifications intégré
- [ ] Marquer comme lu/non lu (localStorage)
- [ ] Filtres de notifications
- [ ] Son pour nouvelles notifications (optionnel)

**Fichiers à créer**:
- `src/components/NotificationCenter.tsx`
- `src/hooks/useNotificationPermission.ts`
- `src/utils/notificationService.ts` (Browser Notifications API)

**Fichiers à modifier**:
- `src/components/Layout.tsx` (ajouter badge de notifications)
- `src/stores/notificationStore.ts` (ajouter notifications persistées)

#### 8. Rapports et Analytics 📊
**Description**: Graphiques et statistiques visuelles
- [ ] Graphiques de vélocité (Chart.js ou Recharts)
- [ ] Burndown charts
- [ ] Graphiques en camembert (tickets par statut/priorité)
- [ ] Rapports d'activité (timeline)
- [ ] Export PDF (jsPDF côté frontend)
- [ ] Rapports personnalisés configurables
- [ ] Tableaux de bord interactifs

**Fichiers à créer**:
- `src/pages/Reports.tsx`
- `src/components/Charts/VelocityChart.tsx`
- `src/components/Charts/BurndownChart.tsx`
- `src/components/Charts/PieChart.tsx`
- `src/components/Charts/ActivityTimeline.tsx`
- `src/utils/chartData.ts` (transformation données)
- `src/utils/pdfExport.ts` (génération PDF)

**Fichiers à modifier**:
- `src/pages/Dashboard.tsx` (intégrer graphiques)

#### 9. Gestion des sprints 🏃
**Description**: Planification et suivi de sprints côté frontend
- [ ] Création de sprints (interface)
- [ ] Planning poker (estimation points story)
- [ ] Suivi de sprint (backlog vs fait)
- [ ] Retrospective (template)
- [ ] Vélocité de l'équipe (calcul automatique)
- [ ] Vue calendar des sprints

**Fichiers à créer**:
- `src/pages/Sprints.tsx`
- `src/components/SprintBoard.tsx`
- `src/components/PlanningPoker.tsx`
- `src/components/BacklogView.tsx`
- `src/components/SprintCalendar.tsx`
- `src/utils/sprintCalculations.ts` (vélocité, burndown)

**Fichiers à modifier**:
- `src/data/mockData.ts` (ajouter données sprints)
- `src/stores/dataStore.ts` (gérer sprints localement)

#### 10. Système de permissions UI 🛡️
**Description**: Interface de gestion des permissions
- [ ] Sélecteur de rôles (admin, project manager, developer, viewer)
- [ ] Permissions par projet (checkboxes)
- [ ] Gestion des membres (liste + actions)
- [ ] Invitations par email (formulaire UI, pas d'envoi réel)
- [ ] Prévisualisation des permissions

**Fichiers à créer**:
- `src/components/RoleSelector.tsx`
- `src/components/PermissionMatrix.tsx`
- `src/components/MemberList.tsx`
- `src/components/InviteMemberForm.tsx`

**Fichiers à modifier**:
- `src/pages/Settings.tsx`
- `src/components/ProjectSettingsModal.tsx`
- `src/data/mockData.ts` (ajouter données permissions)

#### 11. Templates de tickets et actions en lot 📋
**Description**: Productivité et efficacité
- [ ] Créer des templates de tickets (formulaires pré-remplis)
- [ ] Tâches récurrentes (duplication intelligente)
- [ ] Copier un ticket (duplication rapide)
- [ ] Actions en lot (sélection multiple)
- [ ] Import/Export de tickets (JSON/CSV)
- [ ] Sauvegarde de formes de recherche (filtres favoris)

**Fichiers à créer**:
- `src/components/TicketTemplate.tsx`
- `src/components/TemplateCreator.tsx`
- `src/components/BulkActions.tsx`
- `src/components/TicketImporter.tsx`
- `src/utils/bulkOperations.ts`

**Fichiers à modifier**:
- `src/components/CreateTicketModal.tsx` (ajouter templates)
- `src/pages/Tickets.tsx` (ajouter sélection multiple)

#### 12. Améliorations UI/UX 🎨
**Description**: Polir l'interface utilisateur et l'expérience
- [ ] Thème personnalisable (couleurs personnalisées)
- [ ] Animations et transitions fluides
- [ ] Raccourcis clavier (navigation, actions)
- [ ] Mode plein écran pour Kanban
- [ ] Accessibilité (ARIA, focus management)
- [ ] Loading skeletons améliorés
- [ ] Mode sombre amélioré
- [ ] Responsive design optimisé

**Fichiers à créer**:
- `src/components/KeyboardShortcuts.tsx`
- `src/hooks/useKeyboardShortcuts.ts`
- `src/theme/customThemes.ts`
- `src/utils/animations.ts`

**Fichiers à modifier**:
- `src/index.css` (ajouter animations)
- Tous les composants (améliorer accessibilité)
- `src/components/ThemeProvider.tsx` (personnalisation couleurs)

---

## 🚀 Ordre d'implémentation recommandé

### Phase 1: Fonctionnalités de base (Priorité haute)
```
1. Upload de fichiers
   → Feature très demandée
   → Teste la gestion de fichiers
   → Utilisation d'API File natives
   
2. Composant de debugging
   → Facilite le développement
   → Essentiel pour comprendre les stores
   → Peut être désactivé en production
```

### Phase 2: Collaboration (Priorité moyenne)
```
3. Assignation de tickets
   → Rendre l'outil collaboratif
   → Utilisation des utilisateurs mockés
   
4. Système de commentaires complet
   → Communication entre équipe
   → Données locales (localStorage)
   
5. Recherche avancée
   → Améliore l'UX significativement
   → Pas de breaking changes
   → Performance de filtrage
```

### Phase 3: Personnalisation (Priorité moyenne)
```
6. Workflow avancé
   → Personnalisation par projet
   → Teste la flexibilité de l'architecture
   → Données sauvegardées localement
   
7. Notifications système
   → Browser Notifications API
   → Notification Center intégré
   → Amélioration UX
```

### Phase 4: Analytics et Rapports (Priorité basse)
```
8. Rapports et Analytics
   → Graphiques avec Chart.js/Recharts
   → Export PDF côté frontend
   → Complexité modérée
   
9. Gestion des sprints
   → Feature complète
   → Calculs automatiques (vélocité)
   → Données mockées
```

### Phase 5: Polish et Productivité (Priorité basse)
```
10. Permissions UI
    → Interface de gestion
    → Mock des permissions
    → Amélioration UX
    
11. Templates et actions en lot
    → Productivité
    → Efficacité
    → Import/Export
    
12. Améliorations UI/UX
    → Polish final
    → Accessibilité
    → Animations
```

---

## 📂 Structure des fichiers

```
frontend-Test/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Layout.tsx       ✅
│   │   ├── Modal.tsx        ✅
│   │   ├── ThemeProvider.tsx ✅
│   │   ├── Toast.tsx        ✅
│   │   ├── CreateProjectModal.tsx ✅
│   │   ├── CreateTicketModal.tsx ✅
│   │   ├── EditTicketModal.tsx ✅
│   │   └── ProjectSettingsModal.tsx ✅
│   │
│   ├── pages/               # Pages de l'application
│   │   ├── Dashboard.tsx    ✅
│   │   ├── Login.tsx        ✅
│   │   ├── Register.tsx     ✅
│   │   ├── Projects.tsx     ✅
│   │   ├── ProjectDetail.tsx ✅
│   │   ├── Tickets.tsx      ✅
│   │   ├── TicketDetail.tsx ✅
│   │   ├── KanbanBoard.tsx  ✅
│   │   └── Settings.tsx     ✅
│   │
│   ├── stores/              # State management (Zustand)
│   │   ├── authStore.ts     ✅
│   │   ├── dataStore.ts     ✅
│   │   ├── settingsStore.ts ✅
│   │   └── notificationStore.ts ✅
│   │
│   ├── services/            # API et services
│   │   ├── api.ts           ⚠️ À connecter au backend
│   │   ├── authService.ts   ⚠️ À connecter au backend
│   │   ├── projectService.ts ✅
│   │   ├── ticketService.ts ✅
│   │   ├── settingsService.ts ✅
│   │   └── mockApi.ts       ✅ (temporaire)
│   │
│   ├── types/               # TypeScript types
│   │   └── index.ts         ✅
│   │
│   ├── data/                # Données mockées
│   │   └── mockData.ts      ✅
│   │
│   ├── App.tsx              ✅
│   ├── main.tsx             ✅
│   └── index.css            ✅
│
├── package.json             ✅
├── vite.config.ts           ✅
├── tailwind.config.js       ✅
└── tsconfig.json            ✅
```

---

## 🛠️ Technologies utilisées

### Core
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide

### Styling
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes
- **CSS Variables** - Thèmes dynamiques

### State Management
- **Zustand** - State management léger
- **React Query** - Cache et synchronisation de données

### Routing & Forms
- **React Router** - Navigation
- **React Hook Form** - Gestion de formulaires
- **React DnD** - Drag & Drop

### Dev Tools
- **ESLint** - Linting
- **TypeScript** - Type checking

---

## 🐛 Points d'attention connus

1. **Mode Démo**: Toutes les données sont mockées dans `mockApi.ts`
2. **Backend**: Pas encore connecté, il faut créer un fichier `.env` avec l'URL du backend
3. **Authentification**: Actuellement simulée, nécessite le backend
4. **Upload de fichiers**: Non implémenté pour l'instant
5. **Permissions**: Système de rôles basique, pas encore de permissions granulaires

---

## 📝 Notes pour le prochain développeur

### Démarrage rapide
```bash
cd frontend-Test
npm install
npm run dev
```

### Commandes utiles
```bash
npm run dev          # Lancer le serveur de développement
npm run build        # Build pour production
npm run preview      # Prévisualiser le build
```

### Données mockées et localisation
Les données sont dans `src/data/mockData.ts`. Elles incluent:
- 1 utilisateur de démo
- 3 projets
- ~10 tickets

### Debugging
En mode développement, les stores Zustand sont disponibles dans la console:
```javascript
// Dans la console du navigateur
stores.projects.getState().projects
stores.tickets.getState().tickets
```

### Focus Frontend uniquement
**IMPORTANT**: Ce projet se concentre exclusivement sur le frontend en utilisant des données mockées. Toutes les fonctionnalités fonctionnent en mode standalone sans backend nécessaire.

**Données persistentes**: Utiliser localStorage pour sauvegarder les données créées/modifiées par l'utilisateur (projets, tickets, commentaires, etc.)

---

## 📞 Contact & Support

Pour toute question ou contribution, référez-vous au README principal du projet.

**Bon courage pour la suite du développement! 🚀**

