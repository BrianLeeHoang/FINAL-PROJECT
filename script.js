//52 CARD BLACKJACK DECK
const ranks = [
  { label: 'A', value: [1, 11] },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: 'J', value: 10 },
  { label: 'Q', value: 10 },
  { label: 'K', value: 10 }
];
const suits = ['♠', '♥', '♦', '♣'];
//NAMES AND EMOJIS FOR THE BOTS
const BOT_NAMES = ["Mr.Maxwell", "Gregory", "Muhammad", "Elon", "Obama", "Lincoln", "Washington", "Trump", "Biden", "Ali", "Mr. Alpha", "Jamaican Botmon", "Brian", "Payton", "Matthew", "Austin"];
const BOT_EMOJIS = ["😭","😔","😡","😁","😂","😃","😅","😆","😉","😋","😍","🙂","😜","🤑","🤠","🤓", "👽","👴","🤡"];
let deck = [];
let activeTimeouts = [];
let isBotActive = false;

function calculateOptimalTotal(cards) {
    let total = 0;
    let aceCount = 0;
    
    cards.forEach(card => {
        if (Array.isArray(card.value)) {
            aceCount++;
            total += 11;
        } else {
            total += card.value;
        }
    });

    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount--;
    }
    return total;
}

function hasBlackjack(cards) {
    return cards.length === 2 && calculateOptimalTotal(cards) === 21;
}

function buildDeck() {
  deck = [];
  ranks.forEach(rank => suits.forEach(suit => deck.push({ label: rank.label, suit, value: rank.value })));
}

//BASICALLY PICKING RANDOM CARDS
function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function drawCard() {
  if (deck.length === 0) { buildDeck(); shuffleDeck(); }
  return deck.pop();
}

//CREATES CARD
function createCardElement(card) {
  const mapFace = { J: 'J', Q: '♛', K: '♚' };
  const display = mapFace[card.label] || card.label;

  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card');

  const top = document.createElement('div');
  top.classList.add('card-corner', 'top');
  top.textContent = `${card.label}${card.suit}`;

  const center = document.createElement('div');
  center.classList.add('card-center');
  center.textContent = mapFace[card.label] ? display : card.suit;

  const bottom = document.createElement('div');
  bottom.classList.add('card-corner', 'bottom');
  bottom.textContent = `${card.label}${card.suit}`;

  cardDiv.append(top, center, bottom);
  if (card.suit === '♥' || card.suit === '♦') cardDiv.classList.add('red');
  return cardDiv;
}

buildDeck(); 
shuffleDeck();

//DOM ELEMENTS
const startButton = document.getElementById('startGame');
const newCardButton = document.getElementById('newCard');
const standCardButton = document.getElementById('stand');
const doubleButton = document.getElementById('double');
const playerDeckDiv = document.querySelector('.player-side .deck');
const dealerDeckDiv = document.querySelector('.dealer-side .deck');
const bot1DeckDiv = document.querySelector('.bot1 .deck');
const bot2DeckDiv = document.querySelector('.bot2 .deck');
const playerSum = document.getElementById('playerSum');
const dealerSum = document.getElementById('dealerSum');
const bot1Sum = document.getElementById('bot1Sum');
const bot2Sum = document.getElementById('bot2Sum');
const gameMessage = document.getElementById('gameMessage');
const betLabel = document.getElementById('betLabel');

//GAME STATE
let playerCardsArray = [];
let dealerCardsArray = [];
let bot1CardsArray = [];
let bot2CardsArray = [];
let playerCardTotal = 0;
let dealerCardTotal = 0;
let bot1CardTotal = 0;
let bot2CardTotal = 0;
let betAmount = 0;
let isPlaying = false;
let canDouble = false;
let bot1Name = '';
let bot2Name = '';
let bot1Emoji = '';
let bot2Emoji = '';

function generateBotIdentity() {
    return {
        name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
        emoji: BOT_EMOJIS[Math.floor(Math.random() * BOT_EMOJIS.length)]
    };
}

//ALLOWS PLAYER TO PLACE BET
function placeBet() {
  gameMessage.textContent = "Enter your bet amount:";
  const msgDiv = document.getElementById('message');
  msgDiv.querySelectorAll('.bet-input, .bet-button').forEach(el => el.remove());

  const betInput = document.createElement('input');
  betInput.classList.add('bet-input');
  betInput.placeholder = 'Bet Amount';
  const betButton = document.createElement('button');
  betButton.classList.add('bet-button');
  betButton.textContent = 'Enter';
  msgDiv.append(betInput, betButton);

  betButton.onclick = () => {
    const val = betInput.value.trim();
    if (!/^\d+$/.test(val) || Number(val) <= 0) {
      gameMessage.textContent = "Invalid amount, re-enter bet";
      betInput.value = "";
      return;
    }
    betAmount = Number(val);
    betLabel.textContent = `Bet: $${betAmount}`;
    msgDiv.querySelectorAll('.bet-input, .bet-button').forEach(el => el.remove());
    startRound();
  };
}

