const twitchChatDisplayContainerEl = document.getElementById("twitch-chat-display-container")
const chatNames = []
const findChatter = name => chatNames.find(chatter => chatter.name === name)

// Apply colour to chatter
function setChatterColour(element, {r, g, b}) {
    element.style.color = `rgb(${r}, ${g}, ${b})`
}

// Delete all messages from user
function deleteAllMessagesFromUser(twitchId) {
    const allTwitchChatMessages = Array.from(document.getElementsByClassName("twitch-chat-message"))
    allTwitchChatMessages.forEach((message) => {
        if (message.dataset.twitchId === twitchId) {
            message.remove()
        }
    })
}

// On Chat
ComfyJS.onChat = ( user, message, flags, self, extra ) => {

    // Check if user has sent a message before
    let foundChatter = findChatter(user)

    // Get rid of nightbot messages
    if (user === "Nightbot") return

    // Chat message container
    const chatDisplayWrapper = document.createElement("div")
    chatDisplayWrapper.setAttribute("id", extra.id)
    chatDisplayWrapper.classList.add("chat-display-wrapper", "twitch-chat-message")

    // Chat Display Name
    const chatDisplayName = document.createElement("div")
    chatDisplayName.classList.add("chat-display-name")

    // Chat Display Name Text
    const chatDisplayNameText = document.createElement("span")
    chatDisplayNameText.classList.add("chat-display-name-text")
    chatDisplayNameText.innerText = user

    // Apply colouring
    if (!foundChatter) {
        const newChatter = {
            name: user,
            r: Math.floor(Math.random() * (255 - 128 + 1)) + 128,
            g: Math.floor(Math.random() * (255 - 128 + 1)) + 128,
            b: Math.floor(Math.random() * (255 - 128 + 1)) + 128
        }
        chatNames.push(newChatter)
        foundChatter = newChatter
    }
    setChatterColour(chatDisplayNameText, foundChatter)

    // Chat Display Name Colon
    const chatDisplayNameColon = document.createElement("span")
    chatDisplayNameColon.innerText = ":"

    // Chat Display Message
    const chatDisplayMessage = document.createElement("div")
    chatDisplayMessage.classList.add("chat-display-message")
    chatDisplayMessage.innerText = message
    
    // Append everything together
    chatDisplayName.append(chatDisplayNameText, chatDisplayNameColon)
    chatDisplayWrapper.append(chatDisplayName, chatDisplayMessage)
    twitchChatDisplayContainerEl.append(chatDisplayWrapper)
}

// Delete message
ComfyJS.onMessageDeleted = (id, extra) => document.getElementById(id).remove()

// Timeout
ComfyJS.onTimeout = ( timedOutUsername, durationInSeconds, extra ) => deleteAllMessagesFromUser(extra.timedOutUserId)

// Ban
ComfyJS.onBan = (bannedUsername, extra) => deleteAllMessagesFromUser(extra.bannedUserId)

// Initialise
ComfyJS.Init( "aimlegendsopen" )