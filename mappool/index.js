// Star Control
const mappoolManagementButtonContainerEl = document.getElementById("mappool-management-button-container")
let currentTeamStarLeft = 0, currentTeamStarRight = 0, currentBestOf = 0, currentFirstTo = 0, currentBanCount = 0
let allBeatmaps

let tileHeight = 121
let tileArtist = 30
let tileArtistScoreAdded = 12
let tileTitle = 58
let tileTitleScoreAdded = 42
let tileMod = 23
let tilePlayIcon = 52
let tileScore = 74
let tileStatsContainer = 161
let tileLengthBpm = 100
let tiebreakerTileLengthBpm = 15
let tileMappedByContainer = 197
let tiebreakerTileMappedByContainer = 72
let root = document.documentElement

const banSectionLeftEl = document.getElementById("ban-section-left")
const banSectionRightEl = document.getElementById("ban-section-right")
const pickSectionLeftEl = document.getElementById("pick-section-left")
const pickSectionRightEl = document.getElementById("pick-section-right")

// Tiebreaker
const tileTiebreakerEl = document.getElementById("tile-tiebreaker")

async function getBeatmaps() {
    const response = await axios.get("../_data/beatmaps.json")
    allBeatmaps = response.data.beatmaps

    switch (response.data.roundName) {
        case "RO64": case "RO32": case "RO16":
            currentBestOf = 9
            currentBanCount = 1
            break
        case "QF": case "SF":
            currentBestOf = 11
            currentBanCount = 2
            break
        case "F": case "GF":
            currentBestOf = 13
            currentBanCount = 2
            break
    }

    currentFirstTo = Math.ceil(currentBestOf / 2)

    createStarDisplay()

    // Create mappool buttons
    for (let i = 0; i < allBeatmaps.length; i++) {
        const button = document.createElement("div")
        button.classList.add("sidebar-button")
        button.innerText = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
        button.setAttribute("id", allBeatmaps[i].beatmap_id)
        button.addEventListener("mousedown", mapClickEvent)
        button.addEventListener("contextmenu", event => event.preventDefault())
        button.dataset.id = allBeatmaps[i].beatmap_id
        mappoolManagementButtonContainerEl.append(button)
    }

    // Calculate heights and positioning of tiles
    tileHeight = Math.round(1089 / (currentBanCount + currentFirstTo))
    const adjustment = Math.round((tileHeight - 121) / 2)
    tileArtist += adjustment
    tileArtistScoreAdded += adjustment
    tileTitle += adjustment
    tileTitleScoreAdded += adjustment
    tileMod += adjustment
    tilePlayIcon += adjustment
    tileScore += adjustment
    tileLengthBpm = tileHeight * 1.2
    tileStatsContainer = tileHeight * 1.5
    tiebreakerTileLengthBpm += adjustment
    tileMappedByContainer = tileHeight * 1.75
    tiebreakerTileMappedByContainer += adjustment

    root.style.setProperty('--tile-height', `${tileHeight}px`);
    root.style.setProperty('--tile-artist-top', `${tileArtist}px`);
    root.style.setProperty('--tile-artist-score-added-top', `${tileArtistScoreAdded}px`);
    root.style.setProperty('--tile-title-top', `${tileTitle}px`);
    root.style.setProperty('--tile-title-score-added-top', `${tileTitleScoreAdded}px`);
    root.style.setProperty('--tile-mod-top', `${tileMod}px`);
    root.style.setProperty('--tile-play-icon-top', `${tilePlayIcon}px`);
    root.style.setProperty('--tile-score-top', `${tileScore}px`);
    root.style.setProperty('--tile-stats-container-top', `${tileStatsContainer}px`);
    root.style.setProperty('--tile-length-bpm-top', `${tileLengthBpm}px`);
    root.style.setProperty('--tile-mapped-by-container-top', `${tileMappedByContainer}px`);
    root.style.setProperty('--tiebreaker-tile-length-bpm-top', `${tiebreakerTileLengthBpm}px`);
    root.style.setProperty('--tiebreaker-tile-mapped-by-container-top', `${tiebreakerTileMappedByContainer}px`);

    // Create tiles
    for (let i = 0; i < currentBanCount * 2; i++) createTile(i % 2 === 0? "left" : "right", i % 2 === 0? banSectionLeftEl : banSectionRightEl)
    for (let i = 0; i < (currentFirstTo - 1) * 2; i++) {
        createTile(i % 2 === 0? "left": "right", i % 2 === 0? pickSectionLeftEl : pickSectionRightEl)
    }

    // Set Tiebreaker details
    const tbInfo = allBeatmaps[allBeatmaps.length - 1]
    tileTiebreakerEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${tbInfo.beatmapset_id}/covers/cover.jpg")`
    tileTiebreakerEl.children[3].textContent = tbInfo.artist
    tileTiebreakerEl.children[4].textContent = tbInfo.title
    tileTiebreakerEl.children[5].children[0].children[0].textContent = setLengthDisplay(tbInfo.total_length)
    tileTiebreakerEl.children[5].children[1].children[0].textContent = tbInfo.bpm
    tileTiebreakerEl.children[6].children[0].children[0].textContent = Math.round(Number(tbInfo.diff_size) * 10) / 10
    tileTiebreakerEl.children[6].children[1].children[0].textContent = Math.round(Number(tbInfo.diff_approach) * 10) / 10
    tileTiebreakerEl.children[6].children[2].children[0].textContent = Math.round(Number(tbInfo.diff_overall) * 10) / 10
    tileTiebreakerEl.children[6].children[3].children[0].textContent = Math.round(Number(tbInfo.difficultyrating) * 100) / 100
    tileTiebreakerEl.children[7].children[0].children[0].textContent = tbInfo.creator
}
getBeatmaps()
// Find Beatmaps
const findBeatmaps = beatmapId => allBeatmaps.find(beatmap => Number(beatmap.beatmap_id) === Number(beatmapId))

