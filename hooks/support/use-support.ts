import { useEffect, useState } from "react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import { useUser } from "@/hooks/login/use-user"

export type SupportCategory = "feature" | "bug" | "streamer" | undefined

export function useSupport() {
  const { user, loading: userLoading } = useUser()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [category, setCategory] = useState<SupportCategory>(undefined)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && !userLoading) {
      setUsername(user.name || "")
      setEmail((user as any).email || "")
    }
  }, [user, userLoading])

  const onFilesChange = (list: FileList | File[] | null) => {
    if (!list || ("length" in list && list.length === 0)) {
      setFiles([])
      return
    }
    const incoming = Array.from(list as FileList | File[])

    for (const f of incoming) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error("Each attachment must be ≤ 5MB", toastStyles.error)
        return
      }
    }

    const key = (f: File) =>
      `${f.name}|${f.size}|${(f as any).lastModified ?? 0}`
    const map = new Map<string, File>()
    for (const f of files) map.set(key(f), f)
    for (const f of incoming) map.set(key(f), f)
    const merged = Array.from(map.values())
    if (merged.length > 5) {
      toast.error("You can attach up to 5 files", toastStyles.error)
    }
    setFiles(merged.slice(0, 5))
  }

  const removeFileAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const submit = async () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !subject.trim() ||
      !message.trim() ||
      !category
    ) {
      toast.error("Please complete all required fields", toastStyles.error)
      return
    }
    setSubmitting(true)
    try {
      const form = new FormData()
      form.append("username", username.trim())
      form.append("email", email.trim())
      form.append("category", category)
      form.append("subject", subject.trim())
      form.append("message", message.trim())
      for (const f of files) form.append("attachments", f)

      const res = await fetch("/api/support", { method: "POST", body: form })
      const data = await res.json()
      if (res.ok) {
        toast.success(
          "Support request sent! You will receive a response within 72 hours via email.",
          toastStyles.success,
        )
        setSubject("")
        setMessage("")
        setFiles([])
      } else {
        toast.error(
          data.error || "Failed to send support request",
          toastStyles.error,
        )
      }
    } catch (err) {
      toast.error("Failed to send support request", toastStyles.error)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    username,
    setUsername,
    email,
    setEmail,
    category,
    setCategory,
    subject,
    setSubject,
    message,
    setMessage,
    files,
    setFiles: onFilesChange,
    removeFileAt,
    submitting,
    submit,
  }
}
