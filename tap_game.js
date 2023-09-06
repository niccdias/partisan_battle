// Get screen dimensions
const screen_height = document.body.scrollHeight;
const screen_width = document.body.scrollWidth;

// Define sigmoid function
function sigmoid(input = 0, shape = 2) {
  return 1 / (1 + Math.exp(-input / shape));
}

// Define shuffle function
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// Set variables
let click_increment = screen_height * 0.03;
let game_began = false;
let countdown_interval;
let player_outcome = "W";

let reaction_interval;
let margin = 0;
let shallowness = 1.5;
var tap_prob;

let top_player_score;
let bottom_player_score;
let top_player_clicks = 0;
let bottom_player_clicks = 0;

let top_player_pid = "Democrat";
let bottom_player_pid = "Republican";
let top_player_color = "#0143ca";
let bottom_player_color = "#e9141e";
let top_player = document.querySelector(".topPlayer");
let bottom_player = document.querySelector(".bottomPlayer");
let layer_container = document.querySelector(".layers");
let logo_container = document.querySelector(".logos");
let top_logo = document.getElementById("top-logo");
let bottom_logo = document.getElementById("bottom-logo");

let top_player_total = document.getElementById("topPlayerTotal");
let bottom_player_total = document.getElementById("bottomPlayerTotal");
let in_party_total = 0
let out_party_total = 0

let losing_messages = shuffle([
    `Sad. 😔 Try tapping faster!`,
    `Did you even try? That was bad. 😬`,
    `Are you tapped out? 🤨 It's like you're not trying.`,
    `Oof. 😂 Don't quit your day job.`
]);

let winning_messages = shuffle([
    `Nice job, champion! 🏆`,
    `Impressive. That was fast. 😅`,
    `You've tapped into your potential! 😲`,
    `You got 'em good!`
]);

// Set-up game mechanisms
/// Menu
const game_menu = (visible = true) => {
    // Display outcome
    if (get_top_margin() >= get_bottom_margin()) {
        set_menu_heading(`${top_player_pid}s WIN!`, top_player_color)
        set_menu_subheading(losing_messages[1])
    } else {
        set_menu_heading(`${bottom_player_pid}s WIN!`, bottom_player_color)
        set_menu_subheading(winning_messages[1])
    }

    // Toggle menu's visibility
    const menu = document.querySelector(".menu-container");
    return menu.style.visibility =  visible ?  "visible" : "hidden";
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

/// Toggling layer visibility
const toggle_layer_visibility = (visible = true) => {
    return layer_container.style.visibility =  visible ?  "visible" : "hidden";
}

/// Setting timer spans
const change_timer_text = (value, size = "5vh") => {
    const timer_spans = document.querySelector("#timer");
    timer_spans.innerHTML = value;
    timer_spans.style.fontSize = size;
}

const change_timer_background = (value) => {
    const timer_container = document.querySelector(".timer-container");
    timer_container.style.backgroundColor = value;
}

/// Starting the game
const start_game = () => {

    // Hide layers
    toggle_layer_visibility(visible = false);

    // Show play button
    logo_container.style.visibility = "visible";

    // Set preliminary countdown
    let time_left = 3;

    // Hide game menu
    game_menu(visible = false);

    // Initiate countdown
    countdown_interval = setInterval(() => {

        // Increment countdown
        --time_left;

        // Rev up
        if (!game_began) {
            if (time_left == 2) {
                change_timer_text("Ready...");
            } else if (time_left == 1) {
                change_timer_text("Set...");
            } else if (time_left <= 0) {
                change_timer_text("TAP!👇");
                game_began = true;
                time_left = 15;
            }
        } else {
            if (time_left <= 0) {
                change_timer_background("transparent");
                change_timer_text("");
                check_for_winner(times_up = true);
            } else if (time_left <= 5) {
                change_timer_background("black");
                change_timer_text(time_left, size = "7vh");
            } else {
                change_timer_text(time_left);
            }
        }

    }, 1000)

    // Awaken the computer
    reaction_interval = setInterval(() => {
        if (game_began) {
            tap_prob = sigmoid(
                bottom_player_clicks - top_player_clicks + margin,
                shallowness
            );

            if (Math.random() < tap_prob) {
                top_player_clicks++;
                set_top_player_score(click_increment);
                check_for_winner();
            }

            if (time_left == 0) {
                clearInterval(reaction_interval); 
            }
        }
    }, 100)
}

/// Ending the game
const end_game = () => {
    // Terminate countdown
    clearInterval(countdown_interval);

    // Hide play button
    logo_container.style.visibility = "hidden";

    // Update button
    const button = document.getElementById("start_button");
    button.innerHTML = "Next Game";

    // Make game menu visible
    game_menu(visible = true);
    toggle_layer_visibility(visible = true);

    // Reset margins
    top_player.style.height = "50%"

    return 0;
}

/// Start button
const start_button_pressed = () => {
    if(!game_began) {
        start_game()
    } else{
        window.parent.postMessage(player_outcome, '*');
    }

    return 0;
}

/// Updating scores
const get_top_margin = () => {
    return parseFloat(window.getComputedStyle(top_player).height.match(/\d+/));
};

const get_bottom_margin = () => {
    return parseFloat(screen_height - get_top_margin());
};

const set_top_player_score = (click_increment) => {
    top_player.style.height =
    get_top_margin() + click_increment > 0
        ? `${get_top_margin() + click_increment}px`
        : "0px";
};

const check_for_winner = (times_up = false) => {
    // If top player has won
    if (get_top_margin() >= screen_height || (times_up && (get_top_margin() >= get_bottom_margin()) )) {
        player_outcome = "L" + bottom_player_clicks.toString();
        out_party_total = out_party_total + 0.25;
        top_player_total.innerHTML = "$" + out_party_total.toFixed(2);
        end_game();
    }
    
    // If bottom player has won
    if (((get_top_margin() == 0 && (top_player_clicks || bottom_player_counts))) || (times_up && (get_top_margin() < get_bottom_margin()) )) {
        player_outcome = "W" + bottom_player_clicks.toString();
        in_party_total = in_party_total + 0.25;
        bottom_player_total.innerHTML = "$" + in_party_total.toFixed(2);
        end_game();
    }

    return 0;
};

// Listening for clicks
const play_button_pressed = () => {
    if (game_began) {
        bottom_player_clicks++;
        set_top_player_score(-click_increment);
        check_for_winner();
    }
};

// Grab query strings
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

// Update totals
if(params.out_party_total) {
    out_party_total = parseFloat(params.out_party_total);
    top_player_total.innerHTML = "$" + out_party_total.toFixed(2);
}

if(params.in_party_total) {
    in_party_total = parseFloat(params.in_party_total);
    bottom_player_total.innerHTML = "$" + in_party_total.toFixed(2);
}

// Update game apperence
if (params.player_pid == "Democrat") {
    // Update color variables
    top_player_color = "#e9141e";
    bottom_player_color = "#0143ca";
    top_player.style.backgroundColor = top_player_color;
    bottom_player.style.backgroundColor = bottom_player_color;

    // Update logos
    top_logo.src = "rep_logo.png";
    bottom_logo.src = "dem_logo.png";

    // Update top and bottom players' PID
    top_player_pid = "Republican";
    bottom_player_pid = "Democrat";
}

// Update difficulty
if(params.margin) {
    margin =  parseInt(params.margin);
}

if(params.shallowness) {
    shallowness = params.shallowness;
}