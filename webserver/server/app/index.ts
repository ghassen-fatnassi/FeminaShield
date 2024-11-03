import express from 'express'

import morgan from 'morgan'
import cors from 'cors'
import authRouter from './routers/auth.js'
import { protect } from './utils/auth.js';
import UserRouter from './resources/user/user.router.js'

import RoadmapRouter from './resources/roadmaps/roadmap.router.js'



export const app = express()


app.disable('x-powered-by')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use(authRouter)

app.use('/api/v1', protect)
app.use('/api/v1/user', UserRouter)
app.use('/api/v1/roadmaps',RoadmapRouter)

app.listen(3000,() => {
    console.log("server started on port 3000")
})

