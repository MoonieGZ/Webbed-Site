require("dotenv").config()
const express = require("express")
const http = require("http")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const { Server } = require("socket.io")
const {
  selectRandomCharacters,
  selectRandomBosses,
} = require("./gi-randomizer")

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
  if (!io.lobbies) {
    io.lobbies = Object.create(null)
  }

  function getLobbySafe(lobbyId) {
    const lobby = io.lobbies[lobbyId]
    if (!lobby) return null
    lobby.members = Array.isArray(lobby.members) ? lobby.members : []
    return lobby
  }

  function emitLobbyState(lobbyId) {
    const lobby = getLobbySafe(lobbyId)
    if (!lobby) return
    const payload = {
      ok: true,
      lobby: {
        lobbyId: lobby.lobbyId,
        hostId: lobby.hostId,
        members: lobby.members,
        currentRoll: lobby.currentRoll || {},
        privacy: lobby.privacy || "invite-only",
      },
    }
    io.to(lobbyId).emit("lobbyState", payload)
    ;(lobby.members || []).forEach((uid) => {
      io.to(`user:${uid}`).emit("lobbyState", payload)
    })
  }

  function removeMemberFromLobby(lobby, memberUserId) {
    lobby.members = lobby.members.filter((m) => m !== memberUserId)
    if (lobby.hostId === memberUserId) {
      lobby.hostId = lobby.members[0] || null
    }
    if (lobby.members.length === 0) {
      delete io.lobbies[lobby.lobbyId]
    }
  }

  socket.on("createLobby", (payload, cb) => {
    try {
      const privacy = payload?.privacy || "invite-only"
      const lobbyId = `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`
      const lobby = {
        lobbyId,
        hostId: userId,
        members: [userId],
        currentRoll: {},
        privacy,
      }
      io.lobbies[lobbyId] = lobby
      socket.join(lobbyId)
      cb?.({ ok: true, lobbyId, hostId: lobby.hostId })
      emitLobbyState(lobbyId)
    } catch (e) {
      cb?.({ ok: false, error: "Failed to create lobby" })
    }
  })

  socket.on("joinLobby", (payload, cb) => {
    try {
      const lobbyId = payload?.lobbyId
      if (!lobbyId) return cb?.({ ok: false, error: "Missing lobbyId" })
      const lobby = getLobbySafe(lobbyId)
      if (!lobby) return cb?.({ ok: false, error: "Lobby not found" })
      if (lobby.privacy === "closed" && lobby.hostId !== userId) {
        return cb?.({ ok: false, error: "Lobby is closed" })
      }
      if (lobby.members.length >= 4)
        return cb?.({ ok: false, error: "Lobby is full" })

      if (!lobby.members.includes(userId)) {
        lobby.members.push(userId)
      }
      socket.join(lobbyId)
      cb?.({
        ok: true,
        lobbyId,
        hostId: lobby.hostId,
        members: lobby.members,
        currentRoll: lobby.currentRoll || {},
        privacy: lobby.privacy || "invite-only",
      })
      emitLobbyState(lobbyId)
    } catch (e) {
      cb?.({ ok: false, error: "Failed to join lobby" })
    }
  })

  socket.on("leaveLobby", (payload, cb) => {
    try {
      const lobbyId = payload?.lobbyId
      if (!lobbyId) return cb?.({ ok: false, error: "Missing lobbyId" })
      const lobby = getLobbySafe(lobbyId)
      if (!lobby) return cb?.({ ok: true })
      removeMemberFromLobby(lobby, userId)
      socket.leave(lobbyId)
      cb?.({ ok: true })
      if (io.lobbies[lobbyId]) emitLobbyState(lobbyId)
    } catch (e) {
      cb?.({ ok: false, error: "Failed to leave lobby" })
    }
  })

  socket.on("lobbyState", (payload, cb) => {
    try {
      const lobbyId = payload?.lobbyId
      if (!lobbyId) return cb?.({ ok: false, error: "Missing lobbyId" })
      const lobby = getLobbySafe(lobbyId)
      if (!lobby) return cb?.({ ok: false, error: "Lobby not found" })
      cb?.({
        ok: true,
        lobby: {
          lobbyId: lobby.lobbyId,
          hostId: lobby.hostId,
          members: lobby.members,
          currentRoll: lobby.currentRoll || {},
          privacy: lobby.privacy || "invite-only",
        },
      })
    } catch (e) {
      cb?.({ ok: false, error: "Failed to load lobby state" })
    }
  })

  socket.on("rollCharacters", (payload, cb) => {
    try {
      const lobbyId = payload?.lobbyId
      const candidates = payload?.characters || []
      const settings = payload?.settings || null
      if (!lobbyId) return cb?.({ ok: false, error: "Missing lobbyId" })
      const lobby = getLobbySafe(lobbyId)
      if (!lobby) return cb?.({ ok: false, error: "Lobby not found" })
      if (lobby.hostId !== userId)
        return cb?.({ ok: false, error: "Only host can roll" })

      const result = selectRandomCharacters(candidates, settings)
      if (!Array.isArray(result))
        return cb?.({ ok: false, error: "Not enough characters or invalid settings" })
      lobby.currentRoll = { ...(lobby.currentRoll || {}), characters: result }
      io.to(lobbyId).emit("rolledCharacters", { ok: true, characters: result })
      cb?.({ ok: true, characters: result })
      emitLobbyState(lobbyId)
    } catch (e) {
      cb?.({ ok: false, error: "Failed to roll characters" })
    }
  })

  socket.on("rollBoss", (payload, cb) => {
    try {
      const lobbyId = payload?.lobbyId
      const candidates = payload?.bosses || []
      const settings = payload?.settings || null
      if (!lobbyId) return cb?.({ ok: false, error: "Missing lobbyId" })
      const lobby = getLobbySafe(lobbyId)
      if (!lobby) return cb?.({ ok: false, error: "Lobby not found" })
      if (lobby.hostId !== userId)
        return cb?.({ ok: false, error: "Only host can roll" })

      const result = selectRandomBosses(candidates, settings)
      if (!Array.isArray(result))
        return cb?.({ ok: false, error: "Not enough bosses or invalid settings" })
      // Store the last single boss or list; spec says single boss, but keep list to allow count>1
      const boss = result[0] || null
      lobby.currentRoll = { ...(lobby.currentRoll || {}), boss }
      io.to(lobbyId).emit("rolledBoss", { ok: true, boss })
      cb?.({ ok: true, boss })
      emitLobbyState(lobbyId)
    } catch (e) {
      cb?.({ ok: false, error: "Failed to roll boss" })
    }
  })

  socket.on("setLobbyPrivacy", (payload, cb) => {
    try {
      const lobbyId = payload?.lobbyId
      const privacy = payload?.privacy
      if (!lobbyId || !privacy) return cb?.({ ok: false, error: "Missing fields" })
      const lobby = getLobbySafe(lobbyId)
      if (!lobby) return cb?.({ ok: false, error: "Lobby not found" })
      if (lobby.hostId !== userId)
        return cb?.({ ok: false, error: "Only host can change privacy" })
      lobby.privacy = privacy
      cb?.({ ok: true })
      emitLobbyState(lobbyId)
    } catch (e) {
      cb?.({ ok: false, error: "Failed to change privacy" })
    }
  })

  socket.on("kickMember", (payload, cb) => {
    try {
      const lobbyId = payload?.lobbyId
      const memberUserId = String(payload?.memberUserId || "")
      if (!lobbyId || !memberUserId) return cb?.({ ok: false, error: "Missing fields" })
      const lobby = getLobbySafe(lobbyId)
      if (!lobby) return cb?.({ ok: false, error: "Lobby not found" })
      if (lobby.hostId !== userId) return cb?.({ ok: false, error: "Only host can exclude" })
      if (memberUserId === lobby.hostId) return cb?.({ ok: false, error: "Cannot exclude host" })
      if (!lobby.members.includes(memberUserId)) return cb?.({ ok: false, error: "User not in lobby" })

      io.to(`user:${memberUserId}`).emit("lobby:kicked", { ok: true, lobbyId })
      removeMemberFromLobby(lobby, memberUserId)

      for (const [sid, s] of io.sockets.sockets) {
        try {
          if (String(s?.data?.userId) === memberUserId) {
            s.leave(lobbyId)
          }
        } catch {}
      }

      cb?.({ ok: true })
      if (io.lobbies[lobbyId]) emitLobbyState(lobbyId)
    } catch (e) {
      cb?.({ ok: false, error: "Failed to exclude member" })
    }
  })

  socket.on("disconnect", () => {
    try {
      const lobbyIds = Object.keys(io.lobbies || {})
      for (const lobbyId of lobbyIds) {
        const lobby = io.lobbies[lobbyId]
        if (!lobby) continue
        if (lobby.members.includes(userId)) {
          const wasHost = lobby.hostId === userId
          removeMemberFromLobby(lobby, userId)
          socket.leave(lobbyId)
          if (io.lobbies[lobbyId]) {
            emitLobbyState(lobbyId)
            if (wasHost) {
              io.to(lobbyId).emit("lobby:host_left", {
                ok: true,
                lobbyId,
                hostId: lobby.hostId || null,
              })

              if (lobby.hostId) {
                io.to(`user:${lobby.hostId}`).emit("lobby:host_transfer", {
                  ok: true,
                  lobbyId,
                  hostId: lobby.hostId,
                })
              }
            }
          }
        }
      }
    } catch {}
  })
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