const pointsText = document.querySelector("#pointstext");
const tableitemselem = document.querySelector("#tableitems");
const itemTable = document.querySelectorAll("#tableitems .tableitem img");
const trashBin = document.querySelector("#trashbin");
const recycleBin = document.querySelector("#recyclebin");
const foodBin = document.querySelector("#foodbin");
const pauseMenu = document.querySelector("#pausemenu");
const pauselink = document.querySelector("#menulink");
const upgrademenu = document.querySelector("#upgrademenu");
const maingame = document.querySelector("#maingame");
const gameTimeMinutes = document.querySelector("#gametimeminutes");
const gameTimeSeconds = document.querySelector("#gametimeseconds");
const gameTimeMillis = document.querySelector("#gametimemilliseconds");

const continuelink = document.querySelector("#continuelink");
const upgradefinish = document.querySelector("#upgradefinish");

const furnaceupgradeUpgradeButton = document.querySelector("#furnaceupgrade .upgradebutton");
const conveyorUpgradeButton = document.querySelector("#conveyorupgrade .upgradebutton");
const clawUpgradeButton = document.querySelector("#clawupgrade .upgradebutton");

const failmenu = document.querySelector("#failmenu");

if (!localStorage.getItem("level")) {
    localStorage.setItem("level", 0);
}

if (!localStorage.getItem("points")) {
    localStorage.setItem("points", 0);
} else {
    pointsText.innerText = localStorage.getItem("points");
}

if(!localStorage.getItem("clawlevel")) {
    localStorage.setItem("clawlevel", 0);
}
if(!localStorage.getItem("conveyorlevel")) {
    localStorage.setItem("conveyorlevel", 0);
}
if(!localStorage.getItem("furnacelevel")) {
    localStorage.setItem("furnacelevel", 0);
}

document.querySelector("#levelnum").innerText = localStorage.getItem("level");

let musicelem = document.createElement('audio');
musicelem.volume = parseFloat(localStorage.getItem("volume"));

let menumusic = document.createElement('audio');
menumusic.src = "/assets/images/upgrade.mp3";
menumusic.volume = parseFloat(localStorage.getItem("volume"));


let losemusic = document.createElement('audio');
losemusic.src = "/assets/images/bittersweet.mp3";
losemusic.volume =  parseFloat(localStorage.getItem("volume"));


let correctsoundelem = document.createElement('audio');
correctsoundelem.src = "/assets/images/vgmenuselect.mp3";
let wrongsoundelem = document.createElement('audio');
wrongsoundelem.volume =  parseFloat(localStorage.getItem("volume"));
wrongsoundelem.src = "/assets/images/fail.mp3";


const clawLevel = localStorage.getItem("clawlevel");
const conveyorLevel = localStorage.getItem("conveyorlevel");
const furnaceLevel = localStorage.getItem("furnacelevel");
let paused = false;
let itemTableMap = null;
let clockInterval = null;
let itemInterval = null;
const failPoints = -2000;
let difficultyLevel = localStorage.getItem("level");
let startTime = 0;
let respawnTime = (7000 - difficultyLevel * 250);
if(conveyorLevel > 0) {
    respawnTime = respawnTime + (respawnTime * (conveyorLevel * 0.05));
}


async function onItemDrag(e) {
    let o = {
        id: e.srcElement.getAttribute("id"),
        points: e.srcElement.getAttribute("points"),
        type: e.srcElement.getAttribute("type")
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(o));
}

let pauseTime = 0;
async function onPauseMenu(e) {
    e.preventDefault();
    pauseTime = Date.now();
    paused = true;
    pausemenu.classList.remove('hide');
}
async function onContinue(e) {
    e.preventDefault();
    startTime += Date.now() - pauseTime;
    pauseTime = 0;
    pausemenu.classList.add('hide');
    paused = false;
}


async function itemDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    e.srcElement.classList.remove("binhighlight");

    let j = e.dataTransfer.getData('text/plain');
    let jso = JSON.parse(j);
    if (!jso) return;
    const img = document.querySelector("#" + jso.id);
    let points = jso.points;
    const type = jso.type;
    let newPoints = handlePoints(e, type, points);
    img.src = "";
    

    img.setAttribute("time", Date.now());

    checkLevelFail();
}

function handlePoints(e, type, points) {
    const srcid = e.srcElement.parentElement.getAttribute('id');

    let letterType = type.substring(0, 1);

    if (letterType == "t" && srcid == "trashbin") {
        playGoodSound();
    } else if (letterType == "r" && srcid == "recyclebin") {
        playGoodSound();
    } else if (letterType == 'f' && srcid == "foodbin") {
        playGoodSound();
    } else {
        //make points negative
        points *= -2;
        playBadSound();
    }

    let p1 = localStorage.getItem("points");
    let p = parseInt(p1) + parseInt(points);
    setPoints(p);

    try {
        const name = localStorage.getItem("name");
        console.log(name);
        let j = localStorage.getItem("scores");
        let jo = JSON.parse(j);
        console.log(jo);
        const keys = Object.keys(jo);
        for(let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if(jo[key].score < p) {
                jo[key].name = name;
                jo[key].score = p;
                localStorage.setItem("scores", JSON.stringify(jo));
                break;
            }
        }
        
    } catch(e) {
    }

    return p;
}




