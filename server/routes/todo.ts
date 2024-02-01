import express from 'express';
import { authenticateJwt, SECRET } from "../middleware/index.js";
import { Todo } from "../db/index.js";
import { z } from 'zod';
const router = express.Router();

interface CreateTodoInput {
  title: string;
  description: string;
}



let titleInputProps = z.object({
  title: z.string().min(1),
  description: z.string().min(1)
})

router.post('/todos', authenticateJwt, (req, res) => {
  const parsedInput = titleInputProps.safeParse( req.body);
  const done = false;
  if(!parsedInput.success){
    return res.status(411).json({msg: parsedInput.error})
  }
  let title = parsedInput.data.title;
  let description = parsedInput.data.description;
  const userId = req.headers["userId"];

  const newTodo = new Todo({ title, description, done, userId });

  newTodo.save()
    .then((savedTodo) => {
      res.status(201).json(savedTodo);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Failed to create a new todo' });
    });
});


router.get('/todos', authenticateJwt, (req, res) => {
  const userId = req.headers["userId"];

  Todo.find({ userId })
    .then((todos) => {
      res.json(todos);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Failed to retrieve todos' });
    });
});

router.patch('/todos/:todoId/done', authenticateJwt, (req, res) => {
  const { todoId } = req.params;
  const userId = req.headers["userId"];

  Todo.findOneAndUpdate({ _id: todoId, userId }, { done: true }, { new: true })
    .then((updatedTodo) => {
      if (!updatedTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      res.json(updatedTodo);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Failed to update todo' });
    });
});
export default router;