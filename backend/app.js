const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => console.log(`Server is running on port`, port));