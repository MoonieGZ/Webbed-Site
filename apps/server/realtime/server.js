require("dotenv").config()
const express = require("express")
const http = require("http")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const { Server } = require("socket.io")

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "").split(",").filter(Boolean).length
      ? process.env.CORS_ORIGIN.split(",")
      : "*",
    credentials: true,
  }),
)

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: (process.env.CORS_ORIGIN || "").split(",").filter(Boolean).length
      ? process.env.CORS_ORIGIN.split(",")
      : "*",
    credentials: true,
  },
})

io.use((socket, next) => {
  try {
    const bearer = socket.handshake.headers["authorization"]
    const token =
      socket.handshake.auth?.token ||
      (bearer && bearer.startsWith("Bearer ") ? bearer.slice(7) : null)
    if (!token) return next(new Error("Unauthorized"))
    const payload = jwt.verify(token, process.env.WS_JWT_SECRET)
    socket.data.userId = String(payload.sub)
    next()
  } catch {
    next(new Error("Unauthorized"))
  }
})

io.on("connection", (socket) => {
  const userId = socket.data.userId
  const room = `user:${userId}`
  socket.join(room)
  socket.emit("connected", { ok: true })
})

app.post("/emit/friends/pending-count", (req, res) => {
  const adminKey = req.headers["x-admin-key"]
  if (!adminKey || adminKey !== process.env.WS_ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden" })
  }
  const { userId, count } = req.body || {}
  if (!userId || typeof count !== "number") {
    return res.status(400).json({ error: "Invalid body" })
  }
  io.to(`user:${userId}`).emit("friend:pending_count", { count })
  return res.json({ ok: true })
})

const port = Number(process.env.WS_PORT || 4001)
server.listen(port, () => {
  console.log(`Socket.IO server listening on :${port}`)
})