// Create Tile
function createTile(side, sectionElement) {
    const mappoolTile = document.createElement("div")
    mappoolTile.classList.add("tile", "mappool-tile")
    
    const tileOverlay = document.createElement("div")
    tileOverlay.classList.add("tile-overlay", `tile-overlay-${side}`)
    
    const tileArtist = document.createElement("div")
    tileArtist.classList.add("tile-detail", "mappool-tile-detail", "tile-artist")

    const tileTitle = document.createElement("div")
    tileTitle.classList.add("tile-detail", "mappool-tile-detail", "tile-title")

    const mappoolTileMod = document.createElement("img")
    mappoolTileMod.classList.add("mappool-tile-mod")
    mappoolTileMod.setAttribute("src", "")

    const mappoolTilePlayIcon = document.createElement("img")
    mappoolTilePlayIcon.classList.add("mappool-tile-play-icon")
    mappoolTilePlayIcon.setAttribute("src", "static/icons/play.png")

    mappoolTile.append(tileOverlay, tileArtist, tileTitle, mappoolTileMod, mappoolTilePlayIcon)

    const mappoolTileScore = document.createElement("div")
    mappoolTileScore.classList.add("mappool-tile-score")
    mappoolTile.append(mappoolTileScore)

    const tileLengthBpmContainer = document.createElement("div")
    tileLengthBpmContainer.classList.add("tile-length-bpm-container", "mappool-tile-length-bpm")

    const tileStatLength = document.createElement("div")
    tileStatLength.classList.add("tile-stat")
    const tileStatLengthNumber = document.createElement("span")
    tileStatLengthNumber.classList.add("tile-stat-number")
    tileStatLength.append("LENGTH ", tileStatLengthNumber)

    const tileStatBpm = document.createElement("div")
    tileStatBpm.classList.add("tile-stat")
    const tileStatBpmNumber = document.createElement("span")
    tileStatBpmNumber.classList.add("tile-stat-number")
    tileStatBpm.append("BPM ", tileStatBpmNumber)
    
    tileLengthBpmContainer.append(tileStatLength, tileStatBpm)

    const tileStatsContainer = document.createElement("div")
    tileStatsContainer.classList.add("tile-stats-container", "mappool-tile-stats-container")
    const statHeaders = ["CS", "AR", "OD", "SR"]
    for (let i = 0; i < statHeaders.length; i++) {
        const tileStat = document.createElement("div")
        tileStat.classList.add("tile-stat")
        const tileStatNumber = document.createElement("span")
        tileStatNumber.classList.add("tile-stat-number")
        tileStat.append(statHeaders[i], tileStatNumber)
        tileStatsContainer.append(tileStat)
    }

    const tileMappedByContainer = document.createElement("div")
    tileMappedByContainer.classList.add("tile-mapped-by-container", "mappool-tile-mapped-by-container")
    const mappoolTileMappedBy = document.createElement("div")
    mappoolTileMappedBy.classList.add("mappool-tile-mapped-by")
    const mappoolTileMapper = document.createElement("span")
    mappoolTileMapper.classList.add("mappool-tile-mapper")
    mappoolTileMappedBy.append("MAPPED BY ", mappoolTileMapper)
    tileMappedByContainer.append(mappoolTileMappedBy)

    mappoolTile.append(tileLengthBpmContainer, tileStatsContainer, tileMappedByContainer)
    sectionElement.append(mappoolTile)
}

