var g_trackTileRolled = 0;
var g_rowAndColumnRolled = 0;
var g_lastTrackTileRolled = 0;
var g_lastSelectedTile = "";
var g_stationNumber;
var g_lockedTiles = [];
var g_lockedStation = [];
// var g_availableTiles = [];

const ROTATE90 = "rotate90";
const ROTATE180 = "rotate180";
const ROTATE270 = "rotate270";
const IMG_ONE = "https://i.imgur.com/a3AvSnV.png";
const IMG_TWO = "https://i.imgur.com/TKWHoGj.png";
const IMG_THREE = "https://i.imgur.com/G5jK8jC.png";
const IMG_FOUR = "https://i.imgur.com/S8HmoXn.png";
const IMG_FIVE = "https://i.imgur.com/OYwZfqr.png";
const IMG_SIX_ONE = "https://i.imgur.com/oU5u4Ms.png";
const IMG_SIX_TWO = "https://i.imgur.com/hJKwRQ8.png";

$(document).ready(function() {
    console.log("****************");

    // create playfield.
    populateGrid();

    // playfield tiles:
    $(".tile.grey").on("click", function() {
        console.log("TILE GREY");

        // if the tile is NOT locked, a NEW track is selected, and if it's the correct row/column
        if ((!isLocked(this)) && (g_trackTileRolled !== 0) && (isInValidRowOrColumn(this))) {
            if (g_lastSelectedTile == this &&
                g_lastTrackTileRolled == g_trackTileRolled) {
                // rotate.
                rotateTile(this);
            } else {
                // place tile.
                placeTile(this);
            }
        }
    });

    // roll dice:
    $(".tile.white.roll").on("click", function() {
        removeShadowToRowsAndColumns();

        g_trackTileRolled = rollD6(); console.log(g_trackTileRolled);
        g_rowAndColumnRolled = rollD6(); console.log(g_rowAndColumnRolled);

        if (g_lastSelectedTile != "") lockPreviousTile();

        $("#die_one").html(g_rowAndColumnRolled);
        $("#die_two").html(getTrackImageHTML(g_trackTileRolled));

        addShadowToRowsAndColumns();
    });

    // reset playfield:
    $(".tile.white.reset").on("click", function() {
        resetPlayfield();
    });


    // stations:
    // top
    $("[id^='0'].tile.station").on("click", function() {
        if (!g_lockedStation.includes("top")) {
            g_lockedStation.push("top");

            $(this).html(++g_stationNumber);

            $("[id^='0'].tile.station").removeClass("shadow");
        }
    });

    // left
    $("[id$='0'].tile.station").on("click", function() {
        if (!g_lockedStation.includes("left")) {
            g_lockedStation.push("left");

            $(this).html(++g_stationNumber);

            $("[id$='0'].tile.station").removeClass("shadow");
        }

    });

    // bottom
    $("[id^='7'].tile.station").on("click", function() {
        if (!g_lockedStation.includes("bottom")) {
            g_lockedStation.push("bottom");

            $(this).html(++g_stationNumber);

            $("[id^='7'].tile.station").removeClass("shadow");
        }

    });

    // right
    $("[id$='7'].tile.station").on("click", function() {
        if (!g_lockedStation.includes("right")) {
            g_lockedStation.push("right");

            $(this).html(++g_stationNumber);

            $("[id$='7'].tile.station").removeClass("shadow");
        }
    });
});

function stationIsEmpty() {

}

function resetPlayfield() {
    $(".tile.grey").html("");

    // reset variables.
    g_lockedTiles = [];
    g_lastSelectedTile = "";
    g_trackTileRolled = "";
    g_stationNumber = 0;
    g_lockedStation = [];

    $(".tile.station").html("");
    $(".tile").removeClass("shadow");

    // start game.
    setStations();
}

function setStations() {
    // remove shadow from playfield

    // set shadow to all rows/col one at a time
    // $("[id$='0'].station").addClass("shadow");
    $(".station").addClass("shadow");

    // disable everything else until all 4 stations have been set

    // grey out all other tiles TODO

}

