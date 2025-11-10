import toast from 'react-hot-toast'

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#10B981',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  })
}

export const showError = (message: string, reason?: string) => {
  const fullMessage = reason ? `${message}\nReason: ${reason}` : message
  toast.error(fullMessage, {
    duration: 6000,
    position: 'top-right',
    style: {
      background: '#EF4444',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '400px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  })
}

export const showWarning = (message: string) => {
  toast(message, {
    duration: 5000,
    position: 'top-right',
    icon: '⚠️',
    style: {
      background: '#F59E0B',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
    },
  })
}

export const showInfo = (message: string) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      background: '#3B82F6',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
    },
  })
}

export const showLoading = (message: string) => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#6B7280',
      color: '#fff',
      borderRadius: '8px',
      padding: '16px',
    },
  })
}

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId)
}