async function playGoodSound() {
    correctsoundelem.currentTime = 0;
    correctsoundelem.play();
}

async function playBadSound() {
    wrongsoundelem.currentTime = 0;
    wrongsoundelem.play();
}

async function checkLevelFail() {
    let value = localStorage.getItem("points");
    if (value < failPoints) {
        failedLevel();
    }
}

async function binDragEnter(e) {
    e.preventDefault();
}

async function binDragExit(e) {
    e.preventDefault();
}

async function binDragOver(e) {
    e.preventDefault();
}


function resetGame() {
    localStorage.setItem("level", 0);
    localStorage.setItem("points", 0);
    localStorage.setItem("conveyorlevel", 0);
    localStorage.setItem("furnacelevel", 0);
    localStorage.setItem("clawlevel", 0);
    window.location.replace("./index.html");
}

async function onFurnaceUpgradeClick(e) {
    let points = localStorage.getItem("points");
    if (points >= 500) {
        let lvl = localStorage.getItem("furnacelevel");
        if (!lvl) lvl = 0;

        localStorage.setItem("furnacelevel", parseInt(lvl) + 1);
        document.querySelector("#furnaceupgrade .upgradelvl").innerText
            = localStorage.getItem("furnacelevel");

        setPoints(points - 500);
    }
}
async function onConveyorUpgradeClick(e) {
    let points = localStorage.getItem("points");
    if (points >= 800) {
        let lvl = localStorage.getItem("conveyorlevel");
        if (!lvl) lvl = 0;

        localStorage.setItem("conveyorlevel", parseInt(lvl) + 1);
        document.querySelector("#conveyorupgrade .upgradelvl").innerText
            = localStorage.getItem("conveyorlevel");

        setPoints(points - 800);
    }
}
async function onClawUpgradeClick(e) {
    let points = localStorage.getItem("points");
    if (points >= 1200) {
        let lvl = localStorage.getItem("clawlevel");
        if (!lvl) lvl = 0;

        localStorage.setItem("clawlevel", parseInt(lvl) + 1);
        document.querySelector("#clawupgrade .upgradelvl").innerText
            = localStorage.getItem("clawlevel");

        setPoints(points - 1200);
    }
}
async function onUpgradeFinishClick(e) {
    window.location.replace(window.location);

    upgrademenu.classList.add("hide");
    menumusic.pause();
    menumusic.currentTime = 0;
    let level = localStorage.getItem("level");
    localStorage.setItem("level", parseInt(level) + 1);
    location.reload();
    paused = false;
}


async function main() {

    const response = await fetch("./itemtable.json");
    itemTableMap = await response.json();

    for (const node of itemTable) {
        node.draggable = "true";
        node.addEventListener("dragstart", onItemDrag);
    }

    trashBin.addEventListener("dragover", binDragOver, false);
    recycleBin.addEventListener("dragover", binDragOver, false);
    foodBin.addEventListener("dragover", binDragOver, false);
    trashBin.addEventListener("dragenter", binDragEnter, false);
    recycleBin.addEventListener("dragenter", binDragEnter, false);
    foodBin.addEventListener("dragenter", binDragEnter, false);
    trashBin.addEventListener("dragexit", binDragExit, false);
    recycleBin.addEventListener("dragexit", binDragExit, false);
    foodBin.addEventListener("dragexit", binDragExit, false);

    trashBin.addEventListener("drop", itemDrop);
    recycleBin.addEventListener("drop", itemDrop);
    foodBin.addEventListener("drop", itemDrop);

    pauselink.addEventListener("click", onPauseMenu);
    continuelink.addEventListener("click", onContinue);

    furnaceupgradeUpgradeButton.addEventListener("click", onFurnaceUpgradeClick);
    conveyorUpgradeButton.addEventListener("click", onConveyorUpgradeClick);
    clawUpgradeButton.addEventListener("click", onClawUpgradeClick);
    upgradefinish.addEventListener("click", onUpgradeFinishClick);


    document.querySelector("#furnaceupgrade .upgradelvl").innerText
        = localStorage.getItem("furnacelevel");
    document.querySelector("#conveyorupgrade .upgradelvl").innerText
        = localStorage.getItem("conveyorlevel");
    document.querySelector("#clawupgrade .upgradelvl").innerText
        = localStorage.getItem("clawlevel");

        let gameReset = document.querySelector("#gamereset");
        gameReset.addEventListener("click", (e) => {
            resetGame();
        });

    randombg();
    startTimer();
    startItemTimer();
    //generateItems();

}


