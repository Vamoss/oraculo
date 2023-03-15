import express from 'express';
import bodyParser from 'body-parser';
import fetch from "node-fetch";
import { ChatGPTAPI } from 'chatgpt';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { I18n } from 'i18n';
import htmlExpress, { staticIndexHandler } from 'html-express-js';

dotenv.config();

const api = new ChatGPTAPI({
    apiKey: process.env.OPEN_API_KEY,
    completionParams: {
      // override this depending on the ChatGPT model you want to use
      // NOTE: if you are on a paid plan, you can't use the free model and vice-versa
      model: 'text-davinci-003', // free, default model
      // model: 'text-davinci-002-render', // free, default model
      // model: 'text-davinci-002-render-sha', // paid, default model (turbo)
      // model: 'text-davinci-002-render-paid', // paid, legacy model
      temperature: 0.6, //diversidade que ela fala das coisas
      max_tokens: 140, //maximo de caracteres
    },
    debug: false,
    fetch: fetch
})

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
        var context = {};
        if(req.body.parentId)
            context.parentMessageId = req.body.parentId;
        if(req.body.conversationId)
            context.conversationId = req.body.conversationId;
        const res2 = await api.sendMessage(req.body.ask, context);
        
        console.log("Q: " + req.body.ask);
        console.log("A: " + res2.text);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ text: res2.text, conversationId: res2.conversationId, id: res2.id, status: true }));
    } catch (exceptionVar) {
        console.error(exceptionVar);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ text: exceptionVar, status: false }));
    }
})

app.listen(3000)