//START GAME BUTTON FUNCTION
function startRound() {
  resetBoard(false);
  isPlaying = true;

  const bot1Identity = generateBotIdentity();
    const bot2Identity = generateBotIdentity();
    bot1Name = bot1Identity.name;
    bot2Name = bot2Identity.name;
    bot1Emoji = bot1Identity.emoji;
    bot2Emoji = bot2Identity.emoji;
    
    //Update DOM elements
    document.getElementById('bot1Name').textContent = `${bot1Emoji} ${bot1Name}`;
    document.getElementById('bot2Name').textContent = `${bot2Emoji} ${bot2Name}`;

  playerCardsArray = [drawCard(), drawCard()];
  bot1CardsArray = [drawCard(), drawCard()];
  bot2CardsArray = [drawCard(), drawCard()];
  dealerCardsArray = [drawCard(), drawCard()];

  renderDeck(playerDeckDiv, playerCardsArray);
  renderDeck(bot1DeckDiv, bot1CardsArray);
  renderDeck(bot2DeckDiv, bot2CardsArray);
  renderDeck(dealerDeckDiv, dealerCardsArray, true);

  updateBotTotals();
  dealerCardTotal = calculateOptimalTotal(dealerCardsArray);

  canDouble = true;
  doubleButton.disabled = false;

  startButton.textContent = 'Reset Game';
  startButton.onclick = resetGame;

  chooseAce();
  updateSums();
}

//RENDER DECKS
function renderDeck(container, cards, hideHole = false) {
  container.innerHTML = '<p>Cards:</p>';
  cards.forEach((card, idx) => {
    if (hideHole && idx === 0) {
      const hole = document.createElement('div');
      hole.classList.add('card', 'hole');
      container.appendChild(hole);
    } else container.appendChild(createCardElement(card));
  });
}

//ALLOWS PLAYER TO PICK BETWEEN 1 AND 11 WHEN THEY HAVE ACE
function chooseAce() {
  if (playerCardsArray.some(c => Array.isArray(c.value))) {
    isPlaying = false;
    gameMessage.textContent = 'You got an Ace! Choose 11 or 1:';
    const msgDiv = document.getElementById('message');
    const btn11 = document.createElement('button');
    const btn1 = document.createElement('button');
    [btn11, btn1].forEach(btn => btn.classList.add('ace-decision'));
    btn11.textContent = '11'; 
    btn1.textContent = '1';
    msgDiv.append(btn11, btn1);
    
    btn11.onclick = () => {
      playerCardsArray.forEach(c => { if (Array.isArray(c.value)) c.value = 11; });
      btn11.remove(); 
      btn1.remove();
      gameMessage.textContent = '';
      isPlaying = true;
      updateSums();
      canDouble = false;
      doubleButton.disabled = true;
    };
    
    btn1.onclick = () => {
      playerCardsArray.forEach(c => { if (Array.isArray(c.value)) c.value = 1; });
      btn11.remove(); 
      btn1.remove();
      gameMessage.textContent = '';
      isPlaying = true;
      updateSums();
      canDouble = false;
      doubleButton.disabled = true;
    };
  }
}

//PLAYS BOTS AND DEALERS ACCORDING TO BLACKJACK STRATEGY (DRAW WHEN LESS THAN 17 STAND WHEN OVER)
async function playBotsAndDealer() {
  if (!isBotActive) return;
  
  await playBot(bot1CardsArray, bot1DeckDiv, bot1Sum);
  if (!isBotActive) return;
  
  await playBot(bot2CardsArray, bot2DeckDiv, bot2Sum);
  if (!isBotActive) return;

  renderDeck(dealerDeckDiv, dealerCardsArray);
  dealerCardTotal = calculateOptimalTotal(dealerCardsArray);
  dealerSum.textContent = `Sum: ${dealerCardTotal}`;

  while (calculateOptimalTotal(dealerCardsArray) < 17 && isBotActive) {
    await new Promise(r => {
      const timeout = setTimeout(() => {
        if (!isBotActive) return r();
        
        const newCard = drawCard();
        dealerCardsArray.push(newCard);
        dealerCardTotal = calculateOptimalTotal(dealerCardsArray);
        renderDeck(dealerDeckDiv, dealerCardsArray);
        dealerSum.textContent = `Sum: ${dealerCardTotal}`;
        r();
      }, 50);
      activeTimeouts.push(timeout);
    });
  }
}

