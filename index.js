import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { I18n } from 'i18n';
import htmlExpress from 'html-express-js';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const i18n = new I18n({
    locales: ['en', 'zh', 'pt'],
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'en',
    header: 'accept-language',
})

const app = express();
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));
app.engine('js', htmlExpress());
app.use(i18n.init);
app.set('view engine', 'js');
app.set('views', `${__dirname}/public`);


// Rotas
app.get('/', (req, res, next) => res.render('index', i18n.getCatalog(req)));
app.get('/en', (req, res, next) => res.render('index', i18n.getCatalog("en")));
app.get('/pt', (req, res, next) => res.render('index', i18n.getCatalog("pt")));
app.get('/zh', (req, res, next) => res.render('index', i18n.getCatalog("zh")));

//static files
app.use(express.static('public'));

app.post('/api', async (req, res) => {
  try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.6, //diversidade que ela fala das coisas
        max_tokens: 140, //maximo de caracteres
        messages: [
          {role: "user", content: req.body.ask},
        ]
      });
      const content = response.choices[0].message.content;


      console.log("Q: " + req.body.ask);
      console.log("A: " + content);

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ text: content, conversationId: 0, id: 0, status: true }));
  } catch (exceptionVar) {
      console.error(exceptionVar);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ text: exceptionVar, status: false }));
  }
})

app.listen(3000)