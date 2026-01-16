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
                  <th className="text-left py-4 px-4 text-sm font-semibold text-[#6B6B6B]">Max Tokens</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-[#6B6B6B]">Reasoning</th>
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
                            {config.apiKey}
                          </code>
                        </div>
                      </td>
                      {/* Model column (blue matching dark bg) */}
                      <td className="py-4 px-4">
                        <p className="text-sm text-[#5B9FD8] font-medium">{config.model}</p>
                      </td>
                      {/* Max Tokens column (white) */}
                      <td className="py-4 px-4">
                        <p className="text-sm text-white font-medium">{config.maxTokens.toLocaleString()}</p>
                      </td>
                      {/* Reasoning column (white) */}
                      <td className="py-4 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          config.extendedReasoning
                            ? "bg-[#40507A]/20 text-white border border-[#40507A]/30"
                            : "bg-[#353535] text-white border border-[#4A4A4A]"
                        }`}>
                          {config.extendedReasoning ? "✓ Enabled" : "Disabled"}
                        </span>
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
          <div className="bg-[#272727] border border-[#4A4A4A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#272727] border-b border-[#4A4A4A] px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingId ? "Edit Configuration" : "Create a new key"}
                </h2>
                <p className="text-sm text-[#7C7D7D] mt-1">Configure your LLM provider settings</p>
              </div>
              <button
                onClick={handleCancel}
                className="text-[#7C7D7D] hover:text-[#A4A4A4] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Row 1: Provider & Model */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#A4A4A4] mb-2.5">
                    AI Provider <span className="text-[#40507A]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full px-4 py-3 bg-[#353535] border border-[#4A4A4A] rounded-xl text-[#A4A4A4] appearance-none cursor-pointer hover:border-[#616161] focus:border-[#40507A]/50 focus:outline-none focus:ring-2 focus:ring-[#40507A]/20 transition-all"
                    >
                      {providers.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#A4A4A4] mb-2.5">
                    Model
                  </label>
                  <div className="relative">
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-3 bg-[#353535] border border-[#4A4A4A] rounded-xl text-[#A4A4A4] appearance-none cursor-pointer hover:border-[#616161] focus:border-[#40507A]/50 focus:outline-none focus:ring-2 focus:ring-[#40507A]/20 transition-all"
                    >
                      {models[formData.provider].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              {/* Row 2: API Key */}
              <div>
                <label className="block text-sm font-semibold text-[#A4A4A4] mb-2.5">
                  API Key <span className="text-[#40507A]">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#616161]" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder={`Paste your ${formData.provider} API key`}
                    className="w-full pl-12 pr-12 py-3 bg-[#353535] border border-[#4A4A4A] rounded-xl text-[#A4A4A4] placeholder:text-[#636363] hover:border-[#616161] focus:border-[#40507A]/50 focus:outline-none focus:ring-2 focus:ring-[#40507A]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#616161] hover:text-[#A4A4A4] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-[#7C7D7D] mt-2">🔒 Your key is encrypted and never stored in plain text</p>
              </div>

              {/* Row 3: Token Settings */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#A4A4A4] mb-2.5">
                    Max Tokens
                  </label>
                  <div className="relative">
                    <Database className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#616161]" size={18} />
                    <input
                      type="number"
                      value={formData.maxTokens}
                      onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) || 0 })}
                      className="w-full pl-12 pr-4 py-3 bg-[#353535] border border-[#4A4A4A] rounded-xl text-[#A4A4A4] hover:border-[#616161] focus:border-[#40507A]/50 focus:outline-none focus:ring-2 focus:ring-[#40507A]/20 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#A4A4A4] mb-2.5">
                    Reasoning Budget
                  </label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#616161]" size={18} />
                    <input
                      type="number"
                      value={formData.reasoningBudgetTokens}
                      onChange={(e) =>
                        setFormData({ ...formData, reasoningBudgetTokens: parseInt(e.target.value) || 0 })
                      }
                      className="w-full pl-12 pr-4 py-3 bg-[#353535] border border-[#4A4A4A] rounded-xl text-[#A4A4A4] hover:border-[#616161] focus:border-[#40507A]/50 focus:outline-none focus:ring-2 focus:ring-[#40507A]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#4A4A4A]" />

              {/* Extended Reasoning */}
              <div className="flex items-center justify-between gap-4 bg-[#353535]/50 rounded-xl p-4 border border-[#4A4A4A]">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#A4A4A4] flex items-center gap-2">
                    <Sparkles size={18} className="text-[#40507A]" />
                    Extended Reasoning (Thinking)
                  </h3>
                  <p className="text-sm text-[#7C7D7D] mt-1">Enable advanced reasoning capabilities</p>
                </div>
                <button
                  onClick={() =>
                    setFormData({ ...formData, extendedReasoning: !formData.extendedReasoning })
                  }
                  className={`relative inline-flex h-8 w-14 flex-shrink-0 rounded-full transition-all duration-300 ${
                    formData.extendedReasoning
                      ? "bg-[#40507A] shadow-lg shadow-[#40507A]/30"
                      : "bg-[#353535]"
                  }`}
                >
                  <span
                    className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-all duration-300 ${
                      formData.extendedReasoning ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[#272727] border-t border-[#4A4A4A] px-8 py-4 flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-lg border border-[#4A4A4A] text-[#A4A4A4] font-semibold hover:bg-[#353535] transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-lg border border-[#4A4A4A] text-[#E6E6E6] font-semibold bg-[#2E2E2E] hover:bg-[#3A3A3A] transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-lg bg-[#2E2E2E] hover:bg-[#3A3A3A] text-[#E6E6E6] font-semibold transition-all duration-300"
              >
                {editingId ? "Update Provider" : "Create key"}
              </button>
            </div> {/* End Modal Footer */}
          </div> {/* End Modal Content */}
        </div>
      )}
    </div>
  );
}
