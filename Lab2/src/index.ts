import express from 'express'
import {Request, Response} from 'express'
import  Note  from '../Note'

const app = express()

const notes: Note[] = []

app.use(express.json())

app.get('/note/:id', function (req: Request, res: Response) {
  const note = notes.find(a => a.id === req.body.id)
  if(note === undefined) {
    res.status(404).send('Note does not exist')
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

app.put('/note/:id', function (req: Request, res: Response) {
  const note: Note = req.body
  if(note.title === undefined) {
      res.status(400).send('Note title is undefined')
  } else if(note.content === undefined) {
      res.status(400).send('Note content is undefined')
  } else if(note.id === undefined) {
      res.status(400).send('Note id is undefined')
  } else {
      let oldNote = notes.find(a => a.id === note.id)
      if(oldNote === undefined) {
        res.status(404).send('Note does not exist')
      } else
      oldNote = note;
      res.status(201).send(note)
  }
})

app.delete('/note/:id', function (req: Request, res: Response){
    const note = notes.find(a => a.id === req.body.id)
    if(note === undefined) {
        res.status(400).send('Note does not exist')
    }
    else {
        notes.splice(req.body.id, 1)
        res.status(204).send(note)
    }
})

app.listen(3000)