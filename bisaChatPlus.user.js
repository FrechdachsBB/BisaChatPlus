// ==UserScript==
// @name         BC+
// @version      0.3.4
// @description  Bloß eine schwache Imitation des ursprünglichen BC+
// @author       Frechdachs
// @match        https://community.bisafans.de/chat/index.php?room/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bisafans.de
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

const userProfileLinkPrefix = "https://community.bisafans.de/index.php?user/"
const ownUserID = document.getElementsByClassName("userMenuItemLink")[0]
    .getAttribute("href")
    .substring(userProfileLinkPrefix.length)
    .split("-")[0]


const script = async function () {
    const chatUL = document.getElementsByClassName("scrollContainer")[0].childNodes[1];
    const observerConfig = { childList: true };

    let triggerListUnescaped = await GM.getValue("bcplus_trigger", "");
    let triggerList = "";
    escapeTriggerList();
    let playSound = await GM.getValue("bcplus_playSound", true);
    let highlightColor = await GM.getValue("bcplus_highlightColor", "#ffffaa");
    let settingsVisible = false;
    let settingsNode = undefined;

    const audio = new Audio("https://github.com/FrechdachsBB/BisaChatPlus/raw/main/bing.wav");
    const navbarLi = document.createElement("li");
    const analyzeChatMessages = (mutationList, observer) => {
        if (triggerList.length === 0) return;
        const triggerListArr = triggerList.split(",")

        for (let mutationRecord of mutationList) {
            addedNodes = mutationRecord.addedNodes;
            for (let node of addedNodes) {
                const message = node.getElementsByClassName("chatMessage htmlContent")[0].innerText;
                console.log(node);
                let user = ""

                let usernameNode = node.getElementsByClassName("username")[0].getElementsByClassName("jsUserActionDropdown")[0];
                let userID = usernameNode.getAttribute("data-user-id");
                if(userID === ownUserID)continue;

                for (let nameNode of usernameNode.childNodes) {
                    if (nameNode.innerText) {
                        user += nameNode.innerText;
                    }
                }

                if (node.getAttribute("data-object-type") !== "be.bastelstu.chat.messageType.whisper") {
                    const foundTriggers = triggerListArr.filter(trigger => {
                        return message.toLowerCase().match("((^| |:|,|;)" + trigger.trimStart() + "( |\\.|$|,|:|;|!|\\?))|(<" + trigger.trimStart() + ">)") != null;
                    });
                    if (foundTriggers.length === 0) continue;
                    node.style.background = highlightColor;
                }
                if (playSound && (document.hidden || !document.hasFocus())) audio.play();
            }
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
            settingsNode.appendChild(createInputNode(triggerListUnescaped, "text", callBackTrigger));
            settingsNode.appendChild(createLabelNode("Highlight-Farbe:"));
            settingsNode.appendChild(createInputNode(highlightColor, "text", callBackHighlightColor));
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

    function createInputNode(value = "", type = "text", callback = node => { }) {
        const input = document.createElement("input");
        input.setAttribute("type", type);
        input.value = value;
        input.addEventListener(
            'change',
            () => callback(input)
        );
        return input;
    }

    function escapeTriggerList() {
        triggerList = triggerListUnescaped.replace(/[#-.]|[[-^]|[?|{}]/g, '\$&')
    }

    const observer = new MutationObserver(analyzeChatMessages);
    observer.observe(chatUL, observerConfig);
    insertNavigation();
};
script();