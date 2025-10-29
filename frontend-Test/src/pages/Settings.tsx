import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'
import { settingsService } from '../services/settingsService'

interface ProfileFormData {
  full_name: string
  email: string
  username: string
}

interface PreferencesFormData {
  theme: 'light' | 'dark'
  language: 'fr' | 'en'
  email_notifications: boolean
  push_notifications: boolean
}

interface SecurityFormData {
  current_password: string
  new_password: string
  confirm_password: string
}

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const { preferences, updatePreferences } = useSettingsStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Formulaires
  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      username: user?.username || ''
    }
  })

  const preferencesForm = useForm<PreferencesFormData>({
    defaultValues: {
      theme: preferences.theme,
      language: preferences.language,
      email_notifications: preferences.email_notifications,
      push_notifications: preferences.push_notifications
    }
  })

  const securityForm = useForm<SecurityFormData>({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  })

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'preferences', name: 'Préférences', icon: SettingsIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Sécurité', icon: Shield }
  ]

  const handleProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const updatedUser = await settingsService.updateUserProfile(user.id, {
        full_name: data.full_name,
        email: data.email,
        username: data.username
      })
      
      updateUser(updatedUser)
      alert('Profil mis à jour avec succès !')
    } catch (error) {
      alert('Erreur lors de la mise à jour du profil')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesSubmit = async (data: PreferencesFormData) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      await settingsService.updateUserPreferences(user.id, data)
      updatePreferences(data)
      alert('Préférences mises à jour avec succès !')
    } catch (error) {
      alert('Erreur lors de la mise à jour des préférences')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSecuritySubmit = async (data: SecurityFormData) => {
    if (!user) return
    
    if (data.new_password !== data.confirm_password) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    
    setIsLoading(true)
    try {
      await settingsService.changePassword(user.id, data.current_password, data.new_password)
      alert('Mot de passe changé avec succès !')
      securityForm.reset()
    } catch (error) {
      alert('Erreur lors du changement de mot de passe')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted">Gérez vos préférences et informations personnelles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation par onglets */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="lg:col-span-3">
          {/* Section Profil */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium">Informations du profil</h3>
                <p className="text-sm text-muted">Mettez à jour vos informations personnelles</p>
              </div>
              <div className="card-content">
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        {...profileForm.register('full_name', { required: 'Le nom est requis' })}
                        type="text"
                        className="input"
                        placeholder="Votre nom complet"
                      />
                      {profileForm.formState.errors.full_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileForm.formState.errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom d'utilisateur
                      </label>
                      <input
                        {...profileForm.register('username', { required: 'Le nom d\'utilisateur est requis' })}
                        type="text"
                        className="input"
                        placeholder="Votre nom d'utilisateur"
                      />
                      {profileForm.formState.errors.username && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse email
                    </label>
                    <input
                      {...profileForm.register('email', { 
                        required: 'L\'email est requis',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Adresse email invalide'
                        }
                      })}
                      type="email"
                      className="input"
                      placeholder="votre@email.com"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Section Préférences */}
          {activeTab === 'preferences' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium">Préférences générales</h3>
                <p className="text-sm text-muted">Personnalisez votre expérience</p>
              </div>
              <div className="card-content">
                <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Thème
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          {...preferencesForm.register('theme')}
                          type="radio"
                          value="light"
                          className="mr-3"
                        />
                        <span>Clair</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          {...preferencesForm.register('theme')}
                          type="radio"
                          value="dark"
                          className="mr-3"
                        />
                        <span>Sombre</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Langue
                    </label>
                    <select {...preferencesForm.register('language')} className="input">
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Notifications</h4>
                    
                    <label className="flex items-center">
                      <input
                        {...preferencesForm.register('email_notifications')}
                        type="checkbox"
                        className="mr-3"
                      />
                      <span>Notifications par email</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        {...preferencesForm.register('push_notifications')}
                        type="checkbox"
                        className="mr-3"
                      />
                      <span>Notifications push</span>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Section Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium">Préférences de notifications</h3>
                  <p className="text-sm text-muted">Configurez quand et comment vous recevez des notifications</p>
                </div>
                <div className="card-content">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Types de notifications</h4>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span>Nouveaux tickets assignés</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span>Mises à jour de tickets</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span>Commentaires sur mes tickets</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span>Nouveaux projets</span>
                          <input type="checkbox" className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span>Rappels de deadlines</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Fréquence des emails</h4>
                      <select className="input">
                        <option value="immediate">Immédiatement</option>
                        <option value="daily">Quotidien</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="never">Jamais</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium">Mode démo</h3>
                </div>
                <div className="card-content">
                  <div className="surface-2 border rounded-lg p-4" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>
                      En mode démo, les notifications sont simulées. Dans la version complète, 
                      vous pourrez configurer des webhooks et intégrations avec des services externes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Sécurité */}
          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium">Sécurité du compte</h3>
                <p className="text-sm text-muted">Gérez votre mot de passe et la sécurité de votre compte</p>
              </div>
              <div className="card-content">
                <form onSubmit={securityForm.handleSubmit(handleSecuritySubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      {...securityForm.register('current_password', { required: 'Le mot de passe actuel est requis' })}
                      type="password"
                      className="input"
                      placeholder="Votre mot de passe actuel"
                    />
                    {securityForm.formState.errors.current_password && (
                      <p className="mt-1 text-sm text-red-600">
                        {securityForm.formState.errors.current_password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        {...securityForm.register('new_password', { 
                          required: 'Le nouveau mot de passe est requis',
                          minLength: { value: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' }
                        })}
                        type={showNewPassword ? 'text' : 'password'}
                        className="input pr-10"
                        placeholder="Votre nouveau mot de passe"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {securityForm.formState.errors.new_password && (
                      <p className="mt-1 text-sm text-red-600">
                        {securityForm.formState.errors.new_password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      {...securityForm.register('confirm_password', { required: 'La confirmation est requise' })}
                      type="password"
                      className="input"
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                    {securityForm.formState.errors.confirm_password && (
                      <p className="mt-1 text-sm text-red-600">
                        {securityForm.formState.errors.confirm_password.message}
                      </p>
                    )}
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-700">
                      <strong>Mode démo :</strong> Le changement de mot de passe est simulé. 
                      Dans la version complète, cela modifierait réellement votre mot de passe.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {isLoading ? 'Changement...' : 'Changer le mot de passe'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
