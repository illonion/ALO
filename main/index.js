const roundNameEl = document.getElementById("round-name")

// Get beatmaps
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

socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    if (currentTeamNameLeft !== data.tourney.team.left) {
        currentTeamNameLeft = data.tourney.team.left
        teamNameLeftEl.textContent = currentTeamNameLeft
    }
    if (currentTeamNameRight !== data.tourney.team.right) {
        currentTeamNameRight = data.tourney.team.right
        teamNameRightEl.textContent = currentTeamNameRight
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
    document.cookie = `currentTeamStarRight=${currentTeamStarRight}; path=/`
    document.cookie = `currentFirstTo=${currentFirstTo}; path=/`
}