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
// Find beatmaps
const findBeatmaps = beatmapId => allBeatmaps.find(beatmap => Number(beatmap.beatmap_id) === Number(beatmapId))

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

// Hits container
const leftHitsContainerEl = document.getElementById("gameplay-section-left-hits-container")
const rightHitsContainerEl = document.getElementById("gameplay-section-right-hits-container")

// Now Playing
const nowPlayingBackgroundImageEl = document.getElementById("now-playing-background-image")
const nowPlayingBannerEl = document.getElementById("now-playing-banner")
const nowPlayingTitleEl = document.getElementById("now-playing-title")
const nowPlayingArtistEl = document.getElementById("now-playing-artist")
const nowPlayingMapperEl = document.getElementById("now-playing-mapper")
const nowPlayingModIdDifficultyEl = document.getElementById("now-playing-mod-id-difficulty")
const nowPlayingBpmEl = document.getElementById("now-playing-bpm")
const nowPlayingCsEl = document.getElementById("now-playing-cs")
const nowPlayingArEl = document.getElementById("now-playing-ar")
const nowPlayingOdEl = document.getElementById("now-playing-od")
const nowPlayingSrEl = document.getElementById("now-playing-sr")
const nowPlayingLengthEl = document.getElementById("now-playing-length")
let mapId, mapChecksum, currentRoundMap, updateStats = false

// Strains
const progressChart = document.getElementById("progress")
let tempStrains, seek, fullTime
let changeStats = false
let statsCheck = false
let last_strain_update = 0

// Score updating
const scoreNumberMainLeftEl = document.getElementById("gameplay-section-score-number-main-left")
const scoreNumberSecondaryLeftEl = document.getElementById("gameplay-section-score-number-secondary-left")
const scoreNumberDifferenceLeftEl = document.getElementById("gameplay-section-score-number-difference-left")
const scoreNumberMainRightEl = document.getElementById("gameplay-section-score-number-main-right")
const scoreNumberSecondaryRightEl = document.getElementById("gameplay-section-score-number-secondary-right")
const scoreNumberDifferenceRightEl = document.getElementById("gameplay-section-score-number-difference-right")
const accNumberMainLeftEl = document.getElementById("gameplay-section-acc-number-main-left")
const accNumberSecondaryLeftEl = document.getElementById("gameplay-section-acc-number-secondary-left")
const accNumberDifferenceLeftEl = document.getElementById("gameplay-section-acc-number-difference-left")
const accNumberMainRightEl = document.getElementById("gameplay-section-acc-number-main-right")
const accNumberSecondaryRightEl = document.getElementById("gameplay-section-acc-number-secondary-right")
const accNumberDifferenceRightEl = document.getElementById("gameplay-section-acc-number-difference-right")

const animations = {
    scoreNumberMainLeft: new CountUpImage(scoreNumberMainLeftEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , side: "red"}),
    scoreNumberSecondaryLeft: new CountUpImage(scoreNumberSecondaryLeftEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , side: "red"}),
    scoreNumberDifferenceLeft: new CountUp(scoreNumberDifferenceLeftEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: ".", side: "red"}),
    scoreNumberMainRight: new CountUpImage(scoreNumberMainRightEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , side: "blue"}),
    scoreNumberSecondaryRight: new CountUpImage(scoreNumberSecondaryRightEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , side: "blue"}),
    scoreNumberDifferenceRight: new CountUp(scoreNumberDifferenceRightEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: ".", side: "blue"}),
    accNumberMainLeft: new CountUpImage(accNumberMainLeftEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , side: "red", suffix: "%"}),
    accNumberSecondaryLeft: new CountUpImage(accNumberSecondaryLeftEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , side: "red", suffix: "%"}),
    accNumberDifferenceLeft: new CountUp(accNumberDifferenceLeftEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: ".", side: "red", suffix: "%"}),
    accNumberMainRight: new CountUpImage(accNumberMainRightEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , side: "blue", suffix: "%"}),
    accNumberSecondaryRight: new CountUpImage(accNumberSecondaryRightEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." , side: "blue", suffix: "%"}),
    accNumberDifferenceRight: new CountUp(accNumberDifferenceRightEl, 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: ".", side: "blue", suffix: "%"})
}

window.onload = function () {
	let ctx = document.getElementById('strain').getContext('2d')
	window.strainGraph = new Chart(ctx, config)

	let ctxProgress = document.getElementById('strain-progress').getContext('2d')
	window.strainGraphProgress = new Chart(ctxProgress, configProgress)
}

