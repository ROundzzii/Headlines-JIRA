import { api } from './api'
import { Attachment, Ticket, TicketCreate } from '../types'

export const ticketService = {
  // Récupérer tous les tickets
  async getTickets(projectId?: number): Promise<Ticket[]> {
    return await api.getTickets(projectId)
  },

  // Récupérer un ticket par ID
  async getTicket(id: number): Promise<Ticket> {
    return await api.getTicket(id)
  },

  // Créer un nouveau ticket
  async createTicket(ticketData: TicketCreate): Promise<Ticket> {
    return await api.createTicket(ticketData)
  },

  // Mettre à jour un ticket
  async updateTicket(id: number, ticketData: Partial<TicketCreate>): Promise<Ticket> {
    return await api.updateTicket(id, ticketData)
  },

  // Supprimer un ticket
  async deleteTicket(id: number): Promise<void> {
    await api.deleteTicket(id)
  },

  // Mettre à jour le statut d'un ticket
  async updateTicketStatus(id: number, status: string): Promise<Ticket> {
    return await api.updateTicketStatus(id, status)
  },

  // Assigner un ticket à un utilisateur
  async assignTicket(id: number, assigneeId: number): Promise<Ticket> {
    return await api.assignTicket(id, assigneeId)
  },

  // Mock upload d'attachements (frontend-only)
  async uploadAttachments(
    ticketId: number,
    items: Array<{ name: string; size: number; type: string; dataUrl?: string }>
  ): Promise<Attachment[]> {
    // Simuler un léger délai
    await new Promise((r) => setTimeout(r, 250))
    const now = new Date().toISOString()
    return items.map((it, idx) => ({
      id: Number(`${Date.now()}${idx}`),
      filename: it.name,
      file_path: it.dataUrl || `local:${it.name}`,
      file_size: it.size,
      mime_type: it.type || 'application/octet-stream',
      ticket_id: ticketId,
      uploaded_by: 1,
      created_at: now,
    }))
  },

  async deleteAttachment(_ticketId: number, _attachmentId: number): Promise<void> {
    // Rien à faire côté mock; la suppression est gérée en mémoire
    await new Promise((r) => setTimeout(r, 100))
  },
}