// Create Star Display
const teamStarContainerLeftEl = document.getElementById("team-star-container-left")
const teamStarContainerRightEl = document.getElementById("team-star-container-right")
function createStarDisplay() {
    // Reset elements
    teamStarContainerLeftEl.innerHTML = ""
    teamStarContainerRightEl.innerHTML = ""

    // Create counters
    let currentStarCounterLeft = 0
    let currentStarCounterRight = 0

    // Set left stars
    for (currentStarCounterLeft; currentStarCounterLeft < currentFirstTo; currentStarCounterLeft++) {
        teamStarContainerLeftEl.append(createStar(currentStarCounterLeft < currentTeamStarLeft ? "fill" : "empty"))
    }

    // Set right stars
    for (currentStarCounterRight; currentStarCounterRight < currentFirstTo; currentStarCounterRight++) {
        teamStarContainerRightEl.append(createStar(currentStarCounterRight < currentTeamStarRight ? "fill" : "empty"))
    }

    // Create Star
    function createStar(status) {
        const teamStarWrapper = document.createElement("div")
        teamStarWrapper.classList.add("team-star-wrapper")

        const teamStar = document.createElement("img")
        teamStar.classList.add("team-star")
        teamStar.setAttribute("src", `static/point-${status}.png`)

        teamStarWrapper.append(teamStar)
        return teamStarWrapper
    }
}

// Update star count
function updateStarCount(side, action) {
    if (!currentToggleStars) return

    // Set stars
    if (side === "left" && action === "plus") currentTeamStarLeft++
    else if (side === "right" && action === "plus") currentTeamStarRight++
    else if (side === "left" && action === "minus") currentTeamStarLeft--
    else if (side === "right" && action === "minus") currentTeamStarRight--

    // Check stars
    if (currentTeamStarLeft > currentFirstTo) currentTeamStarLeft = currentFirstTo
    if (currentTeamStarLeft < 0) currentTeamStarLeft = 0
    if (currentTeamStarRight > currentFirstTo) currentTeamStarRight = currentFirstTo
    if (currentTeamStarRight < 0) currentTeamStarRight = 0

    // Create star display
    createStarDisplay()
}