socket.onmessage = async event => {
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
    const player0 = data.tourney.clients[0]
    const player1 = data.tourney.clients[1]
    if (leftPlayerId !== player0.user.id && allTeams) {
        leftPlayerId = player0.user.id
        setPlayerInformation(leftPlayerId, leftTeam, leftPlayerInformationEl, player0)
    }
    // Client 1
    if (rightPlayerId !== player1.user.id && allTeams) {
        rightPlayerId = player1.user.id
        setPlayerInformation(rightPlayerId, rightTeam, rightPlayerInformationEl, player1)
    }

    // Hits
    setClientHitNumbers(leftHitsContainerEl, player0.play.hits)
    setClientHitNumbers(rightHitsContainerEl, player1.play.hits)

    // TODO: Now Playing Information
    if (mapId !== data.beatmap.id || mapChecksum !== data.beatmap.checksum) {
        mapId = data.beatmap.id
        mapChecksum = data.beatmap.checksum
        nowPlayingBackgroundImageEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${data.beatmap.set}/covers/cover.jpg")`
        nowPlayingBannerEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${data.beatmap.set}/covers/cover.jpg")`
        nowPlayingTitleEl.textContent = data.beatmap.title
        nowPlayingArtistEl.textContent = data.beatmap.artist
        nowPlayingMapperEl.textContent = data.beatmap.mapper

        // Found map
        currentRoundMap = findBeatmaps(mapId)
        if (currentRoundMap) {
            nowPlayingModIdDifficultyEl.textContent = `${currentRoundMap.mod}${currentRoundMap.order} - [${data.beatmap.version}]`
            nowPlayingBpmEl.textContent = Math.round(Number(currentRoundMap.bpm) * 10) / 10
            nowPlayingCsEl.textContent = Math.round(Number(currentRoundMap.diff_size) * 10) / 10
            nowPlayingArEl.textContent = Math.round(Number(currentRoundMap.diff_approach) * 10) / 10
            nowPlayingOdEl.textContent = Math.round(Number(currentRoundMap.diff_overall) * 10) / 10
            nowPlayingSrEl.textContent = Math.round(Number(currentRoundMap.difficultyrating) * 100) / 100
            nowPlayingLengthEl.textContent = setLengthDisplay(Number(currentRoundMap.total_length))
        } else {
            nowPlayingModIdDifficultyEl.textContent = `[${data.beatmap.version}]`
            await delay(500)
            updateStats = true
        }
    }

    if (updateStats) {
        updateStats = false
        nowPlayingBpmEl.textContent = data.beatmap.stats.bpm.common
        nowPlayingCsEl.textContent = data.beatmap.stats.cs.converted
        nowPlayingArEl.textContent = data.beatmap.stats.ar.converted
        nowPlayingOdEl.textContent = data.beatmap.stats.od.converted
        nowPlayingSrEl.textContent = data.beatmap.stats.stars.total
        nowPlayingLengthEl.textContent = setLengthDisplay(Math.round((data.beatmap.time.lastObject - data.beatmap.time.firstObject) / 1000))
    }

    const fullStrains = data.performance.graph.series[0].data.map((num, index) => num + data.performance.graph.series[1].data[index] + data.performance.graph.series[2].data[index] + data.performance.graph.series[3].data[index]);
    if (tempStrains != JSON.stringify(fullStrains) && window.strainGraph) {
        tempStrains = JSON.stringify(fullStrains)
        if (fullStrains) {
            let temp_strains = smooth(fullStrains, 5)
			let new_strains = []
			for (let i = 0; i < 60; i++) {
				new_strains.push(temp_strains[Math.floor(i * (temp_strains.length / 60))])
			}
			new_strains = [0, ...new_strains, 0]

			config.data.datasets[0].data = new_strains
			config.data.labels = new_strains
			config.options.scales.y.max = Math.max(...new_strains)
			configProgress.data.datasets[0].data = new_strains
			configProgress.data.labels = new_strains
			configProgress.options.scales.y.max = Math.max(...new_strains)
			window.strainGraph.update()
			window.strainGraphProgress.update()
        } else {
			config.data.datasets[0].data = []
			config.data.labels = []
			configProgress.data.datasets[0].data = []
			configProgress.data.labels = []
			window.strainGraph.update()
			window.strainGraphProgress.update()
		}
    }
    
    let currentLeftScore = 0
    let currentRightScore = 0
    const useAcc = currentRoundMap && currentRoundMap.mod === "RX"
    
    // Score source selection
    currentLeftScore = useAcc ? player0.play.accuracy : player0.play.score
    currentRightScore = useAcc ? player1.play.accuracy : player1.play.score

    // Element and animation targets
    const prefix = useAcc ? "accNumber" : "scoreNumber"
    const otherPrefix = useAcc ? "scoreNumber" : "accNumber"
    const animationsMap = animations
    const leftMainEl = window[`${prefix}MainLeftEl`]
    const leftSecondaryEl = window[`${prefix}SecondaryLeftEl`]
    const leftDifferenceEl = window[`${prefix}DifferenceLeftEl`]
    const rightMainEl = window[`${prefix}MainRightEl`]
    const rightSecondaryEl = window[`${prefix}SecondaryRightEl`]
    const rightDifferenceEl = window[`${prefix}DifferenceRightEl`]

    console.log(window[`${prefix}MainLeftEl`])

    console.log(
        leftMainEl,
        leftSecondaryEl,
        leftDifferenceEl,
        rightMainEl,
        rightSecondaryEl,
        rightDifferenceEl
    )

    // Update animations
    animationsMap[`${prefix}MainLeft`].update(currentLeftScore)
    animationsMap[`${prefix}SecondaryLeft`].update(currentLeftScore)
    animationsMap[`${prefix}DifferenceLeft`].update(currentLeftScore - currentRightScore)
    animationsMap[`${prefix}MainRight`].update(currentRightScore)
    animationsMap[`${prefix}SecondaryRight`].update(currentRightScore)
    animationsMap[`${prefix}DifferenceRight`].update(currentRightScore - currentLeftScore)

    // Toggle visibility
    const isLeftLeading = currentLeftScore > currentRightScore
    const isTied = currentLeftScore === currentRightScore

    // Main score method visibility
    leftMainEl.style.opacity = isLeftLeading || isTied ? 1 : 0
    leftSecondaryEl.style.opacity = isLeftLeading || isTied ? 0 : 1
    leftDifferenceEl.style.opacity = isLeftLeading || isTied ? 0 : 1

    rightMainEl.style.opacity = !isLeftLeading || isTied ? 1 : 0
    rightSecondaryEl.style.opacity = !isLeftLeading || isTied ? 0 : 1
    rightDifferenceEl.style.opacity = !isLeftLeading || isTied ? 0 : 1

    // Hide inactive score method elements
    ["Main", "Secondary", "Difference"].forEach(type => {
        window[`${otherPrefix}${type}LeftEl`].style.opacity = 0
        window[`${otherPrefix}${type}RightEl`].style.opacity = 0
    })
    // TODO: Pick Information
}