function addShadowToRowsAndColumns() {
    $('[id^=' + g_rowAndColumnRolled + '].grey.tile').addClass("shadow");
    $('[id*=' + g_rowAndColumnRolled + '].grey.tile').addClass("shadow");
}

function removeShadowToRowsAndColumns() {
    $('[id^=' + g_rowAndColumnRolled + '].grey.tile').removeClass("shadow");
    $('[id*=' + g_rowAndColumnRolled + '].grey.tile').removeClass("shadow");
}

function isInValidRowOrColumn(tile) {
    return isInString(getId(tile), g_rowAndColumnRolled);
}

function lockPreviousTile() {
    g_lockedTiles.push(g_lastSelectedTile.id);

    // reset tile variables.
    g_lastSelectedTile = "";
    g_lastTrackTileRolled = "";
}

function rotateTile(tile) {
    var currentTile = getClass(tile);

    if (isInString(currentTile, ROTATE270)) {
        // rotate 360 degrees.
        $(tile).removeClass(ROTATE270);
    } else if (isInString(currentTile, ROTATE180)) {
        // rotate 270 degrees.
        $(tile)
            .removeClass(ROTATE180)
            .addClass(ROTATE270);
    } else if (isInString(currentTile, ROTATE90)) {
        // rotate 180 degrees.
        $(tile)
            .removeClass(ROTATE90)
            .addClass(ROTATE180);
    } else {
        // rotate 90 degrees.
        $(tile).addClass(ROTATE90);
    }
}

function placeTile(tile) {
    // clear and reset the last tile location.
    $(g_lastSelectedTile).html("");
    removeRotate(g_lastSelectedTile);

    // place new tile.
    $(tile).html(getTrackImageHTML(g_trackTileRolled));

    // set global variables.
    g_lastSelectedTile = tile;
    g_lastTrackTileRolled = g_trackTileRolled;

    console.log("g_trackTileRolled: " + g_trackTileRolled);
}

function getTrackImageHTML(numberOfTrackTile) {
    var image = "";

    switch (numberOfTrackTile) {
        case 1:
            image = IMG_ONE;
            break;
        case 2:
            image = IMG_TWO;
            break;
        case 3:
            image = IMG_THREE;
            break;
        case 4:
            image = IMG_FOUR;
            break;
        case 5:
            image = IMG_FIVE;
            break;
        case 6:
            image = IMG_SIX_ONE;
            break;
        case 7:
            image = IMG_SIX_TWO;
            break;
        default:
            image = "";
    }

    return '<img src="' + image + '" width="50" height="50"/>';
}

function removeRotate(tile) {
    // remove rotate with pattern matching TODO
}

function rollD6() {
    return Math.floor(Math.random() * 6 + 1);
}

function isLocked(tile) {
    return g_lockedTiles.indexOf(getId(tile)) != -1;
}

function getClass(value) {
    return $(value).attr("class");
}

function getId(value) {
    return $(value).attr("id");
}

function isInString(str, subStr) {
    return str.indexOf(subStr) != -1;
}

function populateGrid() {
    const GRID_SIZE = 8;

    var html = "";
    var type = "";

    for (var i = 0; i < GRID_SIZE; i++) {
        for (var j = 0; j < GRID_SIZE; j++) {
            if ((i == 0 && j == 0) ||
                (i == 0 && j == GRID_SIZE - 1) ||
                (i == GRID_SIZE - 1 && j == 0) ||
                (i == GRID_SIZE - 1 && j == GRID_SIZE - 1)) { // corners.
                type = "black";
            } else if (i == 0 || i == 7 || j == 0 || j == 7) { // stations.
                type = "station";
            } else { // tracks.
                type = "grey";
            }

            html += '<div id="' + i + j + '" class="tile ' + type + '"></div>';
        }
    }

    $("#playfield").html(html);
}