import { mockApi } from './mockApi'
import { Ticket, TicketCreate } from '../types'

export const ticketService = {
  // Récupérer tous les tickets
  async getTickets(projectId?: number): Promise<Ticket[]> {
    return await mockApi.getTickets(projectId)
  },

  // Récupérer un ticket par ID
  async getTicket(id: number): Promise<Ticket> {
    return await mockApi.getTicket(id)
  },

  // Créer un nouveau ticket
  async createTicket(ticketData: TicketCreate): Promise<Ticket> {
    return await mockApi.createTicket(ticketData)
  },

  // Mettre à jour un ticket
  async updateTicket(id: number, ticketData: Partial<TicketCreate>): Promise<Ticket> {
    return await mockApi.updateTicket(id, ticketData)
  },

  // Supprimer un ticket
  async deleteTicket(id: number): Promise<void> {
    await mockApi.deleteTicket(id)
  },

  // Mettre à jour le statut d'un ticket
  async updateTicketStatus(id: number, status: string): Promise<Ticket> {
    return await mockApi.updateTicketStatus(id, status)
  },

  // Assigner un ticket à un utilisateur
  async assignTicket(id: number, assigneeId: number): Promise<Ticket> {
    return await mockApi.assignTicket(id, assigneeId)
  }
}
