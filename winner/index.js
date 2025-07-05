// Get Team
let allTeams
async function getTeams() {
    const response = await axios.get("../_data/teams.json")
    allTeams = response.data
}
getTeams()
// Find Team
const findTeam = team_name => allTeams.find(team => team.team_name === team_name)

const crownImageEl = document.getElementById("crown-image")
const teamNameLeftEl = document.getElementById("team-name-left")
const teamNameRightEl = document.getElementById("team-name-right")
const playerSectionLeftEl = document.getElementById("player-section-left")
const playerSectionRightEl = document.getElementById("player-section-right")
const scorelineEl = document.getElementById("scoreline")
let currentTeamNameLeft, currentTeamNameRight, previousTeamNameLeft, previousTeamNameRight

setInterval(() => {
    // Set team information
    currentTeamNameLeft = getCookie("currentTeamNameLeft")
    currentTeamNameRight = getCookie("currentTeamNameRight")

    if (currentTeamNameLeft !== previousTeamNameLeft) {
        const currentTeam =  findTeam(currentTeamNameLeft)

        setTeamDetails(teamNameLeftEl, currentTeamNameLeft, currentTeam, playerSectionLeftEl)
        previousTeamNameLeft = currentTeamNameLeft
    }
    if (currentTeamNameRight !== previousTeamNameRight) {
        const currentTeam =  findTeam(currentTeamNameRight)

        setTeamDetails(teamNameRightEl, currentTeamNameRight, currentTeam, playerSectionRightEl)
        previousTeamNameRight = currentTeamNameRight
    }
}, 200)

// Set Players from each section
function setTeamDetails(teamNameEl, teamName, teamDetails, playerSectionEl) {
    if (!teamDetails) return
    teamNameEl.textContent = teamName
    let i = 0
    for (i; i < teamDetails.player_ids.length; i++) {
        playerSectionEl.children[i].style.display = "flex"
        playerSectionEl.children[i].children[0].style.backgroundImage = `url("https://a.ppy.sh/${teamDetails.player_ids[i]}")`
        playerSectionEl.children[i].children[1].children[0].textContent = teamDetails.player_names[i]
        playerSectionEl.children[i].children[1].children[1].textContent = `#${teamDetails.player_ranks[i].toLocaleString()}`
    }
    for (i; i < 2; i++) {
        playerSectionEl.children[i].style.display = "none"
    }
}