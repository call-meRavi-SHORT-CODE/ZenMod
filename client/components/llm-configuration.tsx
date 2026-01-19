"use client"
  // Removed stray closing </div> tag
  // This tag was causing a parsing error
  // Ensure that the structure of the component remains valid
import { useState } from "react"
import { Plus, Edit2, Trash2, ChevronDown, Zap, Key, Sparkles, Database, Eye, EyeOff, Copy, X } from "lucide-react"

interface ProviderConfig {
  id: string
  provider: string
  apiKey: string
  model: string
  maxTokens: number
  extendedReasoning: boolean
  reasoningBudgetTokens: number
}

interface LLMConfigurationProps {
  onClose?: () => void
  isEmbedded?: boolean
}

const providerColors: Record<string, { bg: string; border: string; text: string; icon: string; letter: string }> = {
  Gemini: { bg: "from-slate-700/20 to-slate-600/20", border: "border-slate-600/30", text: "text-slate-300", icon: "bg-slate-600/20", letter: "✨" },
  OpenAI: { bg: "from-slate-700/20 to-slate-600/20", border: "border-slate-600/30", text: "text-slate-300", icon: "bg-slate-600/20", letter: "◆" },
  Claude: { bg: "from-slate-700/20 to-slate-600/20", border: "border-slate-600/30", text: "text-slate-300", icon: "bg-slate-600/20", letter: "⚡" },
  Anthropic: { bg: "from-slate-700/20 to-slate-600/20", border: "border-slate-600/30", text: "text-slate-300", icon: "bg-slate-600/20", letter: "◆" },
}

