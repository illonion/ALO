/* Text Area */
const textareaEl = document.getElementById("textarea")
let allTeams = []
function submit() {
    let textareaValue = textareaEl.value
    let textareaSplitLine = textareaValue.split("\n")
    allTeams = []
    
    for (let i = 0; i < textareaSplitLine.length; i++) {
        if (/^[^,\s]+$/.test(textareaSplitLine[i])) continue
        const textareaSplitCommas = textareaSplitLine[i].split("\t")
        const team = {
            "team_name": textareaSplitCommas[0],
            "player_ids": [Number(textareaSplitCommas[1]), Number(textareaSplitCommas[2])],
            "player_names": [textareaSplitCommas[3], textareaSplitCommas[4]],
            "player_ranks": [Number(textareaSplitCommas[5]), Number(textareaSplitCommas[6])],
            "seed": Number(textareaSplitCommas[7]),
            "mod_ranks":  [Number(textareaSplitCommas[8]), Number(textareaSplitCommas[9]), Number(textareaSplitCommas[10]), Number(textareaSplitCommas[11]), Number(textareaSplitCommas[12])]
        }
        allTeams.push(team)
    }
    const teamsStr = "data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(allTeams, null, 4))
    let teamsAnchor = document.createElement("a")
    teamsAnchor.setAttribute("href", teamsStr)
    teamsAnchor.setAttribute("download", "teams.json")
    teamsAnchor.click()
}