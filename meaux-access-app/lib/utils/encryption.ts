import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY || 'default-key-change-in-production'

export function encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

export function decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
}

export function maskKey(key: string): string {
    if (key.length <= 8) return '••••••••'
    return `${key.slice(0, 4)}${'•'.repeat(key.length - 8)}${key.slice(-4)}`
}

