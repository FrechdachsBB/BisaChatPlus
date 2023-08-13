const chatUL = document.getElementsByClassName("scrollContainer")[0].childNodes[1];
const observerConfig = {childList:true};

let highlightList = ["Frechdachs"];

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
        if(foundTriggers.length===0)continue;
        chatMessageNode.style.background = "yellow";



    }


}

const observer = new MutationObserver(callback);
observer.observe(chatUL, observerConfig);