//BOTS PLAY
async function playBot(botCards, botDeckDiv, botSumElement) {
  return new Promise(resolve => {
    if (!isBotActive) return resolve();
    
    const botPlay = () => {
      if (!isBotActive) return resolve();
      
      const total = calculateOptimalTotal(botCards);

      if (total < 17) {
        const timeout = setTimeout(() => {
          if (!isBotActive) return resolve();
          
          botCards.push(drawCard());
          renderDeck(botDeckDiv, botCards);
          botSumElement.textContent = `Sum: ${calculateOptimalTotal(botCards)}`;
          botPlay();
        }, 50);
        activeTimeouts.push(timeout);
      } else {
        resolve();
      }
    };
    
    botPlay();
  });
}

//STAND BUTTON FUNCTION
async function standCard() {
  if (!isPlaying) return;
  isPlaying = false;
  isBotActive = true;
  
  await new Promise(r => {
    const timeout = setTimeout(r, 50);
    activeTimeouts.push(timeout);
  });
  
  await playBotsAndDealer();
  isBotActive = false;
  
  if (isPlaying) return;
  const result = getResult();
  displayResult(result);
  endRound(result);
}

//ADD CARD BUTTON FUNCTION
function addCard() {
  if (!isPlaying) return;
  playerCardsArray.push(drawCard());
  renderDeck(playerDeckDiv, playerCardsArray);
  chooseAce();
  updateSums();
  canDouble = false;
  doubleButton.disabled = true;

  if (calculateOptimalTotal(playerCardsArray) >= 21) {
    isBotActive = true;
    const timeout = setTimeout(async () => {
      await playBotsAndDealer();
      isBotActive = false;
      if (isPlaying) return;
      const result = getResult();
      displayResult(result);
      endRound(result);
    }, 50);
    activeTimeouts.push(timeout);
  }
}

//DOUBLE DOWN BUTTON FUNCTION
function doubleDown() {
  if (!isPlaying || !canDouble) return;
  
  betAmount *= 2;
  betLabel.textContent = `Bet: $${betAmount}`;
  
  playerCardsArray.push(drawCard());
  renderDeck(playerDeckDiv, playerCardsArray);
  
  updateSums();
  
  //FORCE END OF PLAYER TURN
  isPlaying = false; 
  canDouble = false;
  doubleButton.disabled = true;
  
  isBotActive = true;
  const timeout = setTimeout(async () => {
    await playBotsAndDealer();
    isBotActive = false;
    const result = getResult();
    displayResult(result);
    endRound(result); 
  }, 50);
  activeTimeouts.push(timeout);
}

//UPDATE PLAYER AND DEALER SUMS
function updateSums() {
  playerCardTotal = calculateOptimalTotal(playerCardsArray);
  playerSum.textContent = `Sum: ${playerCardTotal}`;
  dealerSum.textContent = isPlaying ? 'Sum: ?' : `Sum: ${dealerCardTotal}`;

  if (isPlaying && playerCardTotal >= 21) {
    isPlaying = false;
    const result = getResult();
    displayResult(result);
  }
}

//UPDATE BOT CARD SUMS
function updateBotTotals() {
    bot1CardTotal = calculateOptimalTotal(bot1CardsArray);
    bot2CardTotal = calculateOptimalTotal(bot2CardsArray);
    
    bot1Sum.textContent = `Sum: ${bot1CardTotal}`;
    bot2Sum.textContent = `Sum: ${bot2CardTotal}`;
}

//COMPARE YOUR HAND TO THE BOTS AND DEALER
function compareHands(playerCards, opponentCards) {
    const playerTotal = calculateOptimalTotal(playerCards);
    const opponentTotal = calculateOptimalTotal(opponentCards);
    const playerBJ = hasBlackjack(playerCards);
    const opponentBJ = hasBlackjack(opponentCards);

    if (playerTotal > 21) return 'lose';
    if (opponentTotal > 21) return 'win';
    
    if (playerBJ && !opponentBJ) return 'win';
    if (!playerBJ && opponentBJ) return 'lose';
    if (playerBJ && opponentBJ) return 'push';
    
    if (playerTotal > opponentTotal) return 'win';
    if (playerTotal < opponentTotal) return 'lose';
    return 'push';
}

//ACQUIRES RESULTS
function getResult() {
    return {
        dealer: compareHands(playerCardsArray, dealerCardsArray),
        bot1: compareHands(playerCardsArray, bot1CardsArray),
        bot2: compareHands(playerCardsArray, bot2CardsArray)
    };
}

