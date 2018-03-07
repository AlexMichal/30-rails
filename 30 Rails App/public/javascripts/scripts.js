var g_currentGameMode = ""
var g_mountainRow = 0;
var g_lastTrackTileRolled = 0;
var g_lastSelectedTile = "";
var g_lockedTiles = [];
var g_lockedStation = [];
var g_lockedMountains = [];
var g_overrideNumberSelected = false;
var g_overrideTrackSelected = false;
var g_overrideTrackSixSelected = false;
var g_rowAndColumnRolled = 0;
var g_skipPressed = false;
var g_stationNumber;
var g_trackTileRolled = 0;
var g_inputBoxes = [
    "1to2",
    "1to3",
    "1to4",
    "2to3",
    "2to4",
    "3to4"
];
var GAME_MODE = Object.freeze({
    "PLAYING" : 1,
    "SETUP" : 2,
    "MOUNTAIN" : 3,
    "STATION" : 4
});
var TILE_TYPE = Object.freeze({
    "TRACK" : 1,
    "MOUNTAIN" : 2,
    "STATION" : "station" // TODO can i do something with this?
});

const ROTATE90 = "rotate90";
const ROTATE180 = "rotate180";
const ROTATE270 = "rotate270";
const GROUND_IMAGES = [
  "ground1.png",
  "ground2.png",
  "ground3.png"
];
const MOUNTAIN_IMAGES = [
  "mountain1.png",
  "mountain2.png",
  "mountain3.png"
];

$(document).ready(function() {
    g_currentGameMode = GAME_MODE.PLAYING;

    // create playfield.
    populatePlayfieldGrid();

    // playfield tiles:
    $(".tile.ground").on("click", function() {
        switch (g_currentGameMode) {
            case GAME_MODE.SETUP:
                // choose mine second
                // is in valid spot: orthogonally adjedcent to a img_mountain tile AND is not LOCKED
                // first, add shadow to the areas where you can place a mine
                
                // choose stations second

                break;
            case GAME_MODE.PLAYING:
                // if the tile is NOT locked, a NEW track is selected, and if it's the correct row/column
                if ((!isLocked(this)) && (g_trackTileRolled !== 0) && (isInValidRowOrColumn(this, g_rowAndColumnRolled) || g_overrideNumberSelected)) {
                    if (this === g_lastSelectedTile) {
                        rotateTile(this);
                    } else {
                        // clear and reset the last tile location if it's not a locked tile
                        if (!g_lockedTiles.includes(g_lastSelectedTile)) $(g_lastSelectedTile).children(".img_track").remove();

                        placeTile(this, TILE_TYPE.TRACK);
                    }
                }
                break;
        }
    });

    // roll dice
    $(".tile.white.roll").on("click", function() {
        rollDice();
    });

    // reset playfield
    $("#btn_reset").on("click", function() {
        resetGame();
    });

    // skip mountain tile.
    $("#btn_skip").on("click", function() {
        skipLastMountainTile();
    });

    // stations:
    // top
    $(".tile.top.station").on("click", function() {
        if (g_currentGameMode == GAME_MODE.SETUP) {
            if (!g_lockedStation.includes("top")) { 
                g_lockedStation.push("top");
                
                $(this).html(++g_stationNumber);

                $(".tile.top.station").removeClass("shadow");
            }
        }
    });

    // left
    $(".tile.left.station").on("click", function() {
        if (!g_lockedStation.includes("left")) {
            g_lockedStation.push("left");

            $(this).html(++g_stationNumber);

            $(".tile.left.station").removeClass("shadow");
        }
    });

    // bottom
    $(".tile.bottom.station").on("click", function() {
        if (!g_lockedStation.includes("bottom")) {
            g_lockedStation.push("bottom");

            $(this).html(++g_stationNumber);

            $(".tile.bottom.station").removeClass("shadow");
        }
    });

    // right
    $(".tile.right.station").on("click", function() {
        if (!g_lockedStation.includes("right")) {
            g_lockedStation.push("right");

            $(this).html(++g_stationNumber);

            $(".tile.right.station").removeClass("shadow");
        }
    });

    // override number button
    $("#override_number").on("click", function() {
        makeAllUnlockedTilesAvailable();
    });

    // override track button
    $("#override_track").on("click", function() {
        makeAllTracksAvailable();
    });

    // tracks:
    // track_one
    $("#track_one").on("click", function () {
        overrideTrackSelected(1);
    });
    
    // track_two
    $("#track_two").on("click", function () {
        overrideTrackSelected(2);
    });
    
    // track_three
    $("#track_three").on("click", function () {
        overrideTrackSelected(3);
    });
    
    // track_four
    $("#track_four").on("click", function () {
        overrideTrackSelected(4);
    });
    
    // track_five
    $("#track_five").on("click", function () {
        overrideTrackSelected(5);
    });
    
    // track_six_one
    $("#track_six_one").on("click", function () {
        overrideTrackSelected(6);
    });
    
    // track_six_two
    $("#track_six_two").on("click", function () {
        overrideTrackSelected(7);
    });

    // summing input boxes
    $(document).on("change", "input", function() {
        // sum each row
        addUpSum(this);
    });

    $(".tile.station").on("click", function() {
        if (g_currentGameMode === GAME_MODE.STATION) {
            placeTile(this, TILE_TYPE.STATION);
        }
    });

    $("#btn_set_station").on("click", function() {
        // TODO add functionality for setting stations
        g_currentGameMode = GAME_MODE.STATION;

        // add shadow to each side row and column
        if (g_lockedStation.length === 4) {
            // grey out this button. the only way to ungrey it is to reset the whole game.

            $(this).removeClass("shadow_blue");
        } else {
            // add blue shadow to this button
            $(this).addClass("shadow_blue");
        }
        // once you click on this button again AND all 4 sides have a station, 
        // --> add the tiles to the station array
    });
});