// Map Click Event
let currentPickedTile
async function mapClickEvent(event) {
    // Figure out whether it is a pick or ban
    const currentMapId = this.dataset.id
    const currentMap = findBeatmaps(currentMapId)
    if (!currentMap) return

    // Team
    let team
    if (event.button === 0) team = "left"
    else if (event.button === 2) team = "right"
    if (!team) return

    // Action
    let action = "pick"
    if (event.ctrlKey) action = "ban"

    // Check if map exists in bans
    const mapCheck = !!(
        banSectionLeftEl.querySelector(`[data-id="${currentMapId}"]`) ||
        banSectionRightEl.querySelector(`[data-id="${currentMapId}"]`) ||
        pickSectionLeftEl.querySelector(`[data-id="${currentMapId}"]`) ||
        pickSectionRightEl.querySelector(`[data-id="${currentMapId}"]`)
    )
    if (mapCheck) return

    // Bans
    let currentElement
    if (action === "ban") {
        // Find ban container
        const currentBanContainer = team === "left" ? banSectionLeftEl : banSectionRightEl
        for (let i = 0; i < currentBanContainer.childElementCount; i++) {
            if (currentBanContainer.children[i].dataset.id) continue
            currentElement = currentBanContainer.children[i]
            break
        }

        if (!currentElement) return
    }

    // Picks
    if (action === "pick") {
        const currentPickContainer = team === "left" ? pickSectionLeftEl : pickSectionRightEl
        for (let i = 0; i < currentPickContainer.childElementCount; i++) {
            if (currentPickContainer.children[i].dataset.id) continue
            currentElement = currentPickContainer.children[i]
            break
        }

        if (!currentElement) return
        currentPickedTile = currentElement
    }

    // Set Details
    currentElement.dataset.id = currentMapId
    currentElement.style.opacity = 1
    currentElement.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
    currentElement.children[1].textContent = currentMap.artist
    currentElement.children[2].textContent = currentMap.title
    currentElement.children[3].setAttribute("src", `static/mod-icons/${currentMap.mod}${currentMap.order}.png`)
    currentElement.children[6].children[0].children[0].textContent = setLengthDisplay(currentMap.total_length)
    currentElement.children[6].children[1].children[0].textContent = currentMap.bpm
    currentElement.children[7].children[0].children[0].textContent = Math.round(Number(currentMap.diff_size) * 10) / 10
    currentElement.children[7].children[1].children[0].textContent = Math.round(Number(currentMap.diff_approach) * 10) / 10
    currentElement.children[7].children[2].children[0].textContent = Math.round(Number(currentMap.diff_overall) * 10) / 10
    currentElement.children[7].children[3].children[0].textContent = Math.round(Number(currentMap.difficultyrating) * 100) / 100
    currentElement.children[8].children[0].children[0].textContent = currentMap.creator

    // Play Animation
    if (currentToggleAnimation) {
        currentElement.style.height = `${tileHeight * 2 + 8}px`
        await delay(5000)
        currentElement.style.height = `${tileHeight}px`
    }
}

// Set Length Display
function setLengthDisplay(seconds) {
    const minuteCount = Math.floor(seconds / 60)
    const secondCount = seconds % 60

    return `${minuteCount.toString().padStart(2, "0")}:${secondCount.toString().padStart(2, "0")}`
}

// Get Team
let allTeams
async function getTeams() {
    const response = await axios.get("../_data/teams.json")
    allTeams = response.data
}
getTeams()
// Find Team
const findTeam = team_name => allTeams.find(team => team.team_name === team_name)

// Team Information
const teamNameLeftEl = document.getElementById("team-name-left")
const teamNameRightEl = document.getElementById("team-name-right")
const teamPlayersLeftEl = document.getElementById("team-players-left")
const teamPlayersRightEl = document.getElementById("team-players-right")
const teamSeedLeftEl = document.getElementById("team-seed-left")
const teamSeedRightEl = document.getElementById("team-seed-right")
let currentTeamNameLeft, currentTeamNameRight, currentLeftTeamPlayers, currentRightTeamPlayers

// osu! chat length
const osuChatDisplayContainerEl = document.getElementById("osu-chat-display-container")
let chatLength

// IPC State
let ipcState
let checkedWinner = false

// Beatmap information
let mapId, mapMd5

