import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const name = process.env.NAME || 'World';
    res.send({
        message: `Hello ${name}!`,
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});