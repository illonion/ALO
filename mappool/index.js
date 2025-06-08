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
let styleSheet = [...document.styleSheets].find(sheet => !sheet.href || sheet.href.startsWith(location.origin))

const banSectionLeftEl = document.getElementById("ban-section-left")
const banSectionRightEl = document.getElementById("ban-section-right")
const pickSectionLeftEl = document.getElementById("pick-section-left")
const pickSectionRightEl = document.getElementById("pick-section-right")

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
        button.addEventListener("click", mapClickEvent)
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

    styleSheet.insertRule(`.tile { height: ${tileHeight}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.tile-artist { top: ${tileArtist}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.tile-artist-score-added { top: ${tileArtistScoreAdded}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.tile-title { top: ${tileTitle}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.tile-title-score-added { top: ${tileTitleScoreAdded}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.mappool-tile-mod { top: ${tileMod}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.mappool-tile-play-icon { top: ${tilePlayIcon}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.mappool-tile-score { top: ${tileScore}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.mappool-tile-stats-container { top: ${tileStatsContainer}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.mappool-tile-length-bpm { top: ${tileLengthBpm}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.mappool-tile-mapped-by-container { top: ${tileMappedByContainer}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.tiebreaker-tile-length-bpm { top: ${tiebreakerTileLengthBpm}px !important; }`, styleSheet.cssRules.length)
    styleSheet.insertRule(`.tiebreaker-tile-mapped-by-container { top: ${tiebreakerTileMappedByContainer}px !important; }`, styleSheet.cssRules.length)

    // Create tiles
    for (let i = 0; i < currentBanCount * 2; i++) createTile(i % 2 === 0? "left" : "right", "ban", i % 2 === 0? banSectionLeftEl : banSectionRightEl)
}
getBeatmaps()
// Find Beatmaps
const findBeatmaps = beatmapId => allBeatmaps.find(beatmap => Number(beatmap.beatmap_id) === Number(beatmapId))

// Create Tile
function createTile(side, selection, sectionElement) {
    console.log("hello")
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

    if (selection === "pick") {
        const mappoolTileScore = document.createElement("div")
        mappoolTileScore.classList.add("mappool-tile-score")
        mappoolTile.append(mappoolTileScore)
    }

    const tileLengthBpmContainer = document.createElement("div")
    tileLengthBpmContainer.classList.add("tile-length-bpm-container", "mappool-tile-length-bpm")

    const tileStatLength = document.createElement("div")
    tileStatLength.classList.add("tile-length")
    const tileStatLengthNumber = document.createElement("span")
    tileStatLengthNumber.classList.add("tile-stat-number")
    tileStatLength.append("LENGTH ", tileStatLengthNumber)

    const tileStatBpm = document.createElement("div")
    tileStatLength.classList.add("tile-length")
    const tileStatBpmhNumber = document.createElement("span")
    tileStatLengthNumber.classList.add("tile-stat-number")
    tileStatBpm.append("BPM  ", tileStatBpmhNumber)

    const tileStatsContainer = document.createElement("div")
    tileStatsContainer.classList.add("tile-stats-container", "mappool-tile-stats-container")
    const statHeaders = ["CS", "AR", "OD", "SR"]
    for (let i = 0; i < statHeaders.length; i++) {
        const tileStat = document.createElement("div")
        tileStat.classList.add("tile-stat")
        const tileStatNumber = document.createElement("span")
        tileStatNumber.classList.add("tile-stat-number")
        tileStat.append(statHeaders[i], tileStatNumber)
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
function mapClickEvent(event) {
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
    if (action === "ban") {
        // Find ban container
        const currentBanContainer = team === "left" ? banSectionLeftEl : banSectionRightEl
    }
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
let currentTeamNameLeft, currentTeamNameRight

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
}

const socket = createTosuWsSocket()
socket.onmessage = event => {
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

                if (winner) updateStarCount(winner, "plus")
            }
        }
    }
}

// Toggle Stars
const toggleStarsButtonEl = document.getElementById("toggle-stars-button")
let currentToggleStars = true
function toggleStars() {
    currentToggleStars = !currentToggleStars
    if (currentToggleStars) {
        teamStarContainerLeftEl.style.display = "flex"
        teamStarContainerRightEl.style.display = "flex"
        toggleStarsButtonEl.textContent = `Toggle Stars: ON`
    } else {
        teamStarContainerLeftEl.style.display = "none"
        teamStarContainerRightEl.style.display = "none"
        toggleStarsButtonEl.textContent = `Toggle Stars: OFF`
    }
}

// Toggle Animation
const toggleAnimationButtonEl = document.getElementById("toggle-animation-button")
let currentToggleAnimation = true
function toggleAnimation() {
    currentToggleAnimation = !currentToggleAnimation
    if (currentToggleAnimation) {
        toggleAnimationButtonEl.textContent = `Toggle Animation: ON`
    } else {
        toggleAnimationButtonEl.textContent = `Toggle Animation: OFF`
    }
}