// Set team details
function setTeam(team, teamPlayersElement, teamSeedElement, side) {
    
    // Set Players Element
    for (let i = 0; i < teamPlayersElement.childElementCount; i++) {
        teamPlayersElement.children[i].children[0].setAttribute("src", `https://a.ppy.sh/${team.player_ids[i]}`)
        teamPlayersElement.children[i].children[1].children[0].textContent = team.player_names[i]
        teamPlayersElement.children[i].children[1].children[1].textContent = `#${team.player_ranks[i].toLocaleString()}`
    }

    // Set Seed Element
    teamSeedElement.textContent = `#${team.seed.toString().padStart(2, "0")}`

    // Set Mod Ranks
    const modElements = document.getElementsByClassName(`team-mod-number-${side}`)
    for (let i = 0; i < team.mod_ranks.length; i++) {
        modElements[i].textContent = `#${team.mod_ranks[i]}`
    }

    // Set team players
    if (side === "left") currentLeftTeamPlayers = team.player_ids
    else currentRightTeamPlayers = team.player_ids
}

const socket = createTosuWsSocket()
socket.onmessage = async event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Set Team Data
    if (currentTeamNameLeft !== data.tourney.team.left && allTeams) {
        currentTeamNameLeft = data.tourney.team.left
        teamNameLeftEl.textContent = currentTeamNameLeft

        const foundTeam = findTeam(currentTeamNameLeft)
        if (foundTeam) setTeam(foundTeam, teamPlayersLeftEl, teamSeedLeftEl, "left") 
    }
    if (currentTeamNameRight !== data.tourney.team.right && allTeams) {
        currentTeamNameRight = data.tourney.team.right
        teamNameRightEl.textContent = currentTeamNameRight

        const foundTeam = findTeam(currentTeamNameRight)
        if (foundTeam) setTeam(foundTeam, teamPlayersRightEl, teamSeedRightEl, "right") 
    }

    // This is mostly taken from Victim Crasher: https://github.com/VictimCrasher/static/tree/master/WaveTournament
    if (chatLength !== data.tourney.chat.length) {
        (chatLength === 0 || chatLength > data.tourney.chat.length) ? (osuChatDisplayContainerEl.innerHTML = "", chatLen = 0) : null
        const fragment = document.createDocumentFragment()

        for (let i = chatLength; i < data.tourney.chat.length; i++) {
            const chatColour = data.tourney.chat[i].team

            // Chat message container
            const chatDisplayWrapper = document.createElement("div")
            chatDisplayWrapper.classList.add("chat-display-wrapper")

            // Chat Display Name
            const chatDisplayName = document.createElement("div")
            chatDisplayName.classList.add("chat-display-name")

            // Chat Display Name text
            const chatDisplayNameText = document.createElement("span")
            chatDisplayNameText.classList.add("chat-display-name-text", chatColour)
            chatDisplayNameText.innerText = data.tourney.chat[i].name

            // Chat Display Name Colon
            const chatDisplayNameColon = document.createElement("span")
            chatDisplayNameColon.innerText = ":"

            // Chat Display Message
            const chatDisplayMessage = document.createElement("div")
            chatDisplayMessage.classList.add("chat-display-message")
            chatDisplayMessage.innerText = data.tourney.chat[i].message

            chatDisplayName.append(chatDisplayNameText, chatDisplayNameColon)
            chatDisplayWrapper.append(chatDisplayName, chatDisplayMessage)
            fragment.append(chatDisplayWrapper)
        }

        osuChatDisplayContainerEl.append(fragment)
        chatLength = data.tourney.chat.length
        osuChatDisplayContainerEl.scrollTop = osuChatDisplayContainerEl.scrollHeight
    }

    // Beatmap information
    if (mapId !== data.beatmap.id && mapMd5 !== data.beatmap.checksum) {
        mapId = data.beatmap.id
        mapMd5 = data.beatmap.checksum

        // Find element
        const element = document.getElementById(mapId)

        // Click event
        if (currentToggleAutopick && element && (!element.hasAttribute("data-is-autopicked") || element.getAttribute("data-is-autopicked") !== "true")) {
            // Check if autopicked already
            const event = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window,
                button: (currentNextPicker === "left")? 0 : 2
            })
            element.dispatchEvent(event)
            element.setAttribute("data-is-autopicked", "true")

            if (currentNextPicker === "left") setNextPicker("right")
            else if (currentNextPicker === "right") setNextPicker("left")
        }
    }

    // IPC State
    if (ipcState !== data.tourney.ipcState) {
        ipcState = data.tourney.ipcState

        if (ipcState === 4 && !checkedWinner) {
            checkedWinner = true

            // See if we can find the beatmap
            const beatmap = findBeatmaps(mapId)
            if (beatmap && currentToggleStars) {
                // See if we can find a winner
                let winner = ""
                if (beatmap.mod === "RX" && data.tourney.clients[0].play.accuracy > data.tourney.clients[1].play.accuracy) {
                    winner = "left"
                } else if (beatmap.mod === "RX" && data.tourney.clients[0].play.accuracy < data.tourney.clients[1].play.accuracy) {
                    winner = "right"
                } else if (data.tourney.clients[0].play.score > data.tourney.clients[1].play.score) {
                    winner = "left"
                } else if (data.tourney.clients[0].play.score < data.tourney.clients[1].play.score) {
                    winner = "right"
                }

                // Set winner
                if (winner) updateStarCount(winner, "plus")

                await delay(5000)

                // Get match and append history
                getAndAppendMatchHistory()
            }
        }
    }

    // Check for play icon
    // Remove it from all icons first
    const allTiles = document.querySelectorAll(
        '#ban-section-left [data-id], #ban-section-right [data-id], #pick-section-left [data-id], #pick-section-right [data-id]'
    )
    allTiles.forEach(tile => {
        if (Number(tile.dataset.id) !== Number(mapId)) {
            tile.children[4].style.display = "none"
        } else {
            tile.children[4].style.display = "block"
        }
    })

    // Show tiebreaker
}

