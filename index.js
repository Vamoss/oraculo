import express from 'express';
import bodyParser from 'body-parser';
import fetch from "node-fetch";
globalThis.fetch = fetch
import { ChatGPTAPI } from 'chatgpt';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express()
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

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
    debug: false
})


// Rotas
app.use('/', express.static('public'))

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