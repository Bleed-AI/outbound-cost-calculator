'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/pricing'
import { spring, modalBackdrop, modalContent } from '@/lib/motion'
import type { PricingResult } from '@/lib/types'

interface OrderModalProps {
  result: PricingResult
  month2Result: PricingResult | null
  shareUrl: string
  coupon: string
  onClose: () => void
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

function isValidDomain(value: string): boolean {
  const v = value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  return v.length > 0 && v.includes('.') && !v.includes(' ')
}

export function OrderModal({ result, month2Result, shareUrl, coupon, onClose }: OrderModalProps) {
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
      const res = await fetch('/api/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          companyDomain: companyDomain.trim(),
          email: email.trim(),
          description: description.trim(),
          total: result.total,
          lineItems: result.lineItems,
          discountAmount: result.discountAmount,
          discountPercent: result.discountPercent,
          couponDiscountAmount: result.couponDiscountAmount,
          couponDiscountPercent: result.couponDiscountPercent,
          couponCode: coupon,
          upworkFeeAmount: result.upworkFeeAmount,
          totalEmails: result.totalEmails,
          monthlyRecurringTotal: result.monthlyRecurringTotal,
          oneTimeTotal: result.oneTimeTotal,
          month2MonthlyRecurring: month2Result ? month2Result.monthlyRecurringTotal : result.monthlyRecurringTotal,
          isFirstMonthBranded: result.isFirstMonthBranded ?? false,
          month1ActualEmails: result.month1ActualEmails ?? 0,
          brandedSetupFee: result.brandedSetupFee ?? 0,
          inboxesNeeded: result.inboxesNeeded ?? 0,
          domainsNeeded: result.domainsNeeded ?? 0,
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

  const inputClasses = "w-full bg-[var(--color-bg)] border border-[var(--color-border-hover)] rounded-[var(--radius-inner)] px-3 py-2.5 text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-ghost)] focus:outline-none focus:border-[var(--color-border-active)] transition-colors"

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Backdrop */}
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={spring}
          className="relative w-full max-w-md"
        >
          {/* Double-bezel card */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-0)] p-px">
            <div className="rounded-[calc(var(--radius-card)-1px)] bg-[var(--color-surface-1)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <div>
                  <h3 className="text-[var(--color-text)] font-semibold">Submit Your Order</h3>
                  <p className="text-[var(--color-text-dim)] text-xs mt-0.5">
                    Total: <span className="text-[var(--color-text)] font-medium font-[family-name:var(--font-mono)]">{formatCurrency(result.total)}</span>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors p-1"
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
                      <h4 className="text-[var(--color-text)] font-semibold text-lg mb-2">Order Sent!</h4>
                      <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">
                        Your proposal has been submitted. Check your inbox for a confirmation email with your full breakdown and next steps.
                      </p>
                      <motion.a
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        href="https://calendly.com/bleedai/pilot-campaign-launch"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-semibold py-3 px-6 rounded-[var(--radius-inner)] transition-colors text-sm text-center mb-3"
                      >
                        Book Your Onboarding Call
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
                        Enter your details and we&apos;ll send a full breakdown to your inbox with next steps.
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
                          placeholder="Briefly describe your offer and target market..."
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
                        {submitState === 'loading' ? 'Sending...' : 'Send Order'}
                      </motion.button>

                      <p className="text-[var(--color-text-ghost)] text-xs text-center">
                        Your full configuration URL is included in the email so everything is captured.
                      </p>
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
