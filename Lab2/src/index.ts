import express from 'express'
import {Request, Response} from 'express'
import  Note  from '../Note'

const app = express()

const notes: Note[] = []

app.use(express.json())

app.get('/note/:id', function (req: Request, res: Response) {
  const note = notes.find(a => a.id === req.body.id)
  if(note === undefined) {
    res.status(400).send('Note does not exist')
  } else {
    res.status(200).send(note)
  }
})

app.post('/note', function (req: Request, res: Response) {
  const note: Note = req.body
  if(note.title === undefined) {
      res.status(400).send('Note title is undefined')
  } else if(note.content === undefined) {
      res.status(400).send('Note content is undefined')
  } else {
      note.id = Date.now()
      notes.push(note)
      res.status(201).send(note)
  }
})

app.listen(3000)