import { useSupport } from "@/hooks/support/use-support"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Send } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SupportForm() {
  const {
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
    setFiles,
    removeFileAt,
    submitting,
    submit,
  } = useSupport()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Contact Support
        </CardTitle>
        <CardDescription>
          Submit your request. You will receive a response within 72 hours via
          email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as any)}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature request</SelectItem>
                <SelectItem value="bug">Bug report</SelectItem>
                <SelectItem value="streamer">Streamer badge request</SelectItem>
                <SelectItem value="restriction">Restriction appeal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              className="min-h-32 w-full rounded-md border bg-transparent p-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attachments">
              Attachments (optional, up to 5 files, 5MB each)
            </Label>
            <Input
              id="attachments"
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-muted-foreground file:border-input file:text-foreground p-0 pr-3 italic file:me-3 file:h-full file:border-0 file:border-e file:border-solid file:bg-primary file:text-primary-foreground file:px-3 file:text-sm file:font-medium file:not-italic file:leading-none file:py-2.5 file:hover:bg-primary/90 file:transition-colors"
            />
            <div className="text-xs text-muted-foreground mb-2">
              Attachments are privately stored and only visible to
              administrators.
            </div>
            {files.length > 0 && (
              <div className="grid gap-2">
                {files.map((f, i) => (
                  <div
                    key={`${f.name}-${f.size}-${(f as any).lastModified ?? 0}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="truncate mr-3">{f.name}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFileAt(i)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                submitting ||
                !username.trim() ||
                !email.trim() ||
                !subject.trim() ||
                !message.trim() ||
                !category
              }
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
