// ==UserScript==
// @name         BC+
// @version      0.3.3
// @description  Bloß eine schwache Imitation des ursprünglichen BC+
// @author       Frechdachs
// @match        https://community.bisafans.de/chat/index.php?room/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bisafans.de
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

const userProfileLinkPrefix = "https://community.bisafans.de/index.php?user/"
const userID = document.getElementsByClassName("userMenuItemLink")[0]
    .getAttribute("href")
    .substring(userProfileLinkPrefix.length)
    .split("-")[0]


const script = async function() {
    const chatUL = document.getElementsByClassName("scrollContainer")[0].childNodes[1];
    const observerConfig = {childList: true};

    let triggerListUnescaped = await GM.getValue("bcplus_trigger", "");
    let triggerList = "";
    escapeTriggerList();
    let playSound = await GM.getValue("bcplus_playSound", true);
    let highlightColor = await GM.getValue("bcplus_highlightColor", "#ffffaa");
    let settingsVisible = false;
    let settingsNode = undefined;
    let checkedMessages = 0;


    const audio = new Audio("https://github.com/FrechdachsBB/BisaChatPlus/raw/main/bing.wav");
    const navbarLi = document.createElement("li");

    const analyzeChatMessages = (mutationList, observer) => {
        if (triggerList.length === 0) return;
        const newNodes = Array.from(chatUL.getElementsByClassName("chatMessage htmlContent"));
        const triggerListArr = triggerList.split(",")


        while (checkedMessages<newNodes.length) {
            const chatMessageNode = newNodes[checkedMessages];
            checkedMessages++;
            const msg = chatMessageNode.innerText;

            const chatMessageContainer = chatMessageNode.parentElement.parentElement.parentElement;
            if(chatMessageContainer.getAttribute("data-user-id")==userID)continue;

            //Filtern der Nachricht wird übersprungen, wenn es sich um eine Flüsternachricht handelt und es wird direkt zum Highlightpart gesprungen
            if(chatMessageContainer.getAttribute("data-object-type")!=="be.bastelstu.chat.messageType.whisper") {
                const foundTriggers = triggerListArr.filter(trigger => {
                    return msg.toLowerCase().match("((^| |:|,|;)" + trigger.trimStart() + "( |\\.|$|,|:|;|!|\\?))|(<"+trigger.trimStart()+">)") != null;
                });
                if (foundTriggers.length === 0) continue;
            }
            chatMessageNode.style.background = highlightColor;
            if (playSound && document.hidden) audio.play();
        }


    }

    function insertNavigation() {

        const navBar = document.getElementsByClassName("buttonGroup jsOnly")[0];

        const a = document.createElement("a");

        a.setAttribute("class", "button");
        a.innerText = "BC+";
        a.addEventListener('click', toggleSettingsDisplay)
        navbarLi.appendChild(a);
        navBar.appendChild(navbarLi);
    }

    function toggleSettingsDisplay() {
        if (settingsVisible) hideSettings();
        else displaySettings();
    }

    function displaySettings() {
        settingsVisible = true;
        if (settingsNode === undefined) {
            settingsNode = document.createElement("div");
            settingsNode.style.display = "grid";
            settingsNode.style.gridTemplateColumns = "1fr 3fr";
            settingsNode.style.width = "500px";
            settingsNode.style.outline = "1px solid black";
            settingsNode.style.padding = "5px";
            settingsNode.style.margin = "5px";

            settingsNode.appendChild(createLabelNode("Trigger:"));
            settingsNode.appendChild(createInputNode(triggerListUnescaped,"text", callBackTrigger));
            settingsNode.appendChild(createLabelNode("Highlight-Farbe:"));
            settingsNode.appendChild(createInputNode(highlightColor,"text", callBackHighlightColor));
            settingsNode.appendChild(createLabelNode("Sound:"));
            let checkbox = createInputNode("", "checkbox", callBackPlaySound);
            settingsNode.appendChild(checkbox);
            checkbox.checked = playSound;

            navbarLi.appendChild(settingsNode);
        }
        settingsNode.style.display = "grid";
    }

    function hideSettings() {
        settingsVisible = false;
        if (settingsNode === undefined) return;
        else settingsNode.style.display = "none";
    }

    function createLabelNode(text) {
        const label = document.createElement("label");
        label.innerText = text;
        return label;
    }

    function callBackTrigger(node) {
        GM.setValue("bcplus_trigger", node.value);
        triggerListUnescaped = node.value;
        escapeTriggerList();
    }

    function callBackHighlightColor(node) {
        const val = node.value;
        if (!val.match("^#(?:[0-9a-fA-F]{3}){1,2}$")) {
            node.style.background = "#ffe0e0";
            node.style.color = "darkred";
            return;
        }
        node.style.removeProperty("background");
        node.style.removeProperty("color");

        GM.setValue("bcplus_highlightColor", val);
        highlightColor = val;
    }

    function callBackPlaySound(node) {
        GM.setValue("bcplus_playSound", node.checked);
        playSound = node.checked;
    }

    function createInputNode(value = "", type = "text", callback = node => {}){
        const input = document.createElement("input");
        input.setAttribute("type", type);
        input.value = value;
        input.addEventListener(
            'change',
            ()=>callback(input)
        );
        return input;
    }

    function escapeTriggerList(){
       triggerList = triggerListUnescaped.replace(/[#-.]|[[-^]|[?|{}]/g, '\$&')
    }


    //TODO sorgt momentan noch für Absturz des Chats
    function insertDummyChatMessage(username, message, whisper=false){
        const chatMessageOuterContainer = document.createElement("li");
        chatMessageOuterContainer.setAttribute("class","chatMessageBoundary first");
        chatMessageOuterContainer.setAttribute("data-object-type", "be.bastelstu.chat.messageType."+(whisper?"whisper":"plain"));

        const chatMessageInnerContainer = document.createElement("div");
        chatMessageOuterContainer.appendChild(chatMessageInnerContainer);
        chatMessageInnerContainer.setAttribute("class","chatMessageContainer");

        const chatMessageSide = document.createElement("div");
        chatMessageInnerContainer.appendChild(chatMessageSide);
        chatMessageSide.setAttribute("class","chatMessageSide");

        const chatUserAvatar = document.createElement("div");
        chatMessageSide.appendChild(chatUserAvatar);
        chatUserAvatar.setAttribute("class","chatUserAvatar");

        const userAvatar = document.createElement("img");
        chatUserAvatar.appendChild(userAvatar);
        userAvatar.setAttribute("src","https://github.com/FrechdachsBB/BisaChatPlus/raw/dev/avatar.png");
        userAvatar.setAttribute("height","32");
        userAvatar.setAttribute("width","32");
        userAvatar.setAttribute("loading","lazy");

        const chatMessageContent =  document.createElement("div");
        chatMessageInnerContainer.appendChild(chatMessageContent);
        chatMessageContent.setAttribute("class","chatMessageContent");

        const chatMessageHeader = document.createElement("chatMessageHeader");
        chatMessageContent.appendChild(chatMessageHeader);
        chatMessageHeader.setAttribute("class","chatMessageHeader");

        const spanUsername = document.createElement("span");
        chatMessageHeader.appendChild(spanUsername);
        spanUsername.setAttribute("class","username");
        spanUsername.innerText = username;

        const chatMessage = document.createElement("div");
        chatMessageContent.appendChild(chatMessage);
        chatMessage.setAttribute("class", "chatMessage htmlContent");
        chatMessage.innerText = message;

        const messages = document.getElementsByClassName("chatMessageBoundary");
        messages.item(messages.length-1).parentElement.appendChild(chatMessageOuterContainer);

    }


    const observer = new MutationObserver(analyzeChatMessages);
    observer.observe(chatUL, observerConfig);
    insertNavigation();
};
script();