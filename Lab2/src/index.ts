import express from 'express'
import {Request, Response} from 'express'
import  Note  from '../Note'

const app = express()

const notes: Note[] = []

app.use(express.json())

app.get('/', function (req: Request, res: Response) {
  res.send('GET Hello World')
})
app.post('/', function (req: Request, res: Response) {
  console.log(req.body) // e.x. req.body.title 
  res.sendStatus(200).send('POST Hello World')
})

app.listen(3000)