// Star Control
let currenTeamStarLeft = 0, currentTeamStarRight = 0, currentBestOf = 0, currentFirstTo = 0, currentBanCount = 0
let allBeatmaps
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
}
getBeatmaps()

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
    for (currentStarCounterLeft; currentStarCounterLeft < currenTeamStarLeft; currentStarCounterLeft++) {
        teamStarContainerLeftEl.append(createStar("fill"))
    }
    for (currentStarCounterLeft; currentStarCounterLeft < currentFirstTo; currentStarCounterLeft++) {
        teamStarContainerLeftEl.append(createStar("empty"))
    }

    // Set right stars
    for (currentStarCounterRight; currentStarCounterRight < currentTeamStarRight; currentStarCounterRight++) {
        teamStarContainerRightEl.append(createStar("fill"))
    }
    for (currentStarCounterRight; currentStarCounterRight < currentFirstTo; currentStarCounterRight++) {
        teamStarContainerRightEl.append(createStar("empty"))
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

// Set team details
function setTeam(team, teamPlayersElement, teamSeedElement, side) {
    console.log(team)
    
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
}