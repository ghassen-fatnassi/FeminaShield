import config from '../config/index.js'
import { User } from '../resources/user/user.model.js'
import jwt from 'jsonwebtoken'

export const newToken = user => {
  return jwt.sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  })
}

const invalid = { message: 'Invalid username or passoword' }

export const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })
  

export const signup = async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).send({ message: 'need username and password' })
  }

  const user = await User.findOne({ where: { username: req.body.username }})

  if (user) {
    return res.status(401).send(invalid)
  }

  try {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
      isAdmin: false,
    })
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (e) {
    return res.status(500).end()
  }
}

export const signin = async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).send({ message: 'need username and password' })
  }


  try {
    const user = await User.findOne({ where: { username: req.body.username, password: req.body.password }})

    if (!user) {
      return res.status(401).send(invalid)
    }

    const token = newToken(user)
    return res.status(200).send({ token })
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
}

export const protect = async (req, res, next) => {
  const bearer = req.headers.authorization

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).end()
  }

  const token = bearer.split('Bearer ')[1].trim()
  let payload
  try {
    payload = await verifyToken(token)
  } catch (e) {
    return res.status(401)
  }

  const user = await User.findOne({where: {id: payload.id}})

  if (!user) {
    return res.status(401)
  }

  req.user = user
  next()
}