export default function LLMConfiguration({ onClose, isEmbedded = false }: LLMConfigurationProps) {
  const [configs, setConfigs] = useState<ProviderConfig[]>([
    {
      id: "1",
      provider: "Gemini",
      apiKey: "••••••••••••••••",
      model: "Gemini 3 Pro Preview",
      maxTokens: 64000,
      extendedReasoning: true,
      reasoningBudgetTokens: 6000,
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [groupBy, setGroupBy] = useState("provider")
  const [filterBy, setFilterBy] = useState("all")
  const [formData, setFormData] = useState<Omit<ProviderConfig, "id">>({
    provider: "Gemini",
    apiKey: "",
    model: "Gemini 3 Pro Preview",
    maxTokens: 64000,
    extendedReasoning: false,
    reasoningBudgetTokens: 6000,
  })

  const providers = ["Gemini", "OpenAI", "Claude", "Anthropic"]
  const models: Record<string, string[]> = {
    Gemini: ["Gemini 3 Pro Preview", "Gemini 2 Pro", "Gemini Pro"],
    OpenAI: ["GPT-4 Turbo", "GPT-4", "GPT-3.5 Turbo"],
    Claude: ["Claude 3 Opus", "Claude 3 Sonnet", "Claude 3 Haiku"],
    Anthropic: ["Anthropic 3 Opus", "Anthropic 3 Sonnet"],
  }

  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
      provider: "Gemini",
      apiKey: "",
      model: "Gemini 3 Pro Preview",
      maxTokens: 64000,
      extendedReasoning: false,
      reasoningBudgetTokens: 6000,
    })
    setShowForm(true)
  }

  const handleEdit = (config: ProviderConfig) => {
    setEditingId(config.id)
    setFormData({
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      maxTokens: config.maxTokens,
      extendedReasoning: config.extendedReasoning,
      reasoningBudgetTokens: config.reasoningBudgetTokens,
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setConfigs(configs.filter((c) => c.id !== id))
  }

  const handleSave = () => {
    if (!formData.apiKey.trim()) {
      alert("Please enter API Key")
      return
    }

    if (editingId) {
      setConfigs(
        configs.map((c) =>
          c.id === editingId
            ? { ...c, ...formData }
            : c
        )
      )
    } else {
      setConfigs([...configs, { ...formData, id: Date.now().toString() }])
    }

    setShowForm(false)
    setEditingId(null)
    setShowPassword(false)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setShowPassword(false)
  }

  return (
    <div className={`${isEmbedded ? "" : "min-h-screen bg-[#191919] text-[#A4A4A4]"} px-8 md:px-20 lg:px-32 py-8`}>
      {/* Main Content */}
      <div>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">LLM Configurations</h1>
              <p className="text-sm text-[#7C7D7D] mt-0.5">Manage your AI provider credentials</p>
            </div>
            <div className="flex items-center gap-3">
              
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2E2E2E] hover:bg-[#3A3A3A] text-[#E6E6E6] font-semibold transition-all duration-300"
              >
                <Plus size={18} />
                Create Config
              </button>
            </div>
          </div>

          {/* Filter & Group Controls */}
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-white">Group by</span>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#353535] border border-[#4A4A4A] text-white hover:text-[#A4A4A4] hover:bg-[#4A4A4A] transition-colors text-sm">
                  {groupBy === "provider" ? "🔹 Provider" : "🏗️ Model"}
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white">Filter by</span>
              <div className="relative">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-3 py-1.5 rounded-md bg-[#353535] border border-[#4A4A4A] text-white appearance-none cursor-pointer hover:bg-[#4A4A4A] focus:outline-none transition-colors text-sm"
                >
                  <option value="all" className="text-white">All Providers</option>
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="claude">Claude</option>
                  <option value="anthropic">Anthropic</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Table/List View */}
        {configs.length === 0 ? (
          <div className="text-center py-16 px-6 font-poppins">
            <div className="inline-flex p-4 rounded-full bg-zinc-800/50 mb-4">
              <Sparkles size={40} className="text-zinc-600" />
            </div>
            <p className="text-zinc-300 text-lg mb-2 font-medium">No configurations yet</p>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">Create your first LLM provider configuration to get started with your AI setup</p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2E2E2E] hover:bg-[#3A3A3A] text-[#E6E6E6] font-semibold transition-colors border border-[#4A4A4A]"
            >
              <Plus size={16} />
              Create Configuration
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto font-poppins">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#4A4A4A]">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-[#6B6B6B]">Provider</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-[#6B6B6B]">API Key</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-[#6B6B6B]">Model</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-[#6B6B6B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {configs.map((config) => {
                  const colors = providerColors[config.provider] || providerColors.Gemini
                  return (
                    <tr
                      key={config.id}
                      className="border-b border-[#4A4A4A] hover:bg-[#353535] transition-colors font-poppins"
                    >
                      {/* Provider column (keep original color) */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-blue-300 font-medium text-sm">{config.provider}</p>
                          <p className={`text-xs text-blue-500/60`}>Active</p>
                        </div>
                      </td>
                      {/* API Key column (grey) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-white bg-[#3A3A3A]/40 px-2 py-1 rounded border border-[#4A4A4A]/50">
                            {'•'.repeat(16)}
                          </code>
                        </div>
                      </td>
                      {/* Model column (blue matching dark bg) */}
                      <td className="py-4 px-4">
                        <p className="text-sm text-[#5B9FD8] font-medium">{config.model}</p>
                      </td>
                      {/* Actions column (white) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(config)}
                            className="p-2 rounded-lg text-white bg-[#2E2E2E] hover:bg-[#3A3A3A] transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(config.apiKey)
                            }}
                            className="p-2 rounded-lg text-white bg-[#2E2E2E] hover:bg-[#3A3A3A] transition-colors"
                            title="Copy"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(config.id)}
                            className="p-2 rounded-lg text-white bg-[#2E2E2E] hover:bg-[#3A3A3A] transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-lg w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#2A2A2A] bg-[#0F0F0F]">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Edit Configuration" : "Create a new key"}
              </h2>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 bg-[#0F0F0F]">
              {/* Key Name Dropdown */}
              <div>
                <label className="block text-sm font-medium text-[#A4A4A4] mb-2">
                  Name your key
                </label>
                <div className="relative">
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#121212] border border-[#121212] rounded-lg text-[#A4A4A4] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#40507A]/20 transition-all text-sm"
                  >
                    {providers.map((p) => (
                      <option key={p} value={p}>
                        {p} API Key
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#616161] pointer-events-none" size={16} />
                </div>
              </div>

              {/* Project Selector */}
              <div>
                <label className="block text-sm font-medium text-[#A4A4A4] mb-2">
                  Model Name
                </label>
                <div className="relative">
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#121212] border border-[#121212] rounded-lg text-[#A4A4A4] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#40507A]/20 transition-all text-sm"
                  >
                    {models[formData.provider].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#616161] pointer-events-none" size={16} />
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-sm font-medium text-[#A4A4A4] mb-2">
                  API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#616161]" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder={`Paste your ${formData.provider} API key`}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#121212] border border-[#121212] rounded-lg text-[#A4A4A4] placeholder:text-[#636363] focus:outline-none focus:ring-1 focus:ring-[#40507A]/20 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#616161] hover:text-[#A4A4A4] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#2A2A2A] flex gap-2 justify-end bg-[#0F0F0F]">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-[#2A2A2A] text-[#A4A4A4] font-medium hover:bg-[#1A1A1A] transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#353535] text-[#E6E6E6] font-medium transition-all text-sm"
              >
                {editingId ? "Update" : "Create key"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
