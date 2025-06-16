// Get Team
let allTeams, leftTeam, rightTeam
async function getTeams() {
    const response = await axios.get("../_data/teams.json")
    allTeams = response.data
}
getTeams()
// Find Team
const findTeam = team_name => allTeams.find(team => team.team_name === team_name)
const findPlayerRankIndex = (player_id, team) => team.player_ids.findIndex(player_id)

// Get beatmaps
const roundNameEl = document.getElementById("round-name")
let allBeatmaps
async function getBeatmaps() {
    const response = await axios.get("../_data/beatmaps.json")
    allBeatmaps = response.data.beatmaps
    roundNameEl.setAttribute("src", `static/rounds/${response.data.roundName}.png`)
}
getBeatmaps()

// Socket
const socket = createTosuWsSocket()

// Team Names
const teamNameLeftEl = document.getElementById("team-name-left")
const teamNameRightEl = document.getElementById("team-name-right")
let currentTeamNameLeft, currentTeamNameRight

// Client information
const leftPlayerInformationEl = document.getElementById("gameplay-section-left-player-information")
const rightPlayerInformationEl = document.getElementById("gameplay-section-right-player-information")
let leftPlayerId, rightPlayerId

socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Team Names
    if (currentTeamNameLeft !== data.tourney.team.left && allTeams) {
        currentTeamNameLeft = data.tourney.team.left
        teamNameLeftEl.textContent = currentTeamNameLeft
        leftTeam = findTeam(currentTeamNameLeft)
    }
    if (currentTeamNameRight !== data.tourney.team.right && allTeams) {
        currentTeamNameRight = data.tourney.team.right
        teamNameRightEl.textContent = currentTeamNameRight
        rightTeam = findTeam(currentTeamNameRight)
    }

    // Client Information
    // Client 0
    if (leftPlayerId !== data.tourney.clients[0].user.id && allTeams) {
        leftPlayerId = data.tourney.clients[0].user.id
        setPlayerInformation(leftPlayerId, leftTeam, leftPlayerInformationEl, data.tourney.clients[0])
    }
    // Client 1
    if (rightPlayerId !== data.tourney.clients[1].user.id && allTeams) {
        rightPlayerId = data.tourney.clients[1].user.id
        setPlayerInformation(rightPlayerId, rightTeam, rightPlayerInformationEl, data.tourney.clients[1])
    }
}

// Set Player Information
function setPlayerInformation(playerId, playerTeam, playerElement, clientData) {
    playerElement.children[0].setAttribute("src", `https://a.ppy.sh/${playerId}`)
    playerElement.children[1].children[0].textContent = clientData.user.name

    if (playerTeam) {
        // Set player rank index
        const playerRankIndex = findPlayerRankIndex(playerId, playerTeam)
        if (playerRankIndex) {
            playerElement.children[1].children[1].textContent = `#${playerTeam.player_ranks[playerRankIndex]}`
        } else {
            playerElement.children[1].children[1].textContent = `#${clientData.user.globalRank}`
        }
        // Set Seed
        playerElement.children[1].children[2].style.display = "block"
        playerElement.children[1].children[2].textContent = `SEED ${playerTeam.seed}`
    } else {
        playerElement.children[1].children[1].textContent = `#${clientData.user.globalRank}`
        playerElement.children[1].children[2].style.display = "none"
    }

    if (!leftPlayerId) {
        playerElement.style.display = "none"
    } else {
        playerElement.style.display = "flex"
    }
}

// Stars
let currentTeamStarLeft = 0, currentTeamStarRight = 0, currentFirstTo = 0, currentToggleStars
setInterval(() => {
    currentTeamStarLeft = Number(getCookie("currentTeamStarLeft"))
    currentTeamStarRight = Number(getCookie("currentTeamStarRight"))
    currentFirstTo = Number(getCookie("currentFirstTo"))
    currentToggleStars = getCookie("currentToggleStars")

    createStarDisplay()
}, 200)

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
        teamStar.setAttribute("src", `../_shared/assets/points/point-${status}.png`)

        teamStarWrapper.append(teamStar)
        return teamStarWrapper
    }

    // Set cookies
    document.cookie = `currentTeamStarLeft=${currentTeamStarLeft}; path=/`
    document.cookie = `currentTeamStarRight=${currentTeamStarRight};    path=/`
    document.cookie = `currentFirstTo=${currentFirstTo}; path=/`
}