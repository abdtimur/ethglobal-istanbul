const express = require('express');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const app = express();
app.use(express.static('build'));

let CACHED_INDEX_HTML = null;

app.get('*', async (req, res) => {
  if (!CACHED_INDEX_HTML) {
    CACHED_INDEX_HTML = await fs.promises.readFile(
      path.resolve(__dirname, 'build', 'index.html'),
      'utf8',
    );
  }
  res.set('content-type', 'text/html');
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log('Serving at', PORT);
});
