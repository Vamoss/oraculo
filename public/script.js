const DEBUG = false;

var loggerEl = document.getElementById("logger");
var startBtnEl = document.getElementById("btn");

//arcanos maiores
const arcanos = [
    "O Mago",
    "A Sacerdotisa",
    "A Imperatriz",
    "O Imperador",
    "O Papa",
    "Os Enamorados",
    "O Carro de guerra",
    "A Justiça",
    "O Eremita",
    "A Roda da Fortuna",
    "A Força",
    "O Enforcado",
    "A Morte",
    "A Temperança",
    "O Diabo",
    "A Torre fulminada",
    "A Estrela",
    "A Lua",
    "O Sol",
    "O Julgamento",
    "O Mundo",
    "O Louco"
];

//------------------------------------
//            Oraculo
//------------------------------------
var container = $('#oraculo .cards');
let data = [
    {
    src: './images/tarot-cover.png',
    }
];
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
arcanos.forEach((arcano, index) => {
    container.append(
    '<div class="oraculo-card disabled" data-arcano="' + arcano + '">\
        <div class="flip-card-inner">\
        <div class="flip-card-front">\
            <img src="' + data[0].src + '" alt="Avatar">\
        </div>\
        <div class="flip-card-back">\
            <img src="./images/tarot-example.png" alt="Avatar">\
            <div class="description">\
                <div class="text">\
                    <h4>' + arcano + '</h4>\
                </div>\
                <div class="question"></div>\
                <div class="answer"></div>\
                <div class="loading spinner-border spinner-border-sm" role="status">\
                    <span class="visually-hidden">Loading...</span>\
                </div>\
            </div>\
        </div>\
        </div>\
    </div>'
    );
});
var cards = $('#oraculo .oraculo-card');
var form = $('#form');
var questionField = $('#question');
var cardSortButton = $('#submit');
var STATES = {WAITING:0, DISTRIBUTED: 1, SELECTED: 2}
var state = STATES.WAITING;
var cardWidth, cardHeight, centerX, centerY, columns, rows, paddingX, paddingY, lastActive, arcAmp, spaceX, spaceY;
function initOraculo() {
    sortCards();
    onOraculoResize();
    
    $.each(cards, function(index, item) {
        $(item).click(onCardClick);
    });
    
    form.submit(onSubmit);
}
function onCardClick() {

    // Validation
    if(questionField.val().length < 5){
        shake(questionField);
        return;
    }
    if($(this).hasClass("disabled")) {
        shake(cardSortButton);
        return;
    }

    // Layout
    state = STATES.SELECTED;
    if(lastActive) {
        lastActive.removeClass("active");
    }
    lastActive = $(this);
    $(this).addClass("active");
    disableCards();
    $(this).css({
        left: centerX-(cardWidth > 50 ? 185 : 150),
        top: centerY
    });

    // API
    const question = questionField.val();
    const card = $(this).data("arcano");
    const answerEl = $(this).find('.answer');
    const loadingEl = $(this).find('.loading');
    
    $(this).find('.question').text(question);
    $(this).find('.loading').show();
    questionField.val("");

    ask(question + " segundo a carta do tarot " + card, answerEl, loadingEl);

    //TODO
    //CLOSE CARD
    /*
    lastActive.removeClass("active");
    disableCards();
    distributeCards();
    */
}
function onSubmit() {
    if(questionField.val().length < 5){
        shake(questionField);
    } else if(state == STATES.WAITING)
        distributeCards();
    else {
        centralizeCards();
        setTimeout(() => {
            sortCards();
            distributeCards();
        }, 1500);
    }
    return false;
}
function shake(el) {
    el.focus();
    el.css('position','relative');
    const total = 5;
    for(var i=0; i<total; i++){
        el.delay(i*10).animate({ left: i==total-1 ? 0 : i%2 == 0 ? 20 : -20 }, 100);
    }
}
function disableCards() {
    $.each(cards, function(index, item) {
        if(!$(item).hasClass("active"))
            $(item).addClass("disabled");
    });
}
function sortCards() {
    var currentIndex = cards.length;
    var temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = cards[currentIndex];
        cards[currentIndex] = cards[randomIndex];
        cards[randomIndex] = temporaryValue;
    }
}
function centralizeCards(){
    //console.log("centralizeCards")
    state = STATES.WAITING;
    $.each(cards, function(index, item) {
        if($(item).hasClass("active")) $(item).removeClass("active");
        if($(item).hasClass("disabled")) $(item).removeClass("disabled");
        $(item).css({left: centerX + index, top: centerY + index, 'z-index': index, transform: "rotate(" + ((index/cards.length*90)-45) + "deg)"});
    });
}
function distributeCards(){
    //console.log("distributeCards");
    state = STATES.DISTRIBUTED;
    $.each(cards, function(index, item) {
        if(!$(item).hasClass("active")){
            var indexX = index % columns;
            var indexY = Math.floor(index / columns);
            $(item).css({
                left: paddingX+indexX*(cardWidth+spaceX)+spaceX/2,
                top: paddingY+indexY*(cardHeight+spaceY)+spaceY/2+Math.sin((indexX+0.5)/columns*Math.PI+Math.PI)*arcAmp+50,
                'z-index':
                index,
                transform: "rotate(" + ((indexX/columns*90)-45) + "deg)"
            });
        }
    });
}
function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
function onOraculoResize(){
    //console.log('resize');
    cardWidth = $(cards.get(0)).width();
    cardHeight = $(cards.get(0)).height();
    var containerWidth = container.innerWidth() - (cardWidth > 50 ? 0 : 50);
    columns = Math.ceil(containerWidth/cardWidth*0.8);
    rows = Math.ceil(cards.length/columns);
    spaceX = map(containerWidth, 300, 4000, 0, -10);//(containerWidth / columns) / 40;
    spaceY = -cardHeight/2;
    //console.log(columns, rows, spaceX, spaceY, containerWidth);
    arcAmp = columns * (cardWidth > 50 ? 5 : 3);

    container.height(rows*(cardHeight+spaceY) + 130);
    centerX = (container.innerWidth() - cardWidth) / 2;
    centerY = (container.height() - cardHeight) / 2;
    paddingX = (container.innerWidth() - ((columns+1) * (cardWidth + spaceX))) / 2;
    paddingY = (container.height() - (rows * (cardHeight + spaceY))) / 2 + (-spaceY/2) + 30;
    
    distributeCards();
}


