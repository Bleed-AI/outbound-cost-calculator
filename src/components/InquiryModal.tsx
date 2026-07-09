'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { spring, modalBackdrop, modalContent } from '@/lib/motion'

const BOOK_CALL_URL = 'https://bleedai.com/book-call/'

export type InquiryKind = 'package' | 'trial' | 'sprint'

export interface InquiryContext {
  kind: InquiryKind
  /** Human-readable tier identifier — shown to the user + included in the email. */
  tierLabel: string
  /** Optional price reference — e.g. "$2,450/mo" — shown in the modal header. */
  priceLabel?: string
  /** Optional extra context shipped to the email (e.g. {tier: 'standard'}). */
  metadata?: Record<string, string | number | boolean>
}

interface InquiryModalProps {
  context: InquiryContext
  onClose: () => void
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

function isValidDomain(value: string): boolean {
  const v = value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  return v.length > 0 && v.includes('.') && !v.includes(' ')
}

const KIND_TITLES: Record<InquiryKind, string> = {
  package: 'Get Started',
  trial: 'Start Your Trial',
  sprint: 'Start Your Sprint',
}

const KIND_SUBTITLES: Record<InquiryKind, string> = {
  package: "Tell us about your business so we can hit the ground running on your monthly outbound.",
  trial: "Tell us about your business, we'll kick off with a short call to align on ICPs and offer, then launch experiments same day.",
  sprint: "Tell us about your business. The order holds your build slot; the kickoff call finalizes scope and writes your success bar together.",
}

const KIND_SUBMIT_LABELS: Record<InquiryKind, string> = {
  package: 'Send Order & Continue →',
  trial: 'Place Order & Continue →',
  sprint: 'Place Order & Continue →',
}

const KIND_SUCCESS_TITLES: Record<InquiryKind, string> = {
  package: "Order received, let's kick this off",
  trial: "Trial order received, let's launch",
  sprint: "Sprint order received, let's kick off",
}

const KIND_SUCCESS_BODIES: Record<InquiryKind, string> = {
  package: "Your details are in. Pick a time below and we'll be prepared with context on your business.",
  trial: "Your trial order is in. Pick a kickoff time below, we usually launch the same day or next.",
  sprint: "Your Sprint order is in. Pick a kickoff time below. Once the invoice clears we hold your build slot and start the warmup clock.",
}

export function InquiryModal({ context, onClose }: InquiryModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyDomain, setCompanyDomain] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    isValidDomain(companyDomain) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    setSubmitState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: context.kind,
          tierLabel: context.tierLabel,
          priceLabel: context.priceLabel ?? '',
          metadata: context.metadata ?? {},
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          companyDomain: companyDomain.trim(),
          email: email.trim(),
          description: description.trim(),
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

  const inputClasses = "w-full bg-[var(--color-bg)] border border-[var(--color-border-hover)] rounded-[var(--radius-inner)] px-3 py-2.5 text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-ghost)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={spring}
          className="relative w-full max-w-md"
        >
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-px">
            <div className="rounded-[calc(var(--radius-card)-1px)] bg-[var(--color-surface-1)] overflow-hidden">
              <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <div className="min-w-0">
                  <h3 className="text-[var(--color-text)] font-semibold">{KIND_TITLES[context.kind]}</h3>
                  <p className="text-[var(--color-text-dim)] text-xs mt-0.5 truncate">
                    <span className="text-[var(--color-text-muted)] font-medium">{context.tierLabel}</span>
                    {context.priceLabel && (
                      <>
                        <span className="text-[var(--color-text-ghost)] mx-1.5">·</span>
                        <span className="text-[var(--color-brand)] font-medium font-[family-name:var(--font-mono)]">{context.priceLabel}</span>
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors p-1 -mr-1 flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5">
                <AnimatePresence mode="wait">
                  {submitState === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={spring}
                      className="text-center py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                        className="w-12 h-12 rounded-full bg-[var(--color-success-bg)] border border-[rgba(52,211,153,0.15)] flex items-center justify-center mx-auto mb-4"
                      >
                        <svg className="w-6 h-6 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                      <h4 className="text-[var(--color-text)] font-semibold text-lg mb-2">{KIND_SUCCESS_TITLES[context.kind]}</h4>
                      <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">
                        {KIND_SUCCESS_BODIES[context.kind]}
                      </p>
                      <motion.a
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        href={BOOK_CALL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-semibold py-3 px-6 rounded-[var(--radius-inner)] transition-colors text-sm text-center mb-3"
                      >
                        Pick a Kickoff Time →
                      </motion.a>
                      <button
                        onClick={onClose}
                        className="w-full px-6 py-2.5 rounded-[var(--radius-inner)] border border-[var(--color-border-hover)] text-[var(--color-text-dim)] text-sm hover:text-[var(--color-text-muted)] hover:border-[var(--color-border-active)] transition-colors"
                      >
                        Close
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <p className="text-[var(--color-text-muted)] text-sm">
                        {KIND_SUBTITLES[context.kind]}
                      </p>

                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-[var(--color-text-muted)] text-xs font-medium block mb-1.5">First Name *</label>
                          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" className={inputClasses} required />
                        </div>
                        <div className="flex-1">
                          <label className="text-[var(--color-text-muted)] text-xs font-medium block mb-1.5">Last Name *</label>
                          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" className={inputClasses} required />
                        </div>
                      </div>

                      <div>
                        <label className="text-[var(--color-text-muted)] text-xs font-medium block mb-1.5">Company Website *</label>
                        <input type="text" value={companyDomain} onChange={(e) => setCompanyDomain(e.target.value)} placeholder="acmecorp.com" className={inputClasses} required />
                      </div>

                      <div>
                        <label className="text-[var(--color-text-muted)] text-xs font-medium block mb-1.5">Email Address *</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@acmecorp.com" className={inputClasses} required />
                      </div>

                      <div>
                        <label className="text-[var(--color-text-muted)] text-xs font-medium block mb-1.5">
                          Brief Project Description
                          <span className="text-[var(--color-text-ghost)] ml-1">(optional)</span>
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="What's your offer and target market?"
                          rows={3}
                          className={`${inputClasses} resize-none`}
                        />
                      </div>

                      {submitState === 'error' && (
                        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-[var(--radius-inner)] px-3 py-2">
                          {errorMsg}
                        </p>
                      )}

                      <motion.button
                        type="submit"
                        disabled={!isValid || submitState === 'loading'}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-[var(--radius-inner)] transition-colors text-sm"
                      >
                        {submitState === 'loading' ? 'Sending...' : KIND_SUBMIT_LABELS[context.kind]}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
