import { Routes, Route } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Tickets from './pages/Tickets'
import TicketDetail from './pages/TicketDetail'
import KanbanBoard from './pages/KanbanBoard'
import Settings from './pages/Settings'
import { useAuthStore } from './stores/authStore'
import { ThemeProvider } from './components/ThemeProvider'
import Toast from './components/Toast'
import { useProjectStore } from './stores/dataStore'
import { useTicketStore } from './stores/dataStore'
import { useNotificationStore } from './stores/notificationStore'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider>
      <div className="min-h-screen bg-app">
        {isAuthenticated ? (
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/:id/tickets" element={<Tickets />} />
              <Route path="/projects/:id/kanban" element={<KanbanBoard />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/kanban" element={<KanbanBoard />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Login />} />
          </Routes>
        )}
      </div>
      <Toast />
      </ThemeProvider>
    </DndProvider>
  )
}

export default App

