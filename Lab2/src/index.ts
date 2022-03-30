import express from "express";
import { Request, Response } from "express";
import Data from "../Models/Data";
import Note from "../Models/Note";
import Tag from "../Models/Tag";
import Repository from "../Repository";

const app = express();

const repo: Repository = new Repository();

let datas: Data;
repo.readStorage().then((a) => {
  if (a) {
    datas = JSON.parse(a);
  } else {
    datas = new Data()
  }
});

app.use(express.json());

app.get("/note/:id", function (req: Request, res: Response) {
  const note = datas.notes.find((a) => a.id === +req.params.id);
  console.log(req);
  if (note === undefined) {
    res.status(404).send("Note does not exist");
  } else {
    res.status(200).send(note);
  }
});

app.post("/note", function (req: Request, res: Response) {
  const note: Note = req.body;
  if (note.title === undefined) {
    res.status(400).send("Note title is undefined");
  } else if (note.content === undefined) {
    res.status(400).send("Note content is undefined");
  } else {
    console.log(note);
    if (note.tags !== undefined) {
      note.tags.forEach((tag) => {
        if (!datas.tags.find((a) => a.name === tag.name)) {
          const newTag: Tag = {
            id: Date.now(),
            name: tag.name,
          };
          datas.tags.push(newTag);
        }
      });
    }
    note.id = Date.now();
    datas.notes.push(note);
    res.status(201).send(note);
    repo.updateStorage(JSON.stringify(datas));
  }
});

app.put("/note/:id", function (req: Request, res: Response) {
  const note: Note = req.body;
  if (note.title === undefined) {
    res.status(400).send("Note title is undefined");
  } else if (note.content === undefined) {
    res.status(400).send("Note content is undefined");
  } else if (note.id === undefined) {
    res.status(400).send("Note id is undefined");
  } else {
    let oldNote = datas.notes.find((a) => a.id === note.id);
    if (oldNote === undefined) {
      res.status(404).send("Note does not exist");
    } else oldNote = note;
    res.status(201).send(note);
    repo.updateStorage(JSON.stringify(datas));
  }
});

app.delete("/note/:id", function (req: Request, res: Response) {
  const note = datas.notes.find((a) => a.id === +req.params.id);
  if (note === undefined) {
    res.status(400).send("Note does not exist");
  } else {
    datas.notes.splice(req.body.id, 1);
    res.status(204).send(note);
    repo.updateStorage(JSON.stringify(datas));
  }
});

app.get("/notes", function (req: Request, res: Response) {
  try {
    res.status(200).send(datas.notes);
  } catch (error) {
    res.status(400).send(error);
  }
});

// tags
app.get("/tags", function (req: Request, res: Response) {
  try {
    res.status(200).send(datas.tags);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/tag/:id", function (req: Request, res: Response) {
  const tag = datas.tags.find((a) => a.id === +req.params.id);
  if (tag === undefined) {
    res.status(404).send("Tag does not exist");
  } else {
    res.status(200).send(tag);
  }
});

app.post("/tag", function (req: Request, res: Response) {
  const tag: Tag = req.body;
  if (tag.name === undefined) {
    res.status(400).send("Tag name is undefined");
  } else if (datas.tags.find((a) => a.name === req.body.name)) {
    res.status(400).send("This tag name has already exist");
  } else {
    tag.id = Date.now();
    datas.tags.push(tag);
    res.status(201).send(tag);
    repo.updateStorage(JSON.stringify(datas));
  }
});

app.put("/tag/:id", function (req: Request, res: Response) {
  const tag: Tag = req.body;
  if (tag.name === undefined) {
    res.status(400).send("Tag name is undefined");
  } else if (datas.tags.find((a) => a.name === req.body.name)) {
    res.status(400).send("This tag name has already exist");
  } else if (tag.id === undefined) {
    res.status(400).send("Tag id is undefined");
  } else {
    let oldTag = datas.tags.find((a) => a.id === tag.id);
    if (oldTag === undefined) {
      res.status(404).send("Tag does not exist");
    } else oldTag = tag;
    res.status(201).send(tag);
    repo.updateStorage(JSON.stringify(datas));
  }
});

app.delete("/tag/:id", function (req: Request, res: Response) {
  const tag = datas.tags.find((a) => a.id === +req.params.id);
  if (tag === undefined) {
    res.status(400).send("Tag does not exist");
  } else {
    datas.tags.splice(req.body.id, 1);
    res.status(204).send(tag);
    repo.updateStorage(JSON.stringify(datas));
  }
});

app.listen(5000);