// Display Length


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

// Set client hits
function setClientHitNumbers(containerElement, hits) {
    containerElement.children[0].children[0].innerText = `${hits[100] + hits["katu"]}x`
    containerElement.children[1].children[0].innerText = `${hits[50]}x`
    containerElement.children[2].children[0].innerText = `${hits[0]}x`
}

// Set Length Display
function setLengthDisplay(seconds) {
    const minuteCount = Math.floor(seconds / 60)
    const secondCount = seconds % 60

    return `${minuteCount.toString().padStart(2, "0")}:${secondCount.toString().padStart(2, "0")}`
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

// Configs are for strain graphs
let config = {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			borderColor: 'rgb(0, 210, 218)',
			backgroundColor: 'rgb(0, 210, 218)',
			data: [],
			fill: true,
			stepped: false,
		}]
	},
	options: {
		tooltips: { enabled: false },
		legend: { display: false, },
		elements: { point: { radius: 0 } },
		responsive: false,
		scales: {
			x: { display: false, },
			y: {
				display: false,
				min: 0,
				max: 100
			}
		},
		animation: { duration: 0 }
	}
}

let configProgress = {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			borderColor: 'rgb(0, 210, 218)',
			backgroundColor: 'rgb(0, 63, 141)',
			data: [],
			fill: true,
			stepped: false,
		}]
	},
	options: {
		tooltips: { enabled: false },
		legend: { display: false, },
		elements: { point: { radius: 0 } },
		responsive: false,
		scales: {
			x: { display: false, },
			y: {
				display: false,
				min: 0,
				max: 100
			}
		},
		animation: { duration: 0 }
	}
}