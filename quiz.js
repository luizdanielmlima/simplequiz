//NEW TIMER CLASS
class Timer { 

    constructor(duration, display) {
      this.duration = duration; // saves the duration for the reset function
      this.counter = 0;
      this.display = display;
      this.isPaused = false;
      this.timerIsStopped = true;
      this.timeRunningOut = false;
    } 
  
    start () {
      //console.log("Start | counter: "+ this.counter);
      if(this.timerIsStopped) {
        this.timerIsStopped = false;
        this.counter = this.duration;
        this.timerInterval = setInterval(this.countdown.bind(this), 1000); 
      }
    }
  
    countdown() {
  
      if(this.isPaused){
        //do nothing, timer is PAUSED!
      } else {
        //console.log("countdown: "+this.counter);
  
        var min = parseInt(this.counter / 60, 10);      
        var sec = parseInt(this.counter % 60, 10);
  
        min = min < 10 ? "0" + min : min;
        sec = sec < 10 ? "0" + sec : sec;
  
        this.display.textContent = min + ":" + sec;
  
        if (--this.counter < 0) {
          this.counter = this.counter;
        }
        
        if (this.counter < 10) {
          if(!this.timeRunningOut){
            let event2 = new Event("timeisRunningOut", {bubbles: true});
            this.display.dispatchEvent(event2);
            this.timeRunningOut = true;
          }
        }
  
        if (this.counter < 0){
          //console.log("Class Timer: TIME OUT!");
          clearInterval(this.timerInterval); 
          this.timerIsStopped = true;
          this.timeRunningOut = false;
          let event = new Event("timeout", {bubbles: true});
          this.display.dispatchEvent(event);
        }
      }    
    }
  
    pauseResume() {
      if(this.isPaused){
        this.isPaused = false ;
      } else {
        this.isPaused = true ;
      }
    }
  
    reset() {
      this.counter = this.duration;
      this.isPaused = false;
      this.timeRunningOut = false;
      if(this.timerIsStopped){ //the timer was stopped, so init the setInterval again and the counter
        this.counter = this.duration;
        this.timerInterval = setInterval(this.countdown.bind(this), 1000); 
        this.timerIsStopped = false;
      }
    }
  
