
require("dotenv").config();
const keys = require("./keys");
const Spotify = require("node-spotify-api");
const Twitter = require("twitter");
const request = require("request");
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');
const spotify = new Spotify(keys.spotify);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.yellow('For a list of commands type "help" > ')
});
console.log(chalk.blue('my-tweets\nspotify-this-song [song]\nmovie-this [movie]\ndo-what-it-says\nexit'));
const commands = (params) => {
    switch (params[0]) {
        case 'my-tweets':
            getTweets();
            break;
        case `spotify-this-song`:
            (!params[1]) ? spotSearch('hey joe') : spotSearch(params[1]);
            break;
        case `movie-this`:
            (!params[1]) ? getMovie('Zardoz') : getMovie(params[1]);
            break;
        case `do-what-it-says`:
            doWhatItSays();
            break;
        case 'exit':
            console.log(chalk.bold('Have a great day!'));
            process.exit(0)
            break;
        case 'help':
            console.log(chalk.blue('my-tweets\nspotify-this-song [song]\nmovie-this [movie]\ndo-what-it-says\nexit'));
            break;
        default:
            console.log("LIRI doesn't know that");
    }
}
//spotify
let spotSearch = (song) => {
    spotify.search({
        type: 'track',
        query: song,
        limit: 5
    }, (err, data) => {
        if (err) {
            return console.log(chalk.red('Error occurred: ' + err));
            writeToLog('Error occurred: ' + err);
        }
        data.tracks.items.forEach(element => {
            element.artists.forEach(x => { console.log(chalk.green('\nartist(s): ') + x.name), writeToLog('artist(s): ' + x.name) })
            console.log(chalk.green('song name: ') + element.name);
            writeToLog('song name: ' + element.name);
            console.log(chalk.green('preview song: ') + element.preview_url);
            writeToLog('preview song: ' + element.preview_url);
            console.log(chalk.green('album: ') + element.album.name);
            writeToLog('album: ' + element.album.name);
        });
        rl.prompt();
    });
}
// twitter stuff
let getTweets = () => {
    let params = {
        //I took a thing out here q: thought it was a username but can't find an answer on it. it seems to work without it though
        //something tells me it's going to break for someone though
        count: 20
    }

    const client = new Twitter(keys.twitter);
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            let time = [];
            tweets.forEach(element => {
                let time = element.created_at.split(' ');
                time.splice(4, 1);
                console.log(chalk.green('\n' + time.join(' ') + ': ') + element.text);
                writeToLog(time.join(' ') + ': ' + element.text);
            });
        } else {
            console.log(chalk.red('Error occurred: ' + error));
            writeToLog(error);
        }
        rl.prompt();
    });
}

//movie stuff
var getMovie = function (movieName) {
    console.log(movieName)
    let urlHit = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=full&tomatoes=true&apikey=trilogy";
    request(urlHit, function (error, response, body) {
        let jsonData = JSON.parse(body);

        if (!error && response && !jsonData.Error) {
            //the only reason I use both data and all those logs is aesthetic 
            console.log(jsonData.Ratings[1])
            let data = {
                Title: jsonData.Title,
                Year: jsonData.Year,
                Rated: jsonData.Rated,
                IMDB_Rating: jsonData.imdbRating,
                Country: jsonData.Country,
                Language: jsonData.Language,
                Plot: jsonData.Plot,
                Actors: jsonData.Actors,
                Rotten_Tomatoes_Rating: (!jsonData.Ratings[1]) ? ' ' : jsonData.Ratings[1].Value
            };
            writeToLog(data);
            console.log(chalk.green("Title: ") + jsonData.Title)
            console.log(chalk.green("Year: ") + jsonData.Year)
            console.log(chalk.green("Rated: ") + jsonData.Rated)
            console.log(chalk.green("IMDB Rating: ") + jsonData.imdbRating)
            console.log(chalk.green("Country: ") + jsonData.Country)
            console.log(chalk.green("Language: ") + jsonData.Language)
            console.log(chalk.green("Plot: ") + jsonData.Plot)
            console.log(chalk.green("Actors: ") + jsonData.Actors)
            console.log(chalk.green("Rotten Tomatoes Rating: ") + (!jsonData.Ratings[1]) ? ' ' : jsonData.Ratings[1].Value)
        } else if (error) {
            console.log(chalk.red('Error occurred: ' + error));
            writeToLog(error);
        } else if (jsonData.Error) {
            console.log(chalk.red('Error occurred: ' + jsonData.Error));
            writeToLog(jsonData.error);
        }
        rl.prompt();
    });
};
//the other one
const doWhatItSays = () => {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            console.log(chalk.red('Error occurred: ' + error));
        } else {
            let dataArr = data.split(",");
            if (dataArr.length === 2) {
                dataArr[1] = dataArr[1].replace('"', ' ');
                dataArr[1] = dataArr[1].replace('"', ' ');
                dataArr[1] = dataArr[1].trim();
            }
            commands(dataArr);
            rl.prompt();
        }
    });
};

let writeToLog = (data) => {
    let t = new Date();
    fs.appendFile("log.txt", '{' + t + '}' + JSON.stringify(data) + "\n", function (err) {
        if (err) {
            return console.log(chalk.red('Error occurred: ' + err));
        }
    });
};


rl.prompt();
rl.on('line', (line) => {
    let arr = line.trim().split(' ');
    const answ = [arr.shift(), arr.join(' ')];
    commands(answ);
}).on('close', () => {
    console.log(chalk.bold('Have a great day!'));
    writeToLog('app closed');
    process.exit(0);
});