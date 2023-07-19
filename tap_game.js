// Get screen dimensions
const screen_height = document.body.scrollHeight;
const screen_width = document.body.scrollWidth;

// Define sigmoid function
function sigmoid(z, k = 2) {
  return 1 / (1 + Math.exp(-z/k));
}

// Set variables
const new_wins = {
    top_player: 0,
    bottom_player: 0,
    increment: 5 // Starting value
};

var s;

let increment;
let beginGame = false;
let timesUp = false;
let countDownInterval;
let reaction_interval;

let topPlayerScore;
let bottomPlayerScore;

let top_player_clicks = 0;
let bottom_player_counts = 0;

let topPlayer = document.querySelector(".playerTop");
let bottomPlayer = document.querySelector(".playerBottom");

let topPlayerLayer = document.querySelector(".playerTopLayer");
let bottomPlayerLayer = document.querySelector(".playerBottomLayer");

let layerContainer = document.querySelector(".layers");

// Set-up game mechanisms
/// Menu
const game_menu = (visible = true) => {
    // Select menu container
    const menu = document.querySelector(".menu-container");

    // Display outcome
    if (top_player_clicks > bottom_player_counts) {
        set_menu_heading("Blue Won!", "skyblue")
        set_menu_subheading(`You tapped the screen ${bottom_player_counts} times.`)
    } else {
        set_menu_heading("Red Won!", "red")
        set_menu_subheading(`Red tapped the screen ${bottom_player_counts} times.`)
    }
    
    // NOT SURE WHAT THIS DOES
    if(visible)
    return menu.style.visibility = 'visible';
    return menu.style.visibility = 'hidden';
}

const set_menu_heading = (text = "New Game" , color = "black") => {
    const heading = document.querySelector("#heading");
    heading.innerHTML = text;
    return heading.style.color = color;
}

const set_menu_subheading = (text = "New Game" ) => {
    const heading = document.querySelector("#subHeading");
    return heading.innerHTML = text;
}

// Toggle layer visibility
const toggle_layer_visibility = (visible = true) => {
    return layerContainer.style.visibility =  visible ?  "visible" : "hidden";
}

// Update colors
const update_top_color = (democrat = true) => {
    return topPlayer.style.backgroundColor =  democrat ?  "red" : "skyblue";
}

const update_bottom_color = (democrat = true) => {
    return bottomPlayer.style.backgroundColor =  democrat ?  "skyblue" : "red";
}

// Timers
const set_timer_span = (value) => {
    const timerSpans = document.querySelectorAll("#timer");

    timerSpans.forEach(element => {
        element.innerHTML = value;
    });
}

const startGame = (countDowntimer = true, matchTime = 15) => {

    toggle_layer_visibility(visible = false);
    set_timer_span("3");
    game_menu(visibility = false);

    let count = 3;
    countDownInterval = setInterval(() => {
        
        if(--count == 0){
            if(!beginGame) {
                set_timer_span("Tap 👆");
                beginGame = true;
                count = matchTime;
            }
            else {
                set_timer_span(0);
                timesUp = true;
                check_winner(timesup = true);
                clearInterval(countDownInterval); 
            }
        }
        else {
            set_timer_span(count);
        }

    }, 1000)

    reaction_interval = setInterval(() => {
        if (beginGame) {
            s = sigmoid(bottom_player_counts - top_player_clicks + 3, k = 2);

            if (Math.random() < s) {
                top_player_clicks++;
                setTopPlayerScore(increment);
                check_winner();
            }

            if (count == 0) {
                clearInterval(reaction_interval); 
            }
        }
    }, 100)
}

// More stuff
const set_dynamic_increment = (percentage_of_height = 0.03) => {
    new_wins.increment =  screen_height * percentage_of_height;
}

const get_wins = () => {
    if (sessionStorage.getItem("wins")) {
        const wins = JSON.parse(sessionStorage.getItem("wins"));
        return wins;
    }

    return 0;
};

const reset_clicks = () => {
    top_player_clicks = 0;
    bottom_player_counts = 0;
    return (topPlayer.style.height = "50%");
};

const new_game = () => {
    if (get_wins()) {
        let wins = get_wins();
        topPlayerScore = wins["top_player"];
        bottomPlayerScore = wins["bottom_player"];
        increment = wins["increment"];

        return update_wins_UI(topPlayerScore, bottomPlayerScore)
    } else {
        sessionStorage.setItem("wins", JSON.stringify(new_wins));
        
        return increment = new_wins.increment;
    }
};

const update_wins = (topWinner) => {
    let wins = get_wins();

    if (wins) {
        clearInterval(countDownInterval);
        
        if (topWinner) wins["top_player"] += 1;
        else wins["bottom_player"] += 1;

        update_wins_UI(topPlayerScore = wins['top_player'], bottomPlayerScore = wins['bottom_player']);

        game_menu(visible = true);
        toggle_layer_visibility(visible = true);

        sessionStorage.setItem("wins", JSON.stringify(wins));
        return reset_clicks();
    }

    return 0;
};

const update_wins_UI = (topPlayerScore, bottomPlayerScore) => {
    document.querySelector("#topPlayerScore").innerHTML = topPlayerScore
    document.querySelector("#bottomPlayerScore").innerHTML = bottomPlayerScore
}

const get_top_margin = () => {
    return parseFloat(window.getComputedStyle(topPlayer).height.match(/\d+/));
};

const get_bottom_margin = () => {
    return parseFloat(screen_height - get_top_margin());
};

const setTopPlayerScore = (increment) => {
    topPlayer.style.height =
    get_top_margin() + increment > 0
        ? `${get_top_margin() + increment}px`
        : "0px";
};

const check_winner = (timesup = false) => {

    // If top player has won
    if (get_top_margin() >= screen_height || (timesup && (get_top_margin() >= get_bottom_margin()) )) {
        update_wins((topWinner = true));

        beginGame = false;
        timesUp = false;
        return 0;
    }
    
    // If bottom player has won
    if (((get_top_margin() == 0 && (top_player_clicks || bottom_player_counts))) || (timesup && (get_top_margin() <= get_bottom_margin()) )) {
        update_wins((topWinner = false));

        beginGame = false;
        timesUp = false;
        return 0;
    }
};

// Listen for PID
window.addEventListener('message', function(event) {
    let pid2 = event.data;

    console.log("Message received")

    if (pid2 == "Democrat") {
        update_top_color(democrat = true)
        update_bottom_color(democrat = true)
    }
});

// Start game
bottomPlayer.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (beginGame) {
        bottom_player_counts++;
        setTopPlayerScore(-increment);
        check_winner();
    }
});

set_dynamic_increment();
new_game();