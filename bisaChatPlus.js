// ==UserScript==
// @name         BC+
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://community.bisafans.de/chat/index.php?room/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bisafans.de
// @grant        none
// ==/UserScript==

const chatUL = document.getElementsByClassName("scrollContainer")[0].childNodes[1];
const observerConfig = {childList:true};

let highlightList = ["Frechdachs","test", "john"];

const callback = (mutationList, observer) => {

    const newNodes = Array.from(chatUL.getElementsByClassName("chatMessage htmlContent")).filter(n => !n.hasAttribute("bcp-observed"));
    for(let chatMessageNode of newNodes){
        const msg = chatMessageNode.innerText;
        console.log(msg);
        chatMessageNode.setAttribute("bcp-observed",true);

        const foundTriggers = highlightList.filter(h => {
            console.log("h:", h, "msg: ", msg, "includes: ", msg.toLowerCase().includes(h.toLowerCase()));
            return msg.toLowerCase().includes(h.toLowerCase());
        });
        console.log(foundTriggers);
        if(foundTriggers.length>0){
            chatMessageNode.style.background = "yellow";

        }
    }


}

const observer = new MutationObserver(callback);
observer.observe(chatUL, observerConfig);