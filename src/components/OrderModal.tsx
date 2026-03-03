'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/pricing'
import type { PricingResult } from '@/lib/types'

interface OrderModalProps {
  result: PricingResult
  shareUrl: string
  onClose: () => void
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export function OrderModal({ result, shareUrl, onClose }: OrderModalProps) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isValid = name.trim() && company.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    setSubmitState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          total: result.total,
          lineItems: result.lineItems,
          discountAmount: result.discountAmount,
          discountPercent: result.discountPercent,
          shareUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Something went wrong. Please try again.')
      }

      setSubmitState('success')
    } catch (err) {
      setSubmitState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0d0d14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <h3 className="text-white font-semibold">Submit Your Order</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Total: <span className="text-white font-medium">{formatCurrency(result.total)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {submitState === 'success' ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">Order Sent!</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your proposal has been submitted. Check your inbox for a confirmation email.
                We&apos;ll be in touch shortly.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-lg bg-[#B1130F] text-white text-sm font-medium hover:bg-[#d41510] transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-400 text-sm">
                Enter your details and we&apos;ll send a full breakdown to your inbox and follow up with next steps.
              </p>

              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full bg-[#050508] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#B1130F]/60 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">Company Name *</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-[#050508] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#B1130F]/60 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@acmecorp.com"
                  className="w-full bg-[#050508] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#B1130F]/60 transition-colors"
                  required
                />
              </div>

              {submitState === 'error' && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={!isValid || submitState === 'loading'}
                className="w-full bg-[#B1130F] hover:bg-[#d41510] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
              >
                {submitState === 'loading' ? 'Sending...' : 'Send Order'}
              </button>

              <p className="text-gray-600 text-xs text-center">
                Your full configuration URL is included in the email so everything is captured.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
