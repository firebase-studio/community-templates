const express = require('express');
const cors = require('cors');
const corsOptions = {
    origin: '*'
}
const app = express();
app.use(cors(corsOptions));

app.get('/', (req, res) => {
    const name = process.env.NAME || 'World';
    res.send({
        message: `Hello ${name}!`,
    });
});

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
