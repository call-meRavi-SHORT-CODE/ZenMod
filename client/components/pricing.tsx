"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Free",
    icon: "",
    description: "For vibing, learning, and shipping your first ideas",
    price: { monthly: 0, yearly: 0 },
    features: ["1 workspace", "AI code generation (limited)", "Live preview", "Community support"],
    cta: "Start Vibing",
    highlighted: false,
  },
  {
    name: "Pro",
    icon: "",
    description: "For builders who don't want limits",
    price: { monthly: 29, yearly: 24 },
    features: ["Unlimited projects", "Advanced AI agent", "Faster runtimes", "File exports", "Priority support"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Teams",
    icon: "",
    description: "For squads shipping at scale",
    price: { monthly: null, yearly: null },
    features: ["Shared workspaces", "Custom agents", "Access control", "Audit logs", "SLA uptime"],
    cta: "Talk to Us",
    highlighted: false,
  },
]

function BorderBeam() {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
      <div
        className="absolute w-24 h-24 bg-white/20 blur-xl border-beam"
        style={{
          offsetPath: "rect(0 100% 100% 0 round 16px)",
        }}
      />
    </div>
  )
}

export function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div
          className="text-center mb-12"
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-instrument-sans)" }}
          >
            Pricing that doesn't kill the vibe
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-8">Free to start. Upgrade when you're ready.</p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 rounded-full bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${billingCycle === "monthly" ? "text-white" : "text-zinc-400"
                }`}
            >
              {billingCycle === "monthly" && (
                <motion.div
                  layoutId="billing-toggle"
                  className="absolute inset-0 bg-zinc-800 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">Monthly</span>
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${billingCycle === "yearly" ? "text-white" : "text-zinc-400"
                }`}
            >
              {billingCycle === "yearly" && (
                <motion.div
                  layoutId="billing-toggle"
                  className="absolute inset-0 bg-zinc-800 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">Yearly</span>
              <span className="relative z-10 ml-2 px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                save 20%
              </span>
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${plan.highlighted
                ? "bg-zinc-900 border-zinc-700"
                : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600"
                }`}
            >
              {plan.highlighted && <BorderBeam />}

              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-zinc-950 text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="text-2xl mb-2">{plan.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-zinc-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  {plan.price.monthly !== null ? (
                    <>
                      <span className="text-4xl font-bold text-white">${plan.price[billingCycle]}</span>
                      {plan.price.monthly > 0 && <span className="text-zinc-400 text-sm">/month</span>}
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-white">Custom</span>
                  )}
                </div>
                {billingCycle === "yearly" && plan.price.yearly !== null && plan.price.yearly > 0 && (
                  <p className="text-xs text-zinc-500 mt-1">Billed annually (${plan.price.yearly * 12}/year)</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={1.5} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-full ${plan.highlighted
                  ? "shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200"
                  : "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
                  }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
