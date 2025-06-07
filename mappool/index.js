// osu! chat length
const osuChatDisplayContainer = document.getElementById("osu-chat-display-container")
let chatLength

const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // This is mostly taken from Victim Crasher: https://github.com/VictimCrasher/static/tree/master/WaveTournament
    if (chatLength !== data.tourney.chat.length) {
        (chatLength === 0 || chatLength > data.tourney.chat.length) ? (osuChatDisplayContainer.innerHTML = "", chatLen = 0) : null
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

        osuChatDisplayContainer.append(fragment)
        chatLength = data.tourney.chat.length
        osuChatDisplayContainer.scrollTop = osuChatDisplayContainer.scrollHeight
    }
}