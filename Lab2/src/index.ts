import express from "express";
import { Request, Response } from "express";
import Storage from "../Models/Storage";
import Note from "../Models/Note";
import Tag from "../Models/Tag";
import jwt from "jsonwebtoken";
import User from "../Models/User";

const app = express();

let registerUser = new User();
const secret = "abc123"

let storage: Storage = new Storage()
storage.readStorage().then((a) => {
  if (a) {
    storage = JSON.parse(a);
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
      storage.updateStorage(JSON.stringify(storage));
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
      storage.updateStorage(JSON.stringify(storage));
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
      storage.updateStorage(JSON.stringify(storage));
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
      storage.updateStorage(JSON.stringify(storage));
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
      storage.updateStorage(JSON.stringify(storage));
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
      storage.updateStorage(JSON.stringify(storage));
    }
  }
});

// login

app.post("/register", function(req: Request, res: Response) {
  const user: User = req.body
  if(!user.login || !user.password) {
    res.status(401).send("Login or password is undefined")
  }
  if(storage.users.find(a => a.login)) {
    res.status(401).send("User with this login already exists")
  }
  registerUser = new User();
  registerUser.role = 'user'
  registerUser.id = Date.now();
  registerUser.login = user.login
  registerUser.password = user.password
  registerUser.notesIds = []
  registerUser.tagsIds = []
  storage.users.push(registerUser)
  GenerateToken(res);
})

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
  }
  GenerateToken(res); 
})

app.get("/user/list", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(IfUserIsAuthorized(authData, secret) && registerUser.role === 'admin') {
    try {
      res.status(200).send(storage.users);
    } catch (error) {
      res.status(400).send(error);
    }
  } else {
    res.status(401).send("Lack of access")
  }
});

app.get("/user/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(IfUserIsAuthorized(authData, secret)) {
    if (registerUser.id === +req.params.id || registerUser.role === 'admin') {
      const user = storage.users.find((a) => a.id === +req.params.id);
      if (user === undefined) {
        res.status(404).send("User does not exist");
      } else {
        res.status(200).send(user);
      }
    } else {
      res.status(401).send("Lack of access")
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
});

app.delete("/user/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(IfUserIsAuthorized(authData, secret) && registerUser.role === 'admin') {
    const user = storage.users.find((a) => a.id === +req.params.id);
    if (user === undefined) {
      res.status(400).send("User does not exist");
    } else {
      storage.users.splice(req.body.id, 1);
      
      res.status(204).send(user);
      storage.updateStorage(JSON.stringify(storage));
    }
  }
});

app.put("/user/:id", function (req: Request, res: Response) {
  const authData = req.headers.authorization ?? ''
  if(IfUserIsAuthorized(authData, secret)) {
    const user: User = req.body;
    if (user.login === undefined) {
      res.status(400).send("Login is undefined");
    } else if (storage.users.find((a) => a.login === req.body.login)) {
      res.status(400).send("This login has already exist");
    } else if (user.password == undefined) {
      res.status(400).send("Password is undefined");
    } else if (user.id === undefined) {
      res.status(400).send("User id is undefined");
    } else if (registerUser.id === user.id || registerUser.role === 'admin') {
      let oldUser = storage.users.find((a) => a.id === user.id);
      if (oldUser === undefined) {
        res.status(404).send("User does not exist");
      } else oldUser = user;
      res.status(201).send(user);
      storage.updateStorage(JSON.stringify(storage));
    }
    else {
      res.status(401).send("Lack of access")
    }
  } else {
    res.status(401).send("Unauthorized user")
  }
});

function GenerateToken(res: Response) {
  if(registerUser.id) {
    const payload = registerUser.id.toString()
    const token = jwt.sign(payload, secret)
    res.status(200).send(token)
    storage.updateStorage(JSON.stringify(storage));
  }  
}

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
