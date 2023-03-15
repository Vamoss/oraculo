//------------------------------------
//            Oraculo
//------------------------------------
var container = $('#oraculo .cards');
var cardsEl = $('#oraculo .oraculo-card');
var form = $('#form');
var questionField = $('#question');
var cardSortButton = $('#submit');
var STATES = {WAITING:0, DISTRIBUTED: 1, SELECTED: 2}
var state = STATES.WAITING;
var cardWidth, cardHeight, centerX, centerY, columns, rows, paddingX, paddingY, lastActive, arcAmp, spaceX, spaceY;
function initOraculo() {
    sortCards();
    onOraculoResize();
    
    $.each(cardsEl, function(index, item) {
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
    
    container.get(0).scrollIntoView({behavior: 'smooth'});

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
    const accordingTo = $("#accordingTo").val();
    const card = $(this).data("arcano");
    const answerEl = $(this).find('.answer');
    const loadingEl = $(this).find('.loading');
    
    $(this).find('.question').text(question);
    $(this).find('.loading').show();
    questionField.val("");

    ask(question + " " + accordingTo + " " + card, answerEl, loadingEl);

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
        container.get(0).scrollIntoView({behavior: 'smooth'});
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
    $.each(cardsEl, function(index, item) {
        if(!$(item).hasClass("active"))
            $(item).addClass("disabled");
    });
}
function sortCards() {
    var currentIndex = cardsEl.length;
    var temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = cardsEl[currentIndex];
        cardsEl[currentIndex] = cardsEl[randomIndex];
        cardsEl[randomIndex] = temporaryValue;
    }
}
function centralizeCards(){
    //console.log("centralizeCards")
    state = STATES.WAITING;
    $.each(cardsEl, function(index, item) {
        if($(item).hasClass("active")) $(item).removeClass("active");
        if($(item).hasClass("disabled")) $(item).removeClass("disabled");
        $(item).css({left: centerX + index, top: centerY + index, 'z-index': index, transform: "rotate(" + ((index/cardsEl.length*90)-45) + "deg)"});
    });
}
function distributeCards(){
    //console.log("distributeCards");
    state = STATES.DISTRIBUTED;
    $.each(cardsEl, function(index, item) {
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
    cardWidth = $(cardsEl.get(0)).width();
    cardHeight = $(cardsEl.get(0)).height();
    var containerWidth = container.innerWidth() - (cardWidth > 50 ? 0 : 50);
    columns = Math.ceil(containerWidth/cardWidth*0.8);
    rows = Math.ceil(cardsEl.length/columns);
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

//------------------------------------
//            ChatGPT API
//------------------------------------
var conversationId;
var parentId;
function ask(question, answerEl, loadingEl){
    var data = {ask: question};
    if(conversationId) data.conversationId = conversationId;
    if(parentId) data.parentId = parentId;

    fetch("/api", {
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