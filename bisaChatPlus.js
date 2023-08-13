const script = async function() {
    const chatUL = document.getElementsByClassName("scrollContainer")[0].childNodes[1];
    const observerConfig = {childList: true};

    let trigger = await GM.getValue("bcplus_trigger", "");
    let playSound = await GM.getValue("bcplus_playSound", true);
    let highlightColor = await GM.getValue("bcplus_highlightColor", "#ffff00");
    let settingsVisible = false;
    let settingsNode = undefined;


    const audio = new Audio("https://github.com/FrechdachsBB/BisaChatPlus/raw/dev/Ruf_001.mp3");
    const li = document.createElement("li");

    const analyzeChatMessages = (mutationList, observer) => {
        if (trigger.length === 0) return;
        const newNodes = Array.from(chatUL.getElementsByClassName("chatMessage htmlContent")).filter(n => !n.hasAttribute("bcp-observed"));
        const higlightListArr = trigger.split(",")

        for (let chatMessageNode of newNodes) {
            const msg = chatMessageNode.innerText;
            console.log(msg);
            chatMessageNode.setAttribute("bcp-observed", true);

            const foundTriggers = higlightListArr.filter(h => msg.toLowerCase().includes(h.toLowerCase().trim()));
            console.log(foundTriggers);
            if (foundTriggers.length === 0) continue;
            chatMessageNode.style.background = highlightColor;
            if (playSound && document.hidden) audio.play();
        }


    }

    function insertNavigation() {

        const navBar = document.getElementsByClassName("buttonGroup jsOnly")[0];

        const a = document.createElement("a");

        a.setAttribute("class", "button");
        a.innerText = "BisaChat +";
        a.addEventListener('click', toggleSettingsDisplay)
        li.appendChild(a);
        navBar.appendChild(li);
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
            settingsNode.appendChild(createInputNode(trigger,"text", callBackTrigger));
            settingsNode.appendChild(createLabelNode("Highlight-Farbe:"));
            settingsNode.appendChild(createInputNode(highlightColor,"text", callBackHighlightColor));
            settingsNode.appendChild(createLabelNode("Sound:"));
            let checkbox = createInputNode("", "checkbox", callBackPlaySound);
            settingsNode.appendChild(checkbox);
            checkbox.checked = playSound;

            li.appendChild(settingsNode);
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
        trigger = node.value;
    }

    function callBackHighlightColor(node) {
        const val = node.value;
        if (!val.match("^#(?:[0-9a-fA-F]{3}){1,2}$")) {
            node.style.background = "#ffe0e0";
            return;
        }
        node.style.background = "unset";
        GM.setValue("bcplus_highlightColor", val);
        highlightColor = val;
    }

    function callBackPlaySound(node) {
        GM.setValue("bcplus_playSound", node.checked);
        playSound = node.checked;
    }

    function createInputNode(value = "", type = "text", callback = node => {
    }) {
        const input = document.createElement("input");
        input.setAttribute("type", type);
        input.value = value;
        input.addEventListener(
            'change',
            ()=>callback(input)
        );
        return input;
    }

    const observer = new MutationObserver(analyzeChatMessages);
    observer.observe(chatUL, observerConfig);
    insertNavigation();
};
script();