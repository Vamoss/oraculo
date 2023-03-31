import { html } from 'html-express-js';
import cards from './cards.json' assert { type: 'json' };

export const view = (data, state) => {

const cardNumber = Math.floor(Math.random() * 3);

return html`
  <!DOCTYPE html>
  <html lang="${data.lang}">
    <head>
        ${state.includes.head}
        <title>${data.headerTitle}</title>
        <meta name="description" content="${data.description}"/>
        <link href="/bootstrap/bootstrap.min.css" rel="stylesheet">
        <script src="/bootstrap/bootstrap.bundle.min.js"></script>
        <script src="/jquery/jquery-3.6.3.min.js"></script>
        <link href="/css/style.css" rel="stylesheet">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap" rel="stylesheet">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <section class="oraculo" id="oraculo">
            <div class="container">
                <div class="row">
                    <div class="col-md-12 text-center">
                        <h2 class="heading">${data.name}</h2>
                        <ul class="nav justify-content-center">
                            <li class="nav-item">
                              <a class="nav-link ${data.lang == "en" ? 'disabled" aria-current="page' : 'active'}" href="/en">English</a>
                            </li>
                            <li class="nav-item">
                              <a class="nav-link ${data.lang == "zh" ? 'disabled" aria-current="page' : 'active'}" href="/zh">中文</a>
                            </li>
                            <li class="nav-item">
                              <a class="nav-link ${data.lang == "pt" ? 'disabled" aria-current="page' : 'active'}" href="/pt">Português</a>
                            </li>
                          </ul>
                        <p class="head-paragraph">${data.description}</p>
                        <form id="form">
                            <div class="form-group">
                                <label for="question" id="cta">${data.makeYourQuestion}</label>
                                <input type="hidden" id="accordingTo" value="${data.accordingTo}" />
                                <input type="text" class="form-control form-control-lg" id="question" placeholder="${data.yourQuestion}" />
                            </div>
                            <button type="submit" id="submit" class="btn btn-primary btn-lg">${data.sortCards}</button>
                        </form>
                    </div>
                </div>
                <div class="row cards">${
                    Object.entries(cards).map(entry => {
                        const arcano = cards[entry[0]];
                        return '<div class="oraculo-card disabled" data-arcano="' + arcano[data.lang] + '">\
                            <div class="flip-card-inner">\
                            <div class="flip-card-front">\
                                <img src="/images/verso0' + cardNumber + '.png" alt="Avatar">\
                            </div>\
                            <div class="flip-card-back">\
                                <img src="' + arcano.img[Math.floor(Math.random() * arcano.img.length)] + '" alt="Avatar">\
                                <div class="description">\
                                    <div id="close">X</div>\
                                    <div class="text">\
                                        <h4>' + arcano[data.lang] + '</h4>\
                                    </div>\
                                    <div class="scroller">\
                                        <div class="question"></div>\
                                        <div class="answer"></div>\
                                        <div class="loading spinner-border spinner-border-sm" role="status">\
                                            <span class="visually-hidden">Loading...</span>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                            </div>\
                        </div>'
                    }).join("")
                }</div>
            </div>
        </section>
        <section class="about">
            <div class="container">
                <div class="row">
                    <div class="col-md-12">
                        <h4>${data.aboutTitle}</h4>
                        <p>${data.aboutDescription}</p>

                        <h5><a href="https://shima.art.br" target="_blank">Shima</a></h5>
                        <p>${data.shimaBio}</p>

                        <h5><a href="https://vamoss.com.br" target="_blank">Vamoss</a></h5>
                        <p>${data.vamossBio}</p>
                    </div>
                </div>
            </div>
        </section>
        <script src="/script.js" type="module"></script>
        <div class="corner" id="upper_left"></div>
        <div class="corner" id="upper_right"></div>
        <div class="corner" id="lower_left"></div>
        <div class="corner" id="lower_right"></div>
    </body>
</html>
`;
}