function addUpSum() { // TODO doesnt work properly
    g_inputBoxes.forEach(function(element) {
        var rowSum = 0;
        var colSum = 0;

        $("." + element).each(function() {
            // add up each row.
            rowSum += +$(this).val();

            // add up all row sums.
            colSum += rowSum;
        });

        // add up col sum with the mines value.
        colSum += +$(".minesSum").val();

        // display row sums.
        $("." + element + "sum").val(rowSum);

        // display total sum (column).
        $(".totalSum").val(colSum); // TODO not working properly
    });
}

function rollDice() {
    g_rowAndColumnRolled = getRandomNumber();
    g_overrideNumberSelected = false;
    g_overrideTrackSelected = false;
    g_overrideTrackSixSelected = false;
    
    clearShadowFromTheGrid();

    switch (g_currentGameMode) {
        case GAME_MODE.MOUNTAIN:
            setMountainTile();
            
            break;
        case GAME_MODE.PLAYING:
            g_trackTileRolled = getRandomNumber();
            
            addShadowToRowsAndColumns();

            if (g_lastSelectedTile != "") lockTile();

            $("#roll_number").html(getImageHTML("dice", g_rowAndColumnRolled, "img_dice"));
            $("#roll_track").html(getImageHTML("track", g_trackTileRolled, "img_track"));

            // make track six tracks available:
            if (g_trackTileRolled === 6) {
                $("#track_six_one").addClass("shadow");
                $("#track_six_two").addClass("shadow");

                g_overrideTrackSixSelected = true;
            }
            break;
    }
    
}

function setMountainTile() {
    var tile = '[id=' + ++g_mountainRow + g_rowAndColumnRolled + '].ground.tile';

    addShadowToRow(g_mountainRow);
    placeTile($(tile), TILE_TYPE.MOUNTAIN);
    lockTile(tile);
}

function overrideTrackSelected(trackNumber) {
    if (g_overrideTrackSelected || g_overrideTrackSixSelected) {
        g_trackTileRolled = trackNumber;
        
        // update track image.
        $("#roll_track").html(getImageHTML("track", g_trackTileRolled, "img_track"));
    }
}

function makeAllTracksAvailable() {
    $(".tile.white.track").addClass("shadow");
    
    g_overrideTrackSelected = true;
}

function makeAllUnlockedTilesAvailable() {
    $(".tile.ground").addClass("shadow");

    g_overrideNumberSelected = true;
}

function resetGame() {
    // reset variables
    g_lastSelectedTile = "";
    g_trackTileRolled = "";
    g_stationNumber = 0;
    g_skipPressed = false;
    g_mountainRow = 0;
    g_lockedStation = [];
    g_lockedTiles = [];
    g_currentGameMode = GAME_MODE.SETUP;
    
    // remove all track and mountain images, and shadows from the playfield
    $(".tile.ground").children(".img_track").remove();
    $(".tile.ground").children(".img_mountain").remove();
    $(".tile").removeClass("shadow");
}

function addShadowToRow(number) {
    $('[id^=' + number + '].ground.tile').addClass("shadow"); // row
}

