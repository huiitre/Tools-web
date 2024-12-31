export const copyToClipboard = async(text: string) => {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => false)
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()

    try {
      const success = document.execCommand('copy')
      if (success)
        return Promise.resolve(true)
      else
        return Promise.reject(false)
    } catch (e) {
      return Promise.reject(false)
    } finally {
      document.body.removeChild(textarea)
    }
  }
}