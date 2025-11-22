'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { ContactFormModal } from './ContactFormModal'

interface ContactModalContextType {
  openContactModal: () => void
  closeContactModal: () => void
}

const ContactModalContext = createContext<ContactModalContextType | undefined>(undefined)

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openContactModal = () => setIsOpen(true)
  const closeContactModal = () => setIsOpen(false)

  return (
    <ContactModalContext.Provider value={{ openContactModal, closeContactModal }}>
      {children}
      <ContactFormModal open={isOpen} onOpenChange={setIsOpen} />
    </ContactModalContext.Provider>
  )
}

export function useContactModal() {
  const context = useContext(ContactModalContext)
  if (!context) {
    throw new Error('useContactModal must be used within ContactModalProvider')
  }
  return context
}