// Toggle Stars
const toggleStarsButtonEl = document.getElementById("toggle-stars-button")
let currentToggleStars = true
function toggleStars() {
    currentToggleStars = !currentToggleStars
    if (currentToggleStars) {
        teamStarContainerLeftEl.style.display = "flex"
        teamStarContainerRightEl.style.display = "flex"
    } else {
        teamStarContainerLeftEl.style.display = "none"
        teamStarContainerRightEl.style.display = "none"
    }
    toggleStarsButtonEl.textContent = `Toggle Stars: ${currentToggleStars ? "ON" : "OFF"}`
}

// Toggle Animation
const toggleAnimationButtonEl = document.getElementById("toggle-animation-button")
let currentToggleAnimation = true
function toggleAnimation() {
    currentToggleAnimation = !currentToggleAnimation
    toggleAnimationButtonEl.textContent = `Toggle Animation: ${currentToggleAnimation ? "ON" : "OFF"}`
}

// Set Next Picker
const nextPickerEl = document.getElementById("next-picker")
let currentNextPicker
function setNextPicker(side) {
    currentNextPicker = side
    nextPickerEl.textContent = `${side.substring(0, 1).toUpperCase()}${side.substring(1).toLowerCase()}`
}

// Toggle Autopick
const toggleAutopickButtonEl = document.getElementById("toggle-autopick-button")
let currentToggleAutopick = false
function toggleAutopick() {
    currentToggleAutopick = !currentToggleAutopick
    toggleAutopickButtonEl.textContent = `Toggle Autopick: ${currentToggleAutopick ? "ON" : "OFF"}`
}

// Get osu! API
let osuApi
async function getOsuApi() {
    const response = await axios.get("../_data/osu-api.json")
    osuApi = response.data.api
}
getOsuApi()

// Get Matches
const matchIdEl = document.getElementById("match-id")
let currentMPLink
function mpLinkGetResults() {
    currentMPLink = parseInt(matchIdEl.value)
    getAndAppendMatchHistory()
}

