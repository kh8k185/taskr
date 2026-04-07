import { useRef, useState } from 'react'
import { Camera, Loader } from 'lucide-react'
import styles from './AvatarUpload.module.css'

export default function AvatarUpload({ profile, onUpload, size = 'md' }) {
  const inputRef  = useRef(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type + size
    if (!file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return }

    // Show preview instantly
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    try {
      await onUpload(file)
    } catch (err) {
      console.error('Avatar upload failed:', err)
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  const imgSrc = preview || profile?.avatar_url

  return (
    <div
      className={`${styles.wrap} ${styles[size]}`}
      onClick={() => inputRef.current?.click()}
      title="Click to change avatar"
    >
      {imgSrc ? (
        <img src={imgSrc} alt="avatar" className={styles.img} />
      ) : (
        <div className={styles.initial}>
          {profile?.avatar_initial || profile?.display_name?.charAt(0).toUpperCase() || '?'}
        </div>
      )}

      <div className={styles.overlay}>
        {loading
          ? <Loader size={size === 'lg' ? 18 : 13} className={styles.spin} />
          : <Camera size={size === 'lg' ? 18 : 13} />
        }
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hidden}
        onChange={handleFile}
      />
    </div>
  )
}
