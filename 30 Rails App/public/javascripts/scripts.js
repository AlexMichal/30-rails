var g_trackTileRolled = 0;
var g_rowAndColumnRolled = 0;
var g_lastTrackTileRolled = 0;
var g_lastSelectedTile = "";
var g_stationNumber;
var g_overrideNumberSelected = false;
var g_overrideTrackSelected = false;
var g_overrideTrackSixSelected = false;
var g_tilePlaced = false;
var g_lockedTiles = [];
var g_lockedStation = [];
var g_inputBoxes = [
    "1to2",
    "1to3",
    "1to4",
    "2to3",
    "2to4",
    "3to4"
];

const ROTATE90 = "rotate90";
const ROTATE180 = "rotate180";
const ROTATE270 = "rotate270";
const IMG_ONE = "1.png";
const IMG_TWO = "2.png";
const IMG_THREE = "3.png";
const IMG_FOUR = "4.png";
const IMG_FIVE = "5.png";
const IMG_SIX_ONE = "6a.png";
const IMG_SIX_TWO = "6b.png";
const GROUND_IMAGES = [
  "ground.png",
  "ground2.png",
  "ground3.png"
];

$(document).ready(function() {
    console.log("****************");

    // create playfield.
    populateGrid();

    // playfield tiles:
    $(".tile.ground").on("click", function() {
        console.log("TILE ground");

        // if the tile is NOT locked, a NEW track is selected, and if it's the correct row/column
        if ((!isLocked(this)) && (g_trackTileRolled !== 0) && (isInValidRowOrColumn(this) || g_overrideNumberSelected)) {
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

    // roll dice
    $(".tile.white.roll").on("click", function() {
        rollDice();
    });

    // reset playfield
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
});

function addUpSum() {
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
        $(".totalSum").val(colSum);
    });
}

function rollDice() {
    g_trackTileRolled = getRandomNumber();
    g_rowAndColumnRolled = getRandomNumber();
    g_overrideNumberSelected = false;
    g_overrideTrackSelected = false;
    g_overrideTrackSixSelected = false;

    removeShadowFromGridAndTrackTiles();

    if (g_lastSelectedTile != "") lockPreviousTile();

    $("#die_one").html(g_rowAndColumnRolled);
    $("#die_two").html(getTrackImageHTML(g_trackTileRolled));

    addShadowToRowsAndColumns();

    if (g_trackTileRolled === 6) {
        // make track six tracks available:
        $("#track_six_one").addClass("shadow");
        $("#track_six_two").addClass("shadow");

        g_overrideTrackSixSelected = true;
    }
}

function overrideTrackSelected(trackNumber) {
    if (g_overrideTrackSelected || g_overrideTrackSixSelected) {
        g_trackTileRolled = trackNumber;
        
        // update track image.
        $("#die_two").html(getTrackImageHTML(trackNumber));
    }
    //  else if (g_overrideTrackSixSelected) {


    //     $("#die_two").html(getTrackImageHTML(trackNumber));
    // }
}

function makeAllTracksAvailable() {
    $(".tile.white.track").addClass("shadow");
    
    g_overrideTrackSelected = true;
}

function makeAllUnlockedTilesAvailable() {
    $(".tile.ground").addClass("shadow");

    g_overrideNumberSelected = true;
}

function resetPlayfield() {
    $(".tile.ground").html("");

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
    $(".station").addClass("shadow");
}

function addShadowToRowsAndColumns() {
    $('[id^=' + g_rowAndColumnRolled + '].ground.tile').addClass("shadow");
    $('[id*=' + g_rowAndColumnRolled + '].ground.tile').addClass("shadow");
}

function removeShadowFromRowsAndColumns() {
    $('[id^=' + g_rowAndColumnRolled + '].ground.tile').removeClass("shadow");
    $('[id*=' + g_rowAndColumnRolled + '].ground.tile').removeClass("shadow");
}

function removeShadowFromGridAndTrackTiles() {
    $(".tile.ground").removeClass("shadow");
    $(".tile.track").removeClass("shadow");
}

function isInValidRowOrColumn(tile) {
    return isInString(getId(tile), g_rowAndColumnRolled);
}

function lockPreviousTile() {
    g_lockedTiles.push(g_lastSelectedTile.id);

    $(g_lastSelectedTile).addClass("locked");

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
    var html = "";
    // clear and reset the last tile location.
    removeTrackImageHTML(g_lastSelectedTile);
    removeRotate(g_lastSelectedTile);

    // add track html to ground html
    html = $(tile).html() + getTrackImageHTML(g_trackTileRolled);

    // place new tile.
    $(tile).html(html);

    // set global variables.
    g_lastSelectedTile = tile;
    g_lastTrackTileRolled = g_trackTileRolled;
    g_tiledPlaced = true;

    console.log("g_trackTileRolled: " + g_trackTileRolled);
}

function removeTrackImageHTML(tile) {
    //alert($(tile).parent().html()
    $(tile).html(""); // TODO change this so that the background isn't removed
    //$(tile + " > img:first-child").remove();
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

    return '<img class="img_track" src="images/' + image + '" width="50" height="50"/>';
}

function removeRotate(tile) {
    // remove rotate with pattern matching TODO
}

function getRandomNumber() {
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
                type = "ground";
            }

            html += '<div id="' + i + j + '" class="tile ' + type + ' img_parent"></div>';
        }
    }

    $("#playfield").html(html);

    addGroundToPlayfield();
}

function addGroundToPlayfield() {
    $(".tile.ground").each(function() {
        $(this).html(getARandomGroundImage());
    });
}

function getARandomGroundImage() {
    var html = ""
    var imageFile = "";
    var number = 0;

    // randomize ground images.
    number = Math.floor(Math.random() * 3 + 0); // between 0 and 2
    imageFile = GROUND_IMAGES[number];
    html = '<img class="img_ground" src=\"images/' + imageFile + '"\" width=\"50\" height=\"50\"/>';

    return html;
}