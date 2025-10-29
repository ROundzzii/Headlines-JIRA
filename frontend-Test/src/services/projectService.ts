import { mockApi } from './mockApi'
import { Project, ProjectCreate, ProjectMember } from '../types'

export const projectService = {
  // Récupérer tous les projets
  async getProjects(): Promise<Project[]> {
    return await mockApi.getProjects()
  },

  // Récupérer un projet par ID
  async getProject(id: number): Promise<Project> {
    return await mockApi.getProject(id)
  },

  // Créer un nouveau projet
  async createProject(projectData: ProjectCreate): Promise<Project> {
    return await mockApi.createProject(projectData)
  },

  // Mettre à jour un projet
  async updateProject(id: number, projectData: Partial<ProjectCreate>): Promise<Project> {
    return await mockApi.updateProject(id, projectData)
  },

  // Supprimer un projet
  async deleteProject(id: number): Promise<void> {
    await mockApi.deleteProject(id)
  },

  // Ajouter un membre à un projet
  async addMember(projectId: number, userId: number, role: string): Promise<ProjectMember> {
    return await mockApi.addMember(projectId, userId, role)
  },

  // Supprimer un membre d'un projet
  async removeMember(projectId: number, userId: number): Promise<void> {
    await mockApi.removeMember(projectId, userId)
  },

  // Mettre à jour le rôle d'un membre
  async updateMemberRole(projectId: number, userId: number, role: string): Promise<ProjectMember> {
    return await mockApi.updateMemberRole(projectId, userId, role)
  }
}