//DISPLAYS RESULTS AT THE END OF A ROUND
function displayResult(results) {
    let dealerMessage = '';
    const botMessages = [];
    let winCount = 0, lossCount = 0, pushCount = 0;

    const playerBJ = hasBlackjack(playerCardsArray);
    const dealerBJ = hasBlackjack(dealerCardsArray);
    
    //DEALER RESULT
    switch(results.dealer) {
        case 'win':
            dealerMessage = dealerBJ ? "Dealer has Blackjack! You lose!" 
                           : "You beat the Dealer!";
            winCount += playerBJ ? 0 : 1;
            break;
        case 'lose':
            dealerMessage = playerBJ ? "Blackjack! You beat the Dealer!" 
                           : "You lost to the Dealer!";
            lossCount += dealerBJ ? 0 : 1;
            break;
        case 'push':
            dealerMessage = playerBJ && dealerBJ ? "Both have Blackjack! Push!" 
                           : "You tied with the Dealer!";
            pushCount++;
            break;
    }

    //BOT RESULTS
    [[bot1Name, results.bot1, bot1CardsArray], 
     [bot2Name, results.bot2, bot2CardsArray]].forEach(([name, result, cards]) => {
        const botBJ = hasBlackjack(cards);
        let message = '';
        
        switch(result) {
            case 'win':
                message = botBJ ? `${name} has Blackjack! You lose` 
                            : `beat ${name}`;
                winCount += botBJ ? 0 : 1;
                break;
            case 'lose':
                message = playerBJ ? `Blackjack! You beat ${name}` 
                            : `lost to ${name}${botBJ ? ' (Blackjack)' : ''}`;
                lossCount += botBJ ? 0 : 1;
                break;
            case 'push':
                message = (playerBJ && hasBlackjack(cards)) ? `both have Blackjack vs ${name}` 
                         : `tied with ${name}`;
                pushCount++;
                break;
        }
        botMessages.push(message);
    });

    //make final message
    let finalMessage = dealerMessage;
    
    if (botMessages.length > 0) {
        finalMessage += ` You ${botMessages.join(', ')}.`;
    }

    //Special cases
    if (calculateOptimalTotal(playerCardsArray) > 21) {
        finalMessage = "Busted! You lost to all players!";
    } else if (winCount === 3) {
        finalMessage = "Perfect round! You beat everyone!";
    } else if (lossCount === 3) {
        finalMessage = "Tough luck! You lost to all players!";
    }

    gameMessage.textContent = finalMessage;
}

//UPDATES AT THE END OF A ROUND
function endRound() {
    const results = getResult();
    
    //Update bet based on results
    if (hasBlackjack(playerCardsArray)) {
        betAmount = Math.floor(betAmount * 1.5); //Blackjack pays 3:2
    } else if (
        results.dealer === 'lose' || 
        results.bot1 === 'lose' || 
        results.bot2 === 'lose'
    ) {
        betAmount = 0; //Lose entire bet if any loss
    } else {
        //Only check dealer result if no losses to any players
        switch(results.dealer) {
            case 'win': 
                betAmount *= 2; //Double bet if beating dealer
                break;
            case 'push': 
                //No change for push
                break;
        }
    }

    betLabel.textContent = `Bet: $${betAmount}`;
    displayResult(results);
    playAgain(betAmount === 0); // Only require new bet if lost
}

//PLAY AGAIN FUNCTION
function playAgain(needBet) {
  const gameDiv = document.getElementById('gameDiv');
  const btn = document.createElement('button');
  btn.classList.add('game-button');
  btn.textContent = 'Play Again';
  gameDiv.prepend(btn);
  btn.onclick = () => { btn.remove(); needBet ? placeBet() : startRound(); };
}

//RESET GAME
function resetGame() {
  startButton.textContent = 'Start Game';
  startButton.onclick = placeBet;
  resetBoard(true);
}

//COMPLETE RESET OF THE GAME
function resetBoard(clearBet) {
  activeTimeouts.forEach(clearTimeout);
  activeTimeouts = [];
  isBotActive = false;
  isPlaying = false;
  gameMessage.textContent = '';
  document.getElementById('message').querySelectorAll('.ace-decision').forEach(el => el.remove());
  
  playerCardsArray = [];
  dealerCardsArray = [];
  bot1CardsArray = [];
  bot2CardsArray = [];
  
  playerCardTotal = 0;
  dealerCardTotal = 0;
  bot1CardTotal = 0;
  bot2CardTotal = 0;
  
  playerDeckDiv.innerHTML = '<p>Cards:</p>';
  dealerDeckDiv.innerHTML = '<p>Cards:</p>';
  bot1DeckDiv.innerHTML = '<p>Cards:</p>';
  bot2DeckDiv.innerHTML = '<p>Cards:</p>';
  playerSum.textContent = 'Sum: 0';
  dealerSum.textContent = 'Sum: 0';
  bot1Sum.textContent = 'Sum: 0';
  bot2Sum.textContent = 'Sum: 0';
  
  if (clearBet) {
    betAmount = 0;
    betLabel.textContent = `Bet: $${betAmount}`;
  }
}
//EVENT LISTENERS
startButton.addEventListener('click', placeBet);
newCardButton.addEventListener('click', addCard);
standCardButton.addEventListener('click', standCard);
doubleButton.addEventListener('click', doubleDown);
