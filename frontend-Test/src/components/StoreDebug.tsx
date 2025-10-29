import { useProjectStore } from '../stores/dataStore'
import { useTicketStore } from '../stores/dataStore'
import { useNotificationStore } from '../stores/notificationStore'

export default function StoreDebug() {
  const projects = useProjectStore((state) => state.projects)
  const tickets = useTicketStore((state) => state.tickets)
  const notifications = useNotificationStore((state) => state.notifications)

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-md max-h-96 overflow-auto">
      <h3 className="font-bold mb-2">Store Debug</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Projets ({projects.length})</h4>
        <pre className="bg-gray-900 p-2 rounded mt-1 overflow-auto">
          {JSON.stringify(projects, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Tickets ({tickets.length})</h4>
        <pre className="bg-gray-900 p-2 rounded mt-1 overflow-auto">
          {JSON.stringify(tickets.slice(0, 2), null, 2)}
        </pre>
      </div>

      <div>
        <h4 className="font-semibold">Notifications ({notifications.length})</h4>
        <pre className="bg-gray-900 p-2 rounded mt-1 overflow-auto">
          {JSON.stringify(notifications, null, 2)}
        </pre>
      </div>
    </div>
  )
}