// Get and append match history
async function getAndAppendMatchHistory() {
    const response = await axios.get(`https://osu.ppy.sh/api/get_match?k=${osuApi}&mp=${currentMPLink}`)
    const data = response.data

    // Reset all maps
    for (let i = 0; i < pickSectionLeftEl.childElementCount; i++) {
        pickSectionLeftEl.children[i].children[1].classList.remove("tile-artist-score-added")
        pickSectionLeftEl.children[i].children[2].classList.remove("tile-title-score-added")
        pickSectionLeftEl.children[i].children[5].innerHTML = ""
        pickSectionRightEl.children[i].children[1].classList.remove("tile-artist-score-added")
        pickSectionRightEl.children[i].children[2].classList.remove("tile-title-score-added")
        pickSectionRightEl.children[i].children[5].innerHTML = ""
    }

    // Start adding maps
    for (let i = 0; i < data.games.length; i++) {
        const currentGame = data.games[i]
        const currentMap = findBeatmaps(currentGame.beatmap_id)
        console.log(currentGame)

        if (currentMap && currentMap.mod !== "TB") {
            // Set scores
            let leftTeamScore = 0
            let leftPlayerFound = false
            let rightTeamScore = 0
            let rightPlayerFound = false
            
            for (let j = 0; j < currentGame.scores.length; j++) {
                if (currentMap.mod === "RX") {
                    // Relax / Acc scoring method
                    let totalNotes = Number(currentGame.scores[j].countmiss) + Number(currentGame.scores[j].count50) + 
                    Number(currentGame.scores[j].count100) + Number(currentGame.scores[j].count300) +
                    Number(currentGame.scores[j].countgeki) + Number(currentGame.scores[j].countkatu)

                    let accuracy = (Number(currentGame.scores[j].countmiss) * 0 + Number(currentGame.scores[j].count50) * 1 / 6 +
                                    Number(currentGame.scores[j].count100) * 1 / 3 + Number(currentGame.scores[j].count300) +
                                    Number(currentGame.scores[j].countgeki) + Number(currentGame.scores[j].countkatu) * 1 / 3) / totalNotes

                    if (totalNotes === 0) accuracy = 0

                    if (currentLeftTeamPlayers.includes(Number(currentGame.scores[j].user_id)) && !leftPlayerFound) {
                        leftTeamScore += accuracy * 100
                        leftPlayerFound = true
                    } else if (currentRightTeamPlayers.includes(Number(currentGame.scores[j].user_id)) && !rightPlayerFound) {
                        rightTeamScore += accuracy * 100
                        rightPlayerFound = true
                    }
                } else {
                    // Normal scoring method
                    if (currentLeftTeamPlayers.includes(Number(currentGame.scores[j].user_id)) && !leftPlayerFound) {
                        leftTeamScore += Number(currentGame.scores[j].score)
                        leftPlayerFound = true
                    } else if (currentRightTeamPlayers.includes(Number(currentGame.scores[j].user_id)) && !rightPlayerFound) {
                        rightTeamScore += Number(currentGame.scores[j].score)
                        rightPlayerFound = true
                    }
                }
            }

            // Find tile to display score
            const targetElement = document.querySelector(
                `#pick-section-left [data-id="${currentGame.beatmap_id}"], #pick-section-right [data-id="${currentGame.beatmap_id}"]`
            );

            // Find if it exists
            if (targetElement) {
                // Reset what was there before
                targetElement.children[5].innerHTML = ""

                // Left Score
                const leftScoreElement = document.createElement("span")
                leftScoreElement.textContent = `${leftTeamScore}${currentMap.mod === "RX" ? "%" : ""}`

                // Right Score
                const rightScoreElement = document.createElement("span")
                rightScoreElement.textContent = `${rightTeamScore}${currentMap.mod === "RX" ? "%" : ""}`

                // Check which map won
                if (leftTeamScore > rightTeamScore) {
                    leftScoreElement.classList.add("mappool-tile-win-score", "mappool-tile-win-score-left")
                } else if (rightTeamScore > leftTeamScore) {
                    rightScoreElement.classList.add("mappool-tile-win-score", "mappool-tile-win-score-right")
                }

                targetElement.children[1].classList.add("tile-artist-score-added")
                targetElement.children[2].classList.add("tile-title-score-added")
                targetElement.children[5].append(leftScoreElement, " - ", rightScoreElement)
                targetElement.children[5].style.display = "block"
            }
        }
    }
}