window.onOraculoResize = onOraculoResize;
window.addEventListener("resize", onOraculoResize);
initOraculo();


startBtnEl.addEventListener("click", () => {
    ask("Qual o sentido da vida?");
})

/**
* ChatGPT API
**/
var conversationId;
var parentId;
function ask(question, answerEl, loadingEl){
    addToLog("QUESTION", question, "INIT");

    var data = {ask: question};
    if(conversationId) data.conversationId = conversationId;
    if(parentId) data.parentId = parentId;

    fetch("api", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(json => {
        if(json.status === true){
            conversationId = json.conversationId;
            parentId = json.id;
            answer(json.text, answerEl, loadingEl);
        }else{
            console.log("erro from API:", json.text);
        }
    })
    .catch(function(error) {
        console.error("erro from API:", error);
    });
}
function answer(answer, answerEl, loadingEl){
    loadingEl.hide();
    addToLog("ANSWER", answer, "COMPLETE");
    typeName(answer, 0, answerEl);
}
function typeName(name, iteration, el) {
    if (iteration === name.length)
        return;
    setTimeout(function() {
        el.text(el.text() + name[iteration++] );
        typeName(name, iteration, el);
    }, 50);
}

/**
* Logger
**/
var counter = 0;
function addToLog(type, message, status){
    counter++;
    var trEl = document.createElement("tr");
    var thEl = document.createElement("th");
    var tdEl1 = document.createElement("td");
    var tdEl2 = document.createElement("td");
    var tdEl3 = document.createElement("td");
    thEl.setAttribute("scope", "row");
    thEl.innerHTML = counter;
    if(type == "QUESTION")
        tdEl1.innerHTML = '<span class="badge bg-primary">' + type + '</span>';
    else if(type == "ANSWER")
        tdEl1.innerHTML = '<span class="badge bg-secondary">' + type + '</span>';
    tdEl2.innerHTML = message;

    if(status == "INIT")
        tdEl3.innerHTML = '<span class="badge bg-primary">' + status + '</span>';
    else if(status == "COMPLETE")
        tdEl3.innerHTML = '<span class="badge bg-success">' + status + '</span>';
    else
        tdEl3.innerHTML = '<span class="badge bg-secondary">' + status + '</span>';
    trEl.appendChild(thEl);
    trEl.appendChild(tdEl1);
    trEl.appendChild(tdEl2);
    trEl.appendChild(tdEl3);
    loggerEl.tBodies[0].prepend(trEl)
}
if(DEBUG){
    $("#log").show();
}