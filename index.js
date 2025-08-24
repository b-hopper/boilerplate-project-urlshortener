require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

var urlDatabase = [];

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:shorturl', function(req, res) {
    let urlNum = parseInt(req.params.shorturl);
    if (urlNum > 0 && urlNum <= urlDatabase.length) {
        res.redirect(urlDatabase[urlNum - 1]);
    }
    else {
        res.json({ error: 'No short URL found for the given input' });
    }
});

app.post('/api/shorturl', function (req, res) {
    const { url } = req.body;
    if (!url) return res.status(200).json({ error: 'invalid url' });

    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return res.status(200).json({ error: 'invalid url' });
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return res.status(200).json({ error: 'invalid url' });
    }

    // Use hostname (no protocol/path/port)
    dns.lookup(parsed.hostname, (err /*, address, family */) => {
        if (err) {
            return res.status(200).json({ error: 'invalid url' });
        }

        urlDatabase.push(url);
        res.json({
            original_url: url,
            short_url: urlDatabase.length
        });
    });
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