function addShadowToRowsAndColumns() {
    $('[id^=' + g_rowAndColumnRolled + '].ground.tile').addClass("shadow"); // column
    $('[id*=' + g_rowAndColumnRolled + '].ground.tile').addClass("shadow"); // row
}

function clearShadowFromTheGrid() {
    $(".tile").removeClass("shadow");
}

function isInValidRowOrColumn(tile, rowAndColumn) {
    return isInString(getId(tile), rowAndColumn);
}

function lockTile(tile = g_lastSelectedTile) {
    g_lockedTiles.push(tile);
}

function rotateTile(tile) {
    var classOfTile = getClass($(tile).children(".img_track"));
    
    if (isInString(classOfTile, ROTATE270)) {
        // rotate 360 degrees.
        $(tile)
            .children(".img_track")
            .removeClass(ROTATE270);
    } else if (isInString(classOfTile, ROTATE180)) {
        // rotate 270 degrees.
        $(tile)
            .children(".img_track")
            .removeClass(ROTATE180)
            .addClass(ROTATE270);
    } else if (isInString(classOfTile, ROTATE90)) {
        // rotate 180 degrees.
        $(tile)
            .children(".img_track")
            .removeClass(ROTATE90)
            .addClass(ROTATE180);
    } else {
        // rotate 90 degrees.
        $(tile)
            .children(".img_track")
            .addClass(ROTATE90);
    }
}

function placeTile(tile, tileType) {
    var html = "";

    // add track html to ground html
    switch (tileType) {
        case TILE_TYPE.TRACK: // TODO change this so we use objects instead
            html = $(tile).html() + getImageHTML("track", g_trackTileRolled, "img_track");
            break;
        case TILE_TYPE.MOUNTAIN:
            html = $(tile).html() + getRandomImageHTML(MOUNTAIN_IMAGES, "img_mountain");
            break;
        case TILE_TYPE.STATION:
            html = $(tile).html() + getImageHTML("station", "", "img_station");
            break;
    }
    
    // place new tile
    $(tile).html(html);

    // set global variables
    g_lastSelectedTile = tile;
    g_lastTrackTileRolled = g_trackTileRolled;
}

function getImageHTML(filenamePrefix, filenameNumber, className) {
    return '<img class="' + className + '" src="images/' + filenamePrefix + filenameNumber + '.png" width="50" height="50"/>';
}

function getRandomNumber(maxNumber = 6) {
    return Math.floor(Math.random() * maxNumber + 1);
}

function isLocked(tile) {
    return g_lockedTiles.indexOf(getId(tile)) != -1;
}

function getClass(element) {
    return $(element).attr("class");
}

function getId(element) {
    return $(element).attr("id");
}

function isInString(str, subStr) {
    return str.indexOf(subStr) != -1;
}

function populatePlayfieldGrid() {
    const GRID_SIZE = 8;

    var html = "";
    var type = "";

    for (var i = 0; i < GRID_SIZE; i++) { // TODO fix this mess.
        for (var j = 0; j < GRID_SIZE; j++) {
            if ((i == 0 && j == 0) ||
                (i == 0 && j == GRID_SIZE - 1) ||
                (i == GRID_SIZE - 1 && j == 0) ||
                (i == GRID_SIZE - 1 && j == GRID_SIZE - 1)) { // corners.
                type = "corner";
            } else if (i == 0 || i == 7 || j == 0 || j == 7) { // stations.
                type = "station";
            } else { // tracks.
                type = "ground";
            }

            html += '<div id="' + i + j + '" class="tile ' + type + ' img_parent"></div>';
        }
    }

    $("#playfield").html(html);

    addGroundToGrid();
}


function addGroundToGrid() {
    // playfield
    $(".tile.ground").each(function() {
        $(this).html(getRandomImageHTML(GROUND_IMAGES, "img_ground"));
    });

    // stations and corners
    $(".tile.station, .tile.corner").each(function() {
        $(this).html(getRandomImageHTML(MOUNTAIN_IMAGES, "img_ground"));
    });
}

function getRandomImageHTML(images, className) {
    var html = ""
    var imageFile = "";
    var number = 0;

    // randomize images.
    number = Math.floor(Math.random() * images.length + 0); // between 0 and numberOfIterations
    imageFile = images[number];
    html = '<img class="' + className + '" src=\"images/' + imageFile + '"\ width=\"49\" height=\"49\"/>';

    return html;
}

function skipLastMountainTile() {
    g_skipPressed = true;
    g_lockedTiles.pop(); // remove from locked tile list
    
    $(g_lastSelectedTile).children(".img_mountain").remove(); // remove last selected tile

    // blank out tile
    // TODO
}