// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//

// Customer Code
import "phoenix_html"
import {Socket, Presence} from "phoenix"

let user = document.getElementById("user").innerText

let socket = new Socket("/socket", {params: {user: user}})

socket.connect()


let presences = {}

let formulatedTimestamp = (Ts) => {
    let date = new Date(Ts)

    return date.toLocaleString()
}

let listBy = (user, {metas: metas}) => {
    return {
        user: user,
        onlineAt: formulatedTimestamp(metas[0].online_at)
    }
}


let userList = document.getElementById("userList")

let render = (presences) => {
    userList.innerHTML = Presence.list(presences, listBy)
    .map(presences =>
        `
        <li>
        ${presence.user}
        <br/>
        <small>online since ${presence.onlineAt}</small>
        `
        )
        .join("")
}


let room = socket.channel("room:lobby")

room.on("presence_state", state =>{
    presences = Presence.syncState(presences, state)
    render(presences)
})

room.on("presence_diff", diff => {
    presences = Presence.syncDiff(presences, diff)
    render(presences)
})


room.join()




let messageInput = document.getElementById("newMessage")

messageInput.addEventListener("keypress", (e) =>{
    if (e.keyCode == 13 && messageInput.value != ""){
        room.push("message:new", messageInput.value)
        messageInput.value = ""
    }
})

let messageList = document.getElementById("messageList")
let renderMessage = (message) => {
    let messageElement = document.createElement("li")
    messageElement.innerHTML = `

    <b> ${message.user} </b>
    <b> ${formatTimestamp(message.timestamp)} </b>
    <b> ${message.body} </b>
    `
    messageList.appendChild(messageElement)
    messageList.scrollTop = messageList.scrollHeight
}
