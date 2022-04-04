import express from "express";
import { Request, Response } from "express";
import Storage from "../Models/Storage";
import Note from "../Models/Note";
import Tag from "../Models/Tag";
import Repository from "../Repository";
import jwt from "jsonwebtoken";
import User from "../Models/User";

const app = express();

const repo: Repository = new Repository();
const registerUser = new User();
const secret = "abc123"

let storage: Storage;
repo.readStorage().then((a) => {
  if (a) {
    storage = JSON.parse(a);
  } else {
    storage = new Storage()
  }
});


app.use(express.json());

app.get("/note/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if (registerUser.IfUserIsAuthorized(authData, secret)) {
    const note = storage.notes.find((a) => a.id === +req.params.id && registerUser.notesIds.includes(+req.params.id));
    console.log(req);
    if (note === undefined) {
      res.status(404).send("Note does not exist");
    } else {
      res.status(200).send(note);
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
});

app.post("/note", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(registerUser.IfUserIsAuthorized(authData, secret)) {
    const note: Note = req.body;
    if (note.title === undefined) {
      res.status(400).send("Note title is undefined");
    } else if (note.content === undefined) {
      res.status(400).send("Note content is undefined");
    } else {
      console.log(note);
      if (note.tags !== undefined) {
        note.tags.forEach((tag) => {
          if (!storage.tags.find((a) => a.name === tag.name)) {
            const newTag: Tag = {
              id: Date.now(),
              name: tag.name,
            };
            storage.tags.push(newTag);
            storage.users.find(a => a.id === registerUser.id)?.tagsIds.push(newTag.id ?? 0)
          }
        });
      }
      note.id = Date.now();
      storage.notes.push(note);
      storage.users.find(a => a.id === registerUser.id)?.notesIds.push(note.id)
      res.status(201).send(note);
      repo.updateStorage(JSON.stringify(storage));
    } 
  } else {
    res.status(401).send("Unauthorized user")
  }
});

app.put("/note/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(registerUser.IfUserIsAuthorized(authData, secret)) {
    const note: Note = req.body;
    if (note.title === undefined) {
      res.status(400).send("Note title is undefined");
    } else if (note.content === undefined) {
      res.status(400).send("Note content is undefined");
    } else if (note.id === undefined) {
      res.status(400).send("Note id is undefined");
    } else {
      let oldNote = storage.notes.find((a) => a.id === note.id);
      if (oldNote === undefined) {
        res.status(404).send("Note does not exist");
      } else oldNote = note;
      res.status(201).send(note);
      repo.updateStorage(JSON.stringify(storage));
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
});

app.delete("/note/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(registerUser.IfUserIsAuthorized(authData, secret)) {
    const note = storage.notes.find((a) => a.id === +req.params.id);
    if (note === undefined) {
      res.status(400).send("Note does not exist");
    } else {
      storage.notes.splice(req.body.id, 1);
      storage.users.find(a => a.id === registerUser.id)?.notesIds.splice(req.body.id, 1)
      res.status(204).send(note);
      repo.updateStorage(JSON.stringify(storage));
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
  
});

app.get("/notes", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if (registerUser.IfUserIsAuthorized(authData, secret)) {
    try {
      res.status(200).send(storage.notes.filter(a => registerUser.notesIds.includes(a.id ?? 0)));
    } catch (error) {
      res.status(400).send(error);
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
  
});

// tags
app.get("/tags", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(registerUser.IfUserIsAuthorized(authData, secret)) {
    try {
      res.status(200).send(storage.tags.filter(a => registerUser.tagsIds.includes(a.id ?? 0)));
    } catch (error) {
      res.status(400).send(error);
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
});

app.get("/tag/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(registerUser.IfUserIsAuthorized(authData, secret)) {
    const tag = storage.tags.find((a) => a.id === +req.params.id && registerUser.tagsIds.includes(+req.params.id));
    if (tag === undefined) {
      res.status(404).send("Tag does not exist");
    } else {
      res.status(200).send(tag);
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
});

app.post("/tag", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(registerUser.IfUserIsAuthorized(authData, secret)) {
    const tag: Tag = req.body;
    if (tag.name === undefined) {
      res.status(400).send("Tag name is undefined");
    } else if (storage.tags.find((a) => a.name === req.body.name)) {
      res.status(400).send("This tag name has already exist");
    } else {
      tag.id = Date.now();
      storage.tags.push(tag);
      storage.users.find(a => a.id === registerUser.id)?.tagsIds.push(tag.id)
      res.status(201).send(tag);
      repo.updateStorage(JSON.stringify(storage));
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
});

app.put("/tag/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(registerUser.IfUserIsAuthorized(authData, secret)) {
    const tag: Tag = req.body;
    if (tag.name === undefined) {
      res.status(400).send("Tag name is undefined");
    } else if (storage.tags.find((a) => a.name === req.body.name)) {
      res.status(400).send("This tag name has already exist");
    } else if (tag.id === undefined) {
      res.status(400).send("Tag id is undefined");
    } else {
      let oldTag = storage.tags.find((a) => a.id === tag.id);
      if (oldTag === undefined) {
        res.status(404).send("Tag does not exist");
      } else oldTag = tag;
      res.status(201).send(tag);
      repo.updateStorage(JSON.stringify(storage));
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
});

app.delete("/tag/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(registerUser.IfUserIsAuthorized(authData, secret)) {
    const tag = storage.tags.find((a) => a.id === +req.params.id);
    if (tag === undefined) {
      res.status(400).send("Tag does not exist");
    } else {
      storage.tags.splice(req.body.id, 1);
      storage.users.find(a => a.id === registerUser.id)?.tagsIds.splice(req.body.id, 1)
      res.status(204).send(tag);
      repo.updateStorage(JSON.stringify(storage));
    }
  }
});

// login

app.post("/login", function(req: Request, res: Response) {
  const user: User = req.body
  if(!user.login || !user.password) {
    res.status(401).send("Login or password is undefined")
  }
  user.id = Date.now();
  const payload = user.id
  registerUser.login = user.login
  registerUser.password = user.password
  const token = jwt.sign(payload.toString, secret)
  res.status(200).send(token)
  storage.users.push(user)
  repo.updateStorage(JSON.stringify(storage));
  
})

app.listen(5000);
