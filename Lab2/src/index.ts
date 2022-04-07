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
let registerUser = new User();
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

app.get("/note/list", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if (IfUserIsAuthorized(authData, secret)) {
    getNotes(res, false, registerUser)
  } else {
    res.status(401).send("Unauthorized user")
  }
  
});

app.get("/note/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if (IfUserIsAuthorized(authData, secret)) {
    const note = storage.notes.find((a) => a.id === +req.params.id && registerUser.notesIds.includes(+req.params.id));
    if (note === undefined) {
      res.status(404).send("Note does not exist");
    } else {
      res.status(200).send(note);
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
});

app.get("/note/list/user/:userName", function (req: Request, res: Response) {
  const user = storage.users.find(a => a.login === req.params.userName)
  if(user) {
    getNotes(res, true, user);
  } else {
    res.status(404).send("User name not exist")
  }
  
})

app.post("/note", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(IfUserIsAuthorized(authData, secret)) {
    const note: Note = req.body;
    if (note.title === undefined) {
      res.status(400).send("Note title is undefined");
    } else if (note.content === undefined) {
      res.status(400).send("Note content is undefined");
    } else {
      if (note.tags !== undefined) {
        note.tags.forEach((tag) => {
          if (!storage.tags.find((a) => a.name === tag.name)) {
            const newTag: Tag = {
              id: Date.now(),
              name: tag.name,
            };
            storage.tags.push(newTag);
            registerUser.tagsIds.push(newTag.id ?? 0)
          }
        });
      }
      note.id = Date.now();
      storage.notes.push(note);
      registerUser.notesIds.push(note.id);
      res.status(201).send(note);
      repo.updateStorage(JSON.stringify(storage));
    } 
  } else {
    res.status(401).send("Unauthorized user")
  }
});

app.put("/note/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(IfUserIsAuthorized(authData, secret)) {
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
  if(IfUserIsAuthorized(authData, secret)) {
    const note = storage.notes.find(a => a.id === +req.params.id);
    if (note === undefined) {
      res.status(400).send("Note does not exist");
    } else {
      storage.notes.splice(req.body.id, 1);
      registerUser.notesIds.splice(req.body.id, 1)
      res.status(204).send(note);
      repo.updateStorage(JSON.stringify(storage));
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
  
});

function getNotes(res: Response, onlyPublicNotes: boolean, user: User) {
  try {
    let notes: Note[] = [];
    if(onlyPublicNotes) {
      notes = storage.notes.filter(a => user.notesIds.includes(a.id ?? 0))
      notes = notes.filter(a => a.isPrivate.toString() === "false")
    } else {
      notes = storage.notes.filter(a => user.notesIds.includes(a.id ?? 0))
    }
    res.status(200).send(notes);
  } catch (error) {
    res.status(400).send(error);
  }
}



// tags
app.get("/tag/list", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(IfUserIsAuthorized(authData, secret)) {
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
  if(IfUserIsAuthorized(authData, secret)) {
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
  if(IfUserIsAuthorized(authData, secret)) {
    const tag: Tag = req.body;
    if (tag.name === undefined) {
      res.status(400).send("Tag name is undefined");
    } else if (storage.tags.find((a) => a.name === req.body.name)) {
      res.status(400).send("This tag name has already exist");
    } else {
      tag.id = Date.now();
      storage.tags.push(tag);
      registerUser.tagsIds.push(tag.id ?? 0)
      res.status(201).send(tag);
      repo.updateStorage(JSON.stringify(storage));
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
});

app.put("/tag/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(IfUserIsAuthorized(authData, secret)) {
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
  if(IfUserIsAuthorized(authData, secret)) {
    const tag = storage.tags.find((a) => a.id === +req.params.id);
    if (tag === undefined) {
      res.status(400).send("Tag does not exist");
    } else {
      storage.tags.splice(req.body.id, 1);
      registerUser.tagsIds.splice(req.body.id, 1)
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
  registerUser = new User();
  const existingUser = storage.users.find(a => a.login)
  if(existingUser){
    if(existingUser.password === user.password) {
      registerUser = existingUser
    } else {
      res.status(400).send("Wrong password")
    }
  } else {
    registerUser.id = Date.now();
    registerUser.login = user.login
    registerUser.password = user.password
    registerUser.notesIds = []
    registerUser.tagsIds = []
    storage.users.push(registerUser)
  }
  if(registerUser.id) {
    const payload = registerUser.id.toString()
    const token = jwt.sign(payload, secret)
    res.status(200).send(token)
    repo.updateStorage(JSON.stringify(storage));
  }  
})

function IfUserIsAuthorized(authData: string, secret: string) : boolean {
  const token = authData?.split(' ')[1] ?? ''
  const payload = jwt.verify(token, secret)
  let checkValue = ''
  if (registerUser.id) {
      checkValue = registerUser.id.toString() ?? ''
  }
  if (registerUser.id && payload === checkValue) {
      return true
  } else {
      return false
  }
}

app.listen(5000);