function randombg() {
    let n = Math.floor(Math.random() * 3);
    if (n == 0) {
        tableitemselem.classList.add("citybg");
        musicelem.src = "/assets/images/city.mp3";
    } else if (n == 1) {
        tableitemselem.classList.add("desertbg");
        musicelem.src = "/assets/images/desert.mp3";
    } else if (n == 2) {
        tableitemselem.classList.add("oceanbg");
        musicelem.src = "/assets/images/ocean.mp3";
    }

    musicelem.load();
    musicelem.play();

}

async function startItemTimer() {

    itemInterval = setInterval(() => {
        if (paused) {
            musicelem.pause();
            return;
        }
        musicelem.play();
        for (let i = 0; i < itemTable.length; i++) {
            let e = itemTable[i];
            let src = e.getAttribute("src");

            if (src.length < 1) {
                if (!e.hasAttribute("time") || (Date.now() - e.getAttribute("time")) > respawnTime) {

                    
                    let item = getRandomItem();

                    
                    let key = Object.keys(item)[0];
                    let itemValue = item[key];
                    if(key.substring(0,1) == "t") {
                        let n = Math.floor(Math.random() * 100 / furnaceLevel);
                        if(n == 0) {
                            //furnace item
                            let points1 = localStorage.getItem("points");
                            parseInt(points1)+=itemValue.p;
                            setPoints(points1);
                        }
                    }
                    let n = Math.floor(Math.random() * 100 / clawLevel);
                    if(n == 0) {
                        let points1 = localStorage.getItem("points");
                        parseInt(points1)+=itemValue.p;
                        setPoints(points1);
                    }
                    itemTable[i].setAttribute('points', itemValue.p);
                    itemTable[i].setAttribute('type', key);
                    itemTable[i].setAttribute('src', itemValue.src);
                }

            }

        }

    }, 100);
}

function startTimer() {
    //current time plus 3 minutes

    let limit = 1 * 60 * 1000;
    //let limit = 250;
    startTime = Date.now() + limit;
    clockInterval = setInterval(() => {
        if (paused) return;
        let now = new Date(startTime - Date.now());
        let m = now.getMinutes();
        let s = now.getSeconds();
        let mm = now.getMilliseconds();
        setClock(m, s, mm);

        if (startTime < Date.now()) {
            console.log("time passed");
            passedLevel();
        }
    }, 50);
}


async function setPoints(points) {
    localStorage.setItem("points", parseInt(points));
    pointsText.innerText = localStorage.getItem("points");
}

async function setClock(m, s, mm) {
    gameTimeMinutes.innerText = m.toString().padStart(2, '0');
    gameTimeSeconds.innerText = s.toString().padStart(2, '0');
    gameTimeMillis.innerText = mm.toString().substring(0, 1);
}

function passedLevel() {
    paused = true;
    setClock(0, 0, 0);
    resetItems();
    musicelem.pause();
    menumusic.play();
    upgrademenu.classList.remove("hide");
    //pause = false;
}


function resetItems() {
    for (let i = 0; i < itemTable.length; i++) {
        itemTable[i].setAttribute("src", "");
        itemTable[i].setAttribute("points", "0");
        itemTable[i].setAttribute("type", "");
        itemTable[i].setAttribute("time", "0");
    }
}



function failedLevel() {

    paused = true;
    musicelem.pause();
    
    losemusic.play();
    failmenu.classList.remove("hide");
    localStorage.setItem("level", 0);
    localStorage.setItem("points", 0);
    localStorage.setItem("conveyorlevel", 0);
    localStorage.setItem("furnacelevel", 0);
    localStorage.setItem("clawlevel", 0);
    clearInterval(clockInterval);
    clearInterval(itemInterval);
}

function getRandomItem() {


    let n = Math.floor(Math.random() * 101);
    //random chance to select 1 of three categories
    let t = null;
    if (n >= 0 && n < itemTableMap.chance.trash) {
        t = itemTableMap.items.trash;
    } else if (n >= itemTableMap.chance.trash
        && n < (itemTableMap.chance.trash + itemTableMap.chance.recycle)) {
        t = itemTableMap.items.recycle;
    } else if (n >= (itemTableMap.chance.trash + itemTableMap.chance.recycle)) {
        t = itemTableMap.items.food;
    }

    //random item based on number of items in category
    let len = Object.keys(t).length;
    let n1 = Math.floor(Math.random() * len);
    let key = Object.keys(t)[n1];
    let value = t[key];
    let o = new Object();
    o[key] = value;

    return o;
}

function generateItems() {

    const itemTable = document.querySelectorAll("#tableitems .tableitem img");

    for (let i = 0; i < itemTable.length; i++) {
        let item = getRandomItem();
        let key = Object.keys(item)[0];
        let itemValue = item[key];
        itemTable[i].setAttribute('points', itemValue.p);
        itemTable[i].setAttribute('type', key);
        itemTable[i].setAttribute('src', itemValue.src);

    }

}





main();