    stop() {
      clearInterval(this.timerInterval);
      this.timerIsStopped = true;
      this.isPaused = false;
      this.display.textContent = '00:00';
      this.counter = 0;    
    }
  
  };  
  // ---- END OF TIMER CLASS ------------
  
  window.onload=function(){
    
    //-------------Declaring all the game vars ------------  
    const gameMaxQuestions = 3;
    const ptsRight = 10;
    const ptsWrong = -10;
    const ptsPass = -5;
    const ptsTimeOut = -5;
    var playerScore = 0;
    var pctPlayerScore = 0;
    var curQuestion = 0;
    var numOfAnswers = 4;
    var quizIsBeingPlayed = false;
    var questionHasBeenLoaded = false; //choosing answer only works when this var is true...
    var questionHasBeenChosen = false; //Conf button only works when this var is true...
    var correctAnswer = "";
    var currentAnswer = "";
    var avaiableQuestions = [];
    
    //vars related to the timer 
    var display = document.getElementById('q-timer');
    var timerArea = document.getElementById('q-timerArea');
    var timerHasIniated = false;
    var alertTimeInterval;  
    var timerDuration = 60 * 0.2;
    var myTimer = new Timer(timerDuration, display);
  
    var feedbackText = document.getElementById('q-feedback-text');
    var feedbackPoints = document.getElementById('q-feedback-points');
    var scoreTxt = document.getElementById('q-points');
    var questionField = document.getElementById('q-main-question');
    var answerField01 = document.getElementById('q-answer01');
    var answerField02 = document.getElementById('q-answer02');
    var answerField03 = document.getElementById('q-answer03');
    var answerField04 = document.getElementById('q-answer04');
    
    //Temporary object file for the questions, just for testing, must be replaced by a JSON file and a HttpRequest of some form...  
    var questionsDB = [
      {
        id:1,
        tema:"história",
        qt:"Quem descobriu o Brasil?",
        a:"Pero Vaz de Caminha",
        b:"Vasco da Gama",
        c:"Cristóvão Colombo",
        d:"Pedro Alvares Cabral",
        correct:"d"
      },
      {
        id:2,
        tema:"história",
        qt:"Em que ano foi descoberta a América?",
        a:"1492",
        b:"1502",
        c:"1500",
        d:"1789",
        correct:"a"
      },
      {
        id:3,
        tema:"economia",
        qt:"Quais países tem tradição na produção de vinho tinto?",
        a:"Uganda, Zimbabwe e Paquistão",
        b:"Chile, Argentina e França",
        c:"Equador, Japão e Noruega",
        d:"Nenhum país citado acima",
        correct:"b"
      },
      {
        id:4,
        tema:"esportes",
        qt:"Qual país foi pelo menos 3 vezes campeão mundial de futebol?",
        a:"Chile",
        b:"EUA",
        c:"Noruega",
        d:"Alemanha",
        correct:"d"
      },
      {
        id:5,
        tema:"geografia",
        qt:"Qual país está mais próximo da Linha do Equador?",
        a:"Argentina",
        b:"Canadá",
        c:"França",
        d:"Quênia",
        correct:"d"
      },
      {
        id:6,
        tema:"geografia",
        qt:"Cidade onde está localizada a Torre Eiffel",
        a:"Barcelona",
        b:"Budapeste",
        c:"Paris",
        d:"Munique",
        correct:"c"
      },
      {
        id:7,
        tema:"história",
        qt:"Cidade romana destruída por um vulcão",
        a:"Roma",
        b:"Pompéia",
        c:"Napoles",
        d:"Veneza",
        correct:"b"
      },
      {
        id:8,
        tema:"esportes",
        qt:"O Miami Heat é um time de qual esporte?",
        a:"Hóquei",
        b:"Futebol Americano",
        c:"Vôlei",
        d:"Basquete",
        correct:"d"
      },
      {
        id:9,
        tema:"história",
        qt:"Civilização cujos governantes eram conhecidos como faraós",
        a:"Assíria",
        b:"Romana",
        c:"Egípcia",
        d:"Felícia",
        correct:"c"
      },
      {
        id:10,
        tema:"geografia",
        qt:"Quais as cores da bandeira da Tunísia?",
        a:"Azul, Vermelho e Branco",
        b:"Verde e Amarelo",
        c:"Vermelho e Branco",
        d:"Verde e Branco",
        correct:"c"
      },
      {
        id:11,
        tema:"esportes",
        qt:"New York Giants é um time de qual esporte?",
        a:"Baseball",
        b:"Basquete",
        c:"Futebol Americano",
        d:"Hóquei",
        correct:"c"
      },
      {
        id:12,
        tema:"esportes",
        qt:"Pitsburg Penguins é um time de qual esporte?",
        a:"Hóquei",
        b:"Basquete",
        c:"Baseball",
        d:"Futebol Americano",
        correct:"a"
      },
      {
        id:13,
        tema:"geografia",
        qt:"Quais as cores da bandeira da Bélgica?",
        a:"Preto, Vermelho e Branco",
        b:"Azul, Branco e Vermelho",
        c:"Amarelo e Vermelho",
        d:"Preto, Amarelo e Vermelho",
        correct:"d"
      },
      {
        id:14,
        tema:"história",
        qt:"A revolução francesa ocorreu no ano de:",
        a:"1789",
        b:"1660",
        c:"1689",
        d:"1719",
        correct:"a"
      },
      
    ];
    
    var totalQuestionNum = questionsDB.length;
    
    // END OF VARIABLES --------------------------  
    
    function initUI() {
        console.log('initUI');  
      $('#btModalStart').click(function(){
        hideModal();
      });
      
      /*$('#btTest').click(function(){
        if(quizIsBeingPlayed){
          //do nothing
        } else {
          resetGame();
          loadQuestion();
          $(this).hide();
        }
      });*/
  
      $('#btConf').click(function(){
        checkAnswer();
      });
  
      $('#btPass').click(function(){
        myTimer.pauseResume();
        showPointsFeedback('passed');
        $('#btPass').removeClass("bt-pass");
        $('#btPass').addClass("bt-disabled");
      });
      
      //sets an event listener for all the answer fields
      for(i=1; i<=numOfAnswers; i++){
        var whichAnswerField = "q-answer0" + i;
        document.getElementById(whichAnswerField).addEventListener('click', activateAnswerField, false);
      }
      
      //sets the progress bar status
      for(j=1; j<=10; j++){
        var curProgressDisplayID = "q-prog-item-" + j;
        var curProgressDisplay = document.getElementById(curProgressDisplayID);
        if(j<=gameMaxQuestions){
          curProgressDisplay.style.setProperty('visibility', 'visible');
        }
      }
      
      //sets a listener for the time out and when the time is less than 10 seconds
      this.addEventListener("timeout", timeIsOut);
      this.addEventListener("timeisRunningOut", timeIsRunningOut);
      setTimerAnim("normal");
    } // End of the InitUI function
    
    function hideModal(){
        console.log('hidModal');         
        $( "#q-modalCover").animate({
        opacity: 0,
        }, 200, function() {
            $("#q-modalCover").hide;
            $("#q-modalCover").css("z-index", "-1");
        });        
        resetGame();
        loadQuestion();    
    }
    
    function showModal(){
      var finalMsg = "";
      if(pctPlayerScore>=50){
        finalMsg = "PARABÉNS !";
      } else {
        finalMsg = "QUE PENA !";
      }
      
      $("#q-modalCover").css("z-index", "100");
      $("#q-modal-header").text("GAME OVER!");
      $("#q-modal-title").text(finalMsg + "  " +  "Você fez:");
      $("#q-modal-pts").text(playerScore);
      $("#q-modal-pts-text").text("pontos " + "(" + pctPlayerScore + "%)");
      $("#q-modal-pointsarea").css("visibility", "visible");
      $( "#q-modalCover").animate({
        opacity: 1,
      }, 200, function() {
        $("#q-modalCover").visible;      
      });
    }
    
    function resetUI(){
      //resets the progress bar status
      for(j=1; j<=10; j++){
        var curProgressDisplayID = 'q-prog-item-' + j;
        var curProgressDisplay = document.getElementById(curProgressDisplayID);
        curProgressDisplay.className = 'q-progress-item-notsel';
      }  
      //clears all the answer fields
      questionField.innerHTML = "...";    
      answerField01.innerHTML = ".";
      answerField02.innerHTML = ".";
      answerField03.innerHTML = ".";
      answerField04.innerHTML = ".";
      //resets the points bar
      $('#q-progbar').addClass('q-pointsbar-pos');    
      $('#q-progbar').css('height',"1%");
      scoreTxt.innerHTML = playerScore;
      //deactivates buttons and timer blink
      setTimerAnim("normal");
      setButtonsStatus('none');
    }
    
    function initContent() {
      avaiableQuestions = [];
      for(i=0; i<questionsDB.length; i++){
        avaiableQuestions.push(i);      
      }
      curQuestion = 0;
    }
    
    function resetGame() {
      setButtonsStatus('none');
      quizIsBeingPlayed = false;
      playerScore = 0;
      resetUI(); 
      initContent();
    }
    
    function activateAnswerField() {
      if(questionHasBeenLoaded){
        deactivateFields();
        //must select the item beside the answer, finds the equiv. num
        var tempID = this.getAttribute('data-num');
        var whichItemStr = 'q-item0' + tempID;
        var whichItem = document.getElementById(whichItemStr);
        // finally sets both to the same color
        this.className = 'q-answer-sel';
        whichItem.className = 'q-answer-item-sel';
        currentAnswer = this.getAttribute('data-id');
        questionHasBeenChosen = true;
        setButtonsStatus('both');
      }
    }
    
    function deactivateFields() {
      //deactivates all answers
      for(i=1; i<=numOfAnswers; i++){
        var fieldStr = "q-answer0" + i;
        var itemStr = "q-item0" + i;
        var field = document.getElementById(fieldStr);
        var item = document.getElementById(itemStr);
        field.className = 'q-answer-notsel';
        item.className = 'q-answer-item-notsel';
      }  
    }
    
    function checkAnswer(){
      if(questionHasBeenChosen){
        myTimer.pauseResume();
        if(currentAnswer==correctAnswer){
          showPointsFeedback('right');
        } else {
          showPointsFeedback('wrong');
        }
      }
    }
    
    function showPointsFeedback(status) {
      setButtonsStatus('none');
      setTimerAnim("normal");
      loadQuestionTimer = setTimeout(nextQuestion, 2000);
      if(status=="right"){
        playerScore += ptsRight;
        feedbackText.innerHTML = "&#10004; ACERTOU!";
        feedbackPoints.innerHTML = "+"+ptsRight+" pontos";
        feedbackText.className = 'q-feedb-txt q-feedb-txt-pos';
        feedbackPoints.className = 'q-feedb-txt q-feedb-txt-pos';
      } else if(status=="wrong"){
        playerScore += ptsWrong;      
        feedbackText.innerHTML = "&#10006; ERROU!";
        feedbackPoints.innerHTML = ptsWrong+" pontos";
        feedbackText.className = 'q-feedb-txt q-feedb-txt-neg';
        feedbackPoints.className = 'q-feedb-txt q-feedb-txt-neg';
      } else if(status=="passed"){
        playerScore += ptsPass;
        feedbackText.innerHTML = "&#10006; PASSOU!"
        feedbackPoints.innerHTML = ptsPass+" pontos";
        feedbackText.className = 'q-feedb-txt q-feedb-txt-neg';
        feedbackPoints.className = 'q-feedb-txt q-feedb-txt-neg';
      } else if(status=="timeOut"){
        playerScore += ptsTimeOut;
        feedbackText.innerHTML = "&#10006; TEMPO ESGOTADO!"
        feedbackPoints.innerHTML = ptsTimeOut+" pontos";
        feedbackText.className = 'q-feedb-txt q-feedb-txt-neg';
        feedbackPoints.className = 'q-feedb-txt q-feedb-txt-neg';
      }
      scoreTxt.innerHTML = playerScore;
      animatePoints(playerScore);
      function nextQuestion(){
        clearTimeout(loadQuestionTimer);
        loadQuestion();      
      }
    }
    
    function animatePoints(){
      var totalPoints = gameMaxQuestions * ptsRight;
      var pctOfPoints = 100 * (playerScore/totalPoints);
      if(pctOfPoints>=0){
        $('#q-progbar').removeClass("q-pointsbar-neg");
        $('#q-progbar').addClass("q-pointsbar-pos");
        if(pctOfPoints==0){
          $('#q-progbar').css('height',"1%");  
        } else {
          $('#q-progbar').css ('height', pctOfPoints+"%");
        }      
      } else {
        $('#q-progbar').removeClass("q-pointsbar-pos");
        $('#q-progbar').addClass("q-pointsbar-neg");
        $('#q-progbar').css('height',"1%");      
      }
      
    }
    
    function setButtonsStatus(param){
      if(param=='both'){
        $('#btConf').removeClass("bt-disabled");
        $('#btConf').addClass("bt-conf");
        $('#btPass').removeClass("bt-disabled");
        $('#btPass').addClass("bt-pass");
      } else if (param=='pass'){
        $('#btConf').removeClass("bt-conf");
        $('#btConf').addClass("bt-disabled");
        $('#btPass').removeClass("bt-disabled");
        $('#btPass').addClass("bt-pass");
      } else if (param=='none'){
        $('#btConf').removeClass("bt-conf");
        $('#btConf').addClass("bt-disabled");
        $('#btPass').removeClass("bt-pass");
        $('#btPass').addClass("bt-disabled");
      } 
    }
    
    function loadQuestion(){
      curQuestion++;
      $('#q-timerArea').removeClass('q-timer-area-alert');
      questionHasBeenLoaded = false;
      questionHasBeenChosen = false;
      if(curQuestion > gameMaxQuestions){
        //Game is Over...
        //var pctPlayerScore is used in the modal, when the game finishes, to change the txt showed
        if(playerScore>0){
          pctPlayerScore = Math.round( 100 * (playerScore/(gameMaxQuestions * ptsRight) ) );
        } else {
          pctPlayerScore = 0;
        }      
        showModal();
        //$('#btTest').show();
        deactivateFields();
        feedbackText.innerHTML = "";
        feedbackPoints.innerHTML = "";
      } else {
        feedbackText.innerHTML = "";
        feedbackPoints.innerHTML = "";
        setButtonsStatus('pass');
        deactivateFields();
        //picks a random question in the array
        var numOfRemQuestions = avaiableQuestions.length;
        var randonN = Math.floor(Math.random() * numOfRemQuestions);
        var newQuestionIndex = avaiableQuestions[randonN];
        
        //sets all the content in the questions area
        //TO-DO: scramble the answers randomly !
        questionField.innerHTML = questionsDB[newQuestionIndex].qt;    
        answerField01.innerHTML = questionsDB[newQuestionIndex].a;
        answerField01.setAttribute("data-id", "a");
        answerField02.innerHTML = questionsDB[newQuestionIndex].b;
        answerField02.setAttribute("data-id", "b");
        answerField03.innerHTML = questionsDB[newQuestionIndex].c;
        answerField03.setAttribute("data-id", "c");
        answerField04.innerHTML = questionsDB[newQuestionIndex].d;
        answerField04.setAttribute("data-id", "d");
        //saves the correct answer to be checked later
        correctAnswer = questionsDB[newQuestionIndex].correct;
        //Important: removes this question from the avaiable questions index array
        avaiableQuestions.splice(randonN, 1);
        
        //updates the progress bar
        var curProgressDisplayID = "q-prog-item-" + curQuestion;
        var curProgressDisplay = document.getElementById(curProgressDisplayID);
        curProgressDisplay.className = 'q-progress-item-sel';
  
        questionHasBeenLoaded = true;
        setTimerAnim("normal");
        myTimer.reset();      
      }  
      
    };
  
    function timeIsOut() {
      //console.log("Time out. You lose points!");
      showPointsFeedback('timeOut');
    }
    
    function timeIsRunningOut() {    
      //console.log("Hurry, time is running Out");
      setTimerAnim("blink");
      
    }
    
    function setTimerAnim(anim){
      var alertBlip = true;
      if(anim=="blink"){
        alertTimeInterval = setInterval(function(){
          if(alertBlip){
            timerArea.className = ('q-timer-area q-timer-area-alert');  
            alertBlip = false;
          } else {
            timerArea.className = ('q-timer-area q-timer-area-normal');        
            alertBlip = true;
          }
        },1000)
      } else if(anim=="normal") {
        timerArea.className = ('q-timer-area q-timer-area-normal'); 
        clearInterval(alertTimeInterval);
      }
    }
    //after defining all the vars and functions, start UI and reset game
    
    initUI();
    resetGame();  
    
  };//end of the "on load" function