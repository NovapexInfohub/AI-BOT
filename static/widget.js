// ================== GET PARAMS ==================
const params = new URLSearchParams(document.currentScript.src.split("?")[1]);
const agent_id = params.get("agent_id");

const fa = document.createElement("link");
fa.rel = "stylesheet";
fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
document.head.appendChild(fa);

let chatbotName = params.get("name") || "AI Assistant";


// ================== GLOBAL STYLE ==================
let globalStyle = document.createElement("style");
globalStyle.innerHTML = `

.typingWrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  animation: fadeIn .3s ease;
}

.typingBubble {
  background: #ffffff;
  padding: 12px 16px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
}

.typingText {
  font-size: 13px;
  color: #999;
  margin-right: 4px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4f6df5;
  animation: bounce 1.3s infinite ease-in-out;
  display: inline-block;
}

.dot:nth-child(2) { animation-delay: .2s; }
.dot:nth-child(3) { animation-delay: .4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(.5); opacity: .4; }
  40%            { transform: scale(1);  opacity: 1;  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: none; }
}

@keyframes pulseBot {
  0%   { box-shadow: 0 0 0 0 rgba(79,109,245,.4); transform: scale(1); }
  50%  { transform: scale(1.05); }
  70%  { box-shadow: 0 0 0 15px rgba(79,109,245,0); }
  100% { transform: scale(1); }
}

@keyframes blinkBot {
  0%,45%,48%,100% { transform: scaleY(1); }
  46%,47%         { transform: scaleY(.08); }
}

@keyframes livePing {
  0%   { box-shadow: 0 0 0 0 rgba(0,210,106,.6); }
  70%  { box-shadow: 0 0 0 10px rgba(0,210,106,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,210,106,0); }
}

@keyframes widgetSlideUp {
  from { opacity: 0; transform: translateY(18px) scale(.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

`;
document.head.appendChild(globalStyle);


// ================== CHAT ICON ==================
let chatIcon = document.createElement("div");
chatIcon.innerHTML = `
  <div class="botAvatar">
    <span class="botEmoji">👩‍💻</span>
    <span class="statusDot"></span>
  </div>
`;

let avatarStyle = document.createElement("style");
avatarStyle.innerHTML = `
.botAvatar {
  position: relative;
  width: 60px; height: 60px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg,#4a6cf7,#6f8cff);
  box-shadow: 0 10px 25px rgba(0,0,0,.25);
  animation: pulseBot 2.5s infinite;
}
.botEmoji {
  font-size: 30px;
  animation: blinkBot 4s infinite;
  transform-origin: center;
}
.statusDot {
  position: absolute; right: 10px; bottom: 10px;
  width: 11px; height: 11px;
  background: #00d26a; border-radius: 50%;
  box-shadow: 0 0 0 rgba(0,210,106,.6);
  animation: livePing 1.8s infinite;
}
`;
document.head.appendChild(avatarStyle);

Object.assign(chatIcon.style, {
  position: "fixed", bottom: "20px", right: "20px",
  cursor: "pointer", zIndex: "999999", transition: ".3s"
});
chatIcon.onmouseenter = () => chatIcon.style.transform = "translateY(-4px) scale(1.05)";
chatIcon.onmouseleave = () => chatIcon.style.transform = "scale(1)";
document.body.appendChild(chatIcon);


// ================== OUTER WRAPPER ==================
// Two separate floating blocks stacked vertically
let outerWrapper = document.createElement("div");
Object.assign(outerWrapper.style, {
  position: "fixed",
  bottom: "90px",
  right: "20px",
  width: "400px",
  maxHeight: "82vh",
  display: "none",
  flexDirection: "column",
  gap: "10px",
  zIndex: "999999",
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  animation: "widgetSlideUp .3s ease"
});
if (window.innerWidth < 500) {
  outerWrapper.style.width = "92%";
  outerWrapper.style.right = "4%";
}
document.body.appendChild(outerWrapper);


// ================== TOP BLOCK — CHAT CARD ==================
let topBlock = document.createElement("div");
Object.assign(topBlock.style, {
  background: "#ffffff",
  borderRadius: "18px",
  boxShadow: "0 8px 32px rgba(0,0,0,.13)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  flex: "1",
  minHeight: "0",
  maxHeight: "calc(82vh - 130px)"
});
outerWrapper.appendChild(topBlock);


// ---- TOP BLOCK: scroll hint bar ----
let scrollHint = document.createElement("div");
Object.assign(scrollHint.style, {
  display: "none",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "7px 12px",
  background: "#f7f8ff",
  borderBottom: "1px solid #eaedff",
  fontSize: "12px",
  color: "#7a8cc4",
  cursor: "pointer",
  fontWeight: "500",
  letterSpacing: ".2px"
});
scrollHint.innerHTML = `<span style="font-size:11px;">▲</span> Scroll up for history`;
scrollHint.onclick = () => chatArea.scrollTo({ top: 0, behavior: "smooth" });
topBlock.appendChild(scrollHint);


// ---- TOP BLOCK: inner header (bot name + controls) ----
let topHeader = document.createElement("div");
Object.assign(topHeader.style, {
  padding: "12px 14px 10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid #f0f2ff",
  flexShrink: "0"
});

topHeader.innerHTML = `
  <div style="display:flex;align-items:center;gap:9px;">

    <div style="
      width:34px;height:34px;border-radius:50%;
      background:linear-gradient(135deg,#4a6cf7,#6f8cff);
      display:flex;align-items:center;justify-content:center;
      font-size:17px;flex-shrink:0;
    ">👩‍💻</div>

    <div>
      <div style="font-size:14px;font-weight:700;color:#1a1a2e;">${chatbotName}</div>
      <div style="display:flex;align-items:center;gap:5px;margin-top:1px;">
        <span id="onlineDot" style="
          width:8px;height:8px;background:#00d26a;border-radius:50%;
          display:inline-block;box-shadow:0 0 6px rgba(0,210,106,.6);
          animation:livePing 1.8s infinite;
        "></span>
        <span id="statusText" style="font-size:11.5px;color:#888;">Online</span>
      </div>
    </div>

  </div>

  <div style="display:flex;align-items:center;gap:12px;">
    <span id="refreshChat" title="New Chat" style="
      cursor:pointer;font-size:18px;color:#7a8cc4;
      transition:color .15s;line-height:1;
    ">↻</span>
    <span id="closeChat" title="Close" style="
      cursor:pointer;font-size:19px;color:#7a8cc4;
      transition:color .15s;line-height:1;
    ">✖</span>
  </div>
`;
topBlock.appendChild(topHeader);


// ---- TOP BLOCK: chat area ----
let chatArea = document.createElement("div");
Object.assign(chatArea.style, {
  flex: "1",
  padding: "14px 14px 10px",
  overflowY: "auto",
  background: "#fafbff",
  fontSize: "14px",
  lineHeight: "1.55",
  minHeight: "180px"
});

// scrollbar style
let sbStyle = document.createElement("style");
sbStyle.innerHTML = `
  #nova-chat-scroll::-webkit-scrollbar { width: 4px; }
  #nova-chat-scroll::-webkit-scrollbar-track { background: transparent; }
  #nova-chat-scroll::-webkit-scrollbar-thumb { background: #dde2ff; border-radius: 4px; }
`;
document.head.appendChild(sbStyle);
chatArea.id = "nova-chat-scroll";

chatArea.addEventListener("scroll", () => {
  scrollHint.style.display = chatArea.scrollTop > 60 ? "flex" : "none";
});

topBlock.appendChild(chatArea);


// ================== BOTTOM BLOCK — INPUT CARD ==================
let bottomBlock = document.createElement("div");
Object.assign(bottomBlock.style, {
  background: "#ffffff",
  borderRadius: "18px",
  boxShadow: "0 8px 32px rgba(0,0,0,.13)",
  overflow: "hidden",
  flexShrink: "0"
});
outerWrapper.appendChild(bottomBlock);


// ---- BOTTOM BLOCK: input row ----
let inputRow = document.createElement("div");
Object.assign(inputRow.style, {
  display: "flex",
  alignItems: "center",
  padding: "12px 14px",
  gap: "8px"
});

let input = document.createElement("input");
Object.assign(input.style, {
  flex: "1",
  border: "none",
  outline: "none",
  fontSize: "14px",
  color: "#1a1a2e",
  background: "transparent",
  fontFamily: "'Inter','Segoe UI',sans-serif"
});
input.placeholder = "Ask me anything...";
inputRow.appendChild(input);

let sendBtn = document.createElement("button");
sendBtn.innerHTML = "➤";
Object.assign(sendBtn.style, {
  border: "none",
  background: "linear-gradient(135deg,#4a6cf7,#6f8cff)",
  color: "white",
  borderRadius: "50%",
  width: "36px",
  height: "36px",
  cursor: "pointer",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0"
});
inputRow.appendChild(sendBtn);
bottomBlock.appendChild(inputRow);


// ---- BOTTOM BLOCK: divider ----
let divider = document.createElement("div");
divider.style.cssText = "height:1px;background:#f0f2ff;margin:0 14px;";
bottomBlock.appendChild(divider);


// ---- BOTTOM BLOCK: footer actions ----
let footerBar = document.createElement("div");
Object.assign(footerBar.style, {
  display: "flex",
  alignItems: "center",
  padding: "8px 6px",
  gap: "2px"
});

const footerActions = [
  { icon: "fa-solid fa-bell",         label: "New updates" },
  { icon: "fa-solid fa-comment-dots", label: "Feedback" },
  { icon: "fa-solid fa-headset",      label: "Contact Support" }
];

footerActions.forEach(({ icon, label }) => {
  let btn = document.createElement("button");
  Object.assign(btn.style, {
    display: "flex", alignItems: "center", gap: "5px",
    fontSize: "11.5px", color: "#7a8cc4",
    background: "none", border: "none", cursor: "pointer",
    padding: "5px 9px", borderRadius: "8px",
    transition: "background .15s, color .15s",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    fontWeight: "500", whiteSpace: "nowrap"
  });
  btn.innerHTML = `<i class="${icon}" style="font-size:12px;"></i>${label}`;
  btn.onmouseenter = () => { btn.style.background = "#eef0ff"; btn.style.color = "#4a6cf7"; };
  btn.onmouseleave = () => { btn.style.background = "none";    btn.style.color = "#7a8cc4"; };
  footerBar.appendChild(btn);
});

bottomBlock.appendChild(footerBar);


// ================== STATUS HELPER ==================
function setBotStatus(mode) {
  let dot = document.getElementById("onlineDot");
  let txt = document.getElementById("statusText");
  if (!dot || !txt) return;
  if (mode === "online")   { dot.style.background = "#00d26a"; txt.innerHTML = "Online"; }
  if (mode === "thinking") { dot.style.background = "#f59e0b"; txt.innerHTML = "Typing..."; }
  if (mode === "away")     { dot.style.background = "#ffcc00"; txt.innerHTML = "Away"; }
}


// ================== FORMAT RESPONSE ==================
function formatResponse(text) {

  // ### Heading
  text = text.replace(/^### (.*$)/gim,
    `<div style="font-size:15px;font-weight:700;margin-top:14px;margin-bottom:6px;color:#1a1a2e;padding-bottom:4px;border-bottom:2px solid #e2e8ff;">$1</div>`
  );

  // ## Heading
  text = text.replace(/^## (.*$)/gim,
    `<div style="font-size:14px;font-weight:700;margin-top:12px;margin-bottom:5px;color:#1a1a2e;">$1</div>`
  );

  // **bold**
  text = text.replace(/\*\*(.*?)\*\*/g,
    `<strong style="font-weight:700;color:#1a1a2e;">$1</strong>`
  );

  // bullet list
  text = text.replace(/^(?:•|-|\*)\s(.+)$/gm,
    `<li style="margin-bottom:6px;line-height:1.65;color:#2d2d2d;">$1</li>`
  );

  // numbered list
  text = text.replace(/^\d+\.\s(.+)$/gm,
    `<li style="margin-bottom:6px;line-height:1.65;color:#2d2d2d;">$1</li>`
  );

  // wrap li in ul
  text = text.replace(/(<li.*?>.*?<\/li>)/gs,
    `<ul style="padding-left:20px;margin-top:8px;margin-bottom:8px;">$1</ul>`
  );
  text = text.replace(/<\/ul>\s*<ul[^>]*>/g, "");

  // code blocks
  text = text.replace(/```([\s\S]*?)```/g,
    `<pre style="background:#1e1e2e;color:#cdd6f4;padding:14px;border-radius:10px;overflow:auto;font-size:12.5px;line-height:1.6;margin-top:10px;margin-bottom:10px;border-left:3px solid #4a6cf7;"><code>$1</code></pre>`
  );

  // line breaks
  text = text.replace(/\n/g, "<br>");

  return text;
}


// ================== ADD MESSAGE ==================
function addMessage(html, user = false) {

  let row = document.createElement("div");
  row.style.cssText = "display:flex;flex-direction:column;margin-bottom:14px;animation:fadeIn .3s ease;";

  if (user) {
    // ---- USER BUBBLE ----
    row.style.alignItems = "flex-end";

    let label = document.createElement("div");
    label.style.cssText = "font-size:11px;font-weight:600;color:#6b7fcc;margin-bottom:4px;padding-right:4px;letter-spacing:.4px;text-transform:uppercase;";
    label.innerHTML = "You";
    row.appendChild(label);

    let bubble = document.createElement("div");
    Object.assign(bubble.style, {
      maxWidth: "78%",
      background: "linear-gradient(135deg,#4f6df5,#6d88ff)",
      color: "#fff",
      padding: "11px 16px",
      borderRadius: "18px 18px 4px 18px",
      fontSize: "14px",
      lineHeight: "1.6",
      wordBreak: "break-word",
      boxShadow: "0 4px 14px rgba(79,109,245,.28)",
      fontWeight: "500"
    });
    bubble.innerHTML = html;
    row.appendChild(bubble);

  } else {
    // ---- BOT BUBBLE ----
    row.style.alignItems = "flex-start";

    let label = document.createElement("div");
    label.style.cssText = "font-size:11px;font-weight:600;color:#4a6cf7;margin-bottom:4px;padding-left:2px;letter-spacing:.4px;text-transform:uppercase;display:flex;align-items:center;gap:5px;";
    label.innerHTML = `<span style="font-size:13px;">👩‍💻</span> ${chatbotName}`;
    row.appendChild(label);

    let bubble = document.createElement("div");
    Object.assign(bubble.style, {
      width: "100%",
      background: "#ffffff",
      border: "1px solid #e2e8ff",
      borderRadius: "4px 18px 18px 18px",
      padding: "13px 36px 13px 15px",
      fontSize: "14px",
      lineHeight: "1.7",
      color: "#2d2d2d",
      position: "relative",
      wordBreak: "break-word",
      boxShadow: "0 2px 10px rgba(74,108,247,.07)"
    });
    bubble.innerHTML = html;

    // copy button
    let copy = document.createElement("span");
    copy.innerHTML = `<i class="fa-solid fa-copy"></i>`;
    Object.assign(copy.style, {
      position: "absolute", top: "10px", right: "10px",
      fontSize: "14px", cursor: "pointer",
      opacity: "0", transition: "0.2s", color: "#666"
    });
    bubble.onmouseenter = () => copy.style.opacity = "1";
    bubble.onmouseleave = () => copy.style.opacity = "0";
    copy.onclick = async function(e) {
      e.stopPropagation();
      await navigator.clipboard.writeText(bubble.innerText.trim());
      copy.innerHTML = `<i class="fa-solid fa-check"></i>`;
      setTimeout(() => { copy.innerHTML = `<i class="fa-solid fa-copy"></i>`; }, 1200);
    };
    bubble.appendChild(copy);
    row.appendChild(bubble);
  }

  chatArea.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
}


// ================== TOGGLE ==================
chatIcon.onclick = function() {
  outerWrapper.style.display = "flex";
  chatIcon.style.display = "none";
  setBotStatus("online");
  if (chatArea.innerHTML.trim() === "") {
    addMessage("👋 Hello, How can I help you today?", false);
  }
};


// ================== CLOSE / REFRESH ==================
document.addEventListener("click", function(e) {

  if (e.target.id === "closeChat" || e.target.closest && e.target.closest("#closeChat")) {
    outerWrapper.style.display = "none";
    chatIcon.style.display = "flex";
    setBotStatus("away");
  }

  if (e.target.id === "refreshChat" || e.target.closest && e.target.closest("#refreshChat")) {
    chatArea.innerHTML = "";
    addMessage("👋 New chat started. How can I help you?", false);
  }

});


// ================== SEND MESSAGE ==================
function sendMessage() {

  let message = input.value.trim();
  if (message === "") return;

  addMessage(message, true);
  setBotStatus("thinking");
  input.value = "";

  // typing indicator
  chatArea.innerHTML += `
    <div id="typing" class="typingWrap">
      <div class="typingBubble">
        <span class="typingText">Thinking...</span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  `;
  chatArea.scrollTop = chatArea.scrollHeight;

  fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: message, agent_id: agent_id })
  })
    .then(res => res.json())
    .then(data => {
      let typing = document.getElementById("typing");
      if (typing) typing.remove();
      setBotStatus("online");
      addMessage(formatResponse(data.response), false);
    })
    .catch(() => {
      let typing = document.getElementById("typing");
      if (typing) typing.remove();
      setBotStatus("online");
      addMessage("⚠ Error generating response", false);
    });
}


// ================== EVENTS ==================
sendBtn.onclick = sendMessage;

input.addEventListener("keypress", function(e) {
  if (e.key === "Enter") sendMessage();
});













// // ================== GET PARAMS ==================
// const params = new URLSearchParams(document.currentScript.src.split("?")[1]);
// const agent_id = params.get("agent_id");

// const fa = document.createElement("link");
// fa.rel = "stylesheet";
// fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
// document.head.appendChild(fa);

// // ✅ chatbot name from backend OR fallback
// let chatbotName = params.get("name") || "AI Assistant";


// // ================== GLOBAL STYLE ==================
// let globalStyle=document.createElement("style");

// globalStyle.innerHTML=`

// .typingWrap{
// display:flex;
// align-items:center;
// gap:10px;
// margin-bottom:18px;
// animation:fadeIn .3s ease;
// }

// .typingBubble{
// background:#ffffff;
// padding:14px 18px;
// border-radius:18px;
// display:flex;
// align-items:center;
// gap:6px;
// box-shadow:0 4px 15px rgba(0,0,0,.08);
// }

// .typingText{
// font-size:14px;
// color:#888;
// margin-right:5px;
// }

// .dot{
// width:8px;
// height:8px;
// border-radius:50%;
// background:#4f6df5;
// animation:bounce 1.3s infinite ease-in-out;
// }

// .dot:nth-child(2){
// animation-delay:.2s;
// }

// .dot:nth-child(3){
// animation-delay:.4s;
// }

// @keyframes bounce{
// 0%,80%,100%{
// transform:scale(.5);
// opacity:.4;
// }
// 40%{
// transform:scale(1);
// opacity:1;
// }
// }

// @keyframes fadeIn{
// from{
// opacity:0;
// transform:translateY(5px);
// }
// to{
// opacity:1;
// transform:none;
// }
// }

// `;

// document.head.appendChild(globalStyle);


// // ================== CHAT ICON ==================

// let chatIcon = document.createElement("div");

// chatIcon.innerHTML=`
// <div class="botAvatar">
//    <span class="botEmoji">👩‍💻</span>
//    <span class="statusDot"></span>
// </div>
// `;


// // animation styles
// let avatarStyle=document.createElement("style");
// avatarStyle.innerHTML=`

// .botAvatar{
// position:relative;
// width:60px;
// height:60px;
// display:flex;
// align-items:center;
// justify-content:center;
// border-radius:50%;
// background:linear-gradient(135deg,#4a6cf7,#6f8cff);
// box-shadow:0 10px 25px rgba(0,0,0,.25);
// animation:pulseBot 2.5s infinite;
// }

// .botEmoji{
// font-size:30px;
// animation:blinkBot 4s infinite;
// transform-origin:center;
// }

// /* live status green dot */
// .statusDot{
// position:absolute;
// right:10px;
// bottom:10px;
// width:11px;
// height:11px;
// background:#00d26a;
// border-radius:50%;
// box-shadow:0 0 0 rgba(0,210,106,.6);
// animation:livePing 1.8s infinite;
// }

// /* pulse glow */
// @keyframes pulseBot{
// 0%{
// box-shadow:0 0 0 0 rgba(79,109,245,.4);
// transform:scale(1);
// }
// 50%{
// transform:scale(1.05);
// }
// 70%{
// box-shadow:0 0 0 15px rgba(79,109,245,0);
// }
// 100%{
// transform:scale(1);
// }
// }

// /* fake blinking */
// @keyframes blinkBot{
// 0%,45%,48%,100%{
// transform:scaleY(1);
// }
// 46%,47%{
// transform:scaleY(.08);
// }
// }

// /* live ping dot */
// @keyframes livePing{
// 0%{
// box-shadow:0 0 0 0 rgba(0,210,106,.6);
// }
// 70%{
// box-shadow:0 0 0 10px rgba(0,210,106,0);
// }
// 100%{
// box-shadow:0 0 0 0 rgba(0,210,106,0);
// }
// }
// `;

// document.head.appendChild(avatarStyle);


// Object.assign(chatIcon.style,{
// position:"fixed",
// bottom:"20px",
// right:"20px",
// cursor:"pointer",
// zIndex:"999999",
// transition:".3s"
// });

// chatIcon.onmouseenter=()=>{
// chatIcon.style.transform="translateY(-4px) scale(1.05)";
// };

// chatIcon.onmouseleave=()=>{
// chatIcon.style.transform="scale(1)";
// };

// document.body.appendChild(chatIcon);



// // ================== CONTAINER ==================
// let container = document.createElement("div");

// Object.assign(container.style, {
//     position: "fixed",
//     bottom: "90px",
//     right: "20px",
//     width: "400px",
//     height: "500px",
//     maxHeight: "80vh",
//     background: "white",
//     borderRadius: "15px",
//     boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
//     display: "none",
//     flexDirection: "column",
//     overflow: "hidden",
//     fontFamily: "'Inter', 'Segoe UI', sans-serif",
//     zIndex: "999999"
// });

// document.body.appendChild(container);


// // ================== MOBILE ==================
// if(window.innerWidth < 500){
//     container.style.width = "90%";
//     container.style.right = "5%";
// }



// // ================== HEADER ==================
// function setBotStatus(mode){

// let dot=document.getElementById("onlineDot");
// let txt=document.getElementById("statusText");

// if(!dot || !txt) return;

// if(mode==="online"){
// dot.style.background="#00d26a";
// dot.style.boxShadow="0 0 8px rgba(0,210,106,.6)";
// dot.style.animation="livePing 1.8s infinite";
// txt.innerHTML="Online";
// }

// if(mode==="thinking"){
// dot.style.background="#00d26a";
// dot.style.boxShadow="0 0 12px rgba(0,210,106,.9)";
// txt.innerHTML="Typing...";
// }

// if(mode==="away"){
// dot.style.background="#ffcc00";
// dot.style.boxShadow="0 0 8px rgba(255,204,0,.7)";
// dot.style.animation="none";
// txt.innerHTML="Away";
// }

// }

// let header = document.createElement("div");

// Object.assign(header.style,{
// background:"linear-gradient(135deg,#4a6cf7,#6f8cff)",
// color:"white",
// padding:"12px 14px",
// display:"flex",
// justifyContent:"space-between",
// alignItems:"center",
// fontWeight:"600"
// });

// header.innerHTML=`

// <div style="
// display:flex;
// align-items:center;
// gap:10px;
// font-size:16px;
// ">
// 👩‍💻 ${chatbotName}

// <div style="
// display:flex;
// align-items:center;
// gap:6px;
// font-size:12px;
// font-weight:500;
// ">

// <span id="onlineDot"
// style="
// width:10px;
// height:10px;
// background:#00d26a;
// border-radius:50%;
// display:inline-block;
// box-shadow:0 0 8px rgba(0,210,106,.6);
// animation:livePing 1.8s infinite;
// ">
// </span>

// <span id="statusText">Online</span>

// </div>

// </div>

// <div style="
// display:flex;
// align-items:center;
// gap:14px;
// ">

// <span id="refreshChat"
// title="New Chat"
// style="
// cursor:pointer;
// font-size:18px;
// ">
// ↻
// </span>

// <span id="closeChat"
// title="Close"
// style="
// cursor:pointer;
// font-size:20px;
// ">
// ✖
// </span>

// </div>

// `;
// container.appendChild(header);



// // ================== CHAT AREA ==================
// let chatArea = document.createElement("div");

// Object.assign(chatArea.style, {
//     flex: "1",
//     padding: "14px 12px",
//     overflowY: "auto",
//     background: "#f0f2f8",
//     fontSize: "14px",
//     lineHeight: "1.5"
// });

// container.appendChild(chatArea);


// // ================== INPUT AREA ==================
// let inputArea = document.createElement("div");

// Object.assign(inputArea.style, {
//     display: "flex",
//     padding: "10px",
//     borderTop: "1px solid #eee",
//     background: "#fff"
// });

// container.appendChild(inputArea);


// // ================== INPUT ==================
// let input = document.createElement("input");

// Object.assign(input.style, {
//     flex: "1",
//     border: "1px solid #ddd",
//     borderRadius: "20px",
//     padding: "10px",
//     outline: "none"
// });

// input.placeholder = "Type your message...";

// inputArea.appendChild(input);


// // ================== BUTTON ==================
// let sendBtn = document.createElement("button");

// sendBtn.innerHTML = "➤";

// Object.assign(sendBtn.style, {
//     marginLeft: "8px",
//     border: "none",
//     background: "linear-gradient(135deg,#4a6cf7,#6f8cff)",
//     color: "white",
//     borderRadius: "50%",
//     width: "40px",
//     height: "40px",
//     cursor: "pointer"
// });

// inputArea.appendChild(sendBtn);


// // ================== TOGGLE ==================
// chatIcon.onclick = function(){

//     container.style.display = "flex";
//     chatIcon.style.display = "none";
//     isOpen = true;

//     setBotStatus("online");

//     // ✅ SHOW WELCOME ONLY FIRST TIME
//     if(chatArea.innerHTML.trim() === ""){
//         addMessage(
//         "👋 Hello, How can I help you today?",
//         false
//         );
//     }
// };



// // ================== CLOSE ==================
// document.addEventListener("click",function(e){
//     if(e.target.id === "closeChat"){
//         container.style.display = "none";
//         chatIcon.style.display = "flex";
//         isOpen = false;

//         setBotStatus("away");
//     }
//     if(e.target.id==="refreshChat"){
//     chatArea.innerHTML="";

//     addMessage(
//     "👋 New chat started. How can I help you?",
//     false
//     );
//     }

// });


// // ================== FORMAT RESPONSE ==================

// function formatResponse(text){

// // =========================
// // MARKDOWN HEADINGS
// // =========================

// // ### Heading
// text = text.replace(
// /^### (.*$)/gim,
// `<div style="
// font-size:15px;
// font-weight:700;
// margin-top:14px;
// margin-bottom:6px;
// color:#1a1a2e;
// padding-bottom:5px;
// border-bottom:2px solid #e2e8ff;
// ">$1</div>`
// );

// // ## Heading
// text = text.replace(
// /^## (.*$)/gim,
// `<div style="
// font-size:14px;
// font-weight:700;
// margin-top:12px;
// margin-bottom:5px;
// color:#1a1a2e;
// ">$1</div>`
// );

// // **bold**
// text = text.replace(
// /\*\*(.*?)\*\*/g,
// `<strong style="font-weight:700;color:#1a1a2e;">$1</strong>`
// );


// // =========================
// // BULLET POINTS
// // =========================

// text = text.replace(
// /^(?:•|-|\*)\s(.+)$/gm,
// `<li style="
// margin-bottom:6px;
// line-height:1.65;
// color:#2d2d2d;
// ">$1</li>`
// );


// // =========================
// // NUMBERED LIST
// // =========================

// text = text.replace(
// /^\d+\.\s(.+)$/gm,
// `<li style="
// margin-bottom:6px;
// line-height:1.65;
// color:#2d2d2d;
// ">$1</li>`
// );


// // =========================
// // WRAP LIST ITEMS
// // =========================

// text = text.replace(
// /(<li.*?>.*?<\/li>)/gs,
// `<ul style="
// padding-left:20px;
// margin-top:8px;
// margin-bottom:8px;
// ">$1</ul>`
// );

// // merge multiple ul
// text = text.replace(
// /<\/ul>\s*<ul[^>]*>/g,
// ''
// );


// // =========================
// // CODE BLOCKS
// // =========================

// text = text.replace(
// /```([\s\S]*?)```/g,
// `<pre style="
// background:#1e1e2e;
// color:#cdd6f4;
// padding:14px;
// border-radius:10px;
// overflow:auto;
// font-size:12.5px;
// line-height:1.6;
// margin-top:10px;
// margin-bottom:10px;
// border-left:3px solid #4a6cf7;
// "><code>$1</code></pre>`
// );


// // =========================
// // LINE BREAKS
// // =========================

// text = text.replace(/\n/g,"<br>");

// return text;

// }



// // ================== TYPE EFFECT ==================
// function typeHTML(element, html, speed = 10){

//     let temp = document.createElement("div");
//     temp.innerHTML = html;

//     let text = temp.innerText;

//     let i = 0;

//     function typing(){
//         if(i < text.length){
//             element.innerText += text.charAt(i);
//             i++;
//             setTimeout(typing, speed);
//         } else {
//             element.innerHTML = html;
//         }
//     }

//     typing();
// }


// // ================== ADD MESSAGE ==================
// function addMessage(html,user=false){

// let row=document.createElement("div");

// row.style.display="flex";
// row.style.flexDirection="column";
// row.style.marginBottom="14px";
// row.style.animation="fadeIn .3s ease";


// // ================= USER MESSAGE =================
// if(user){

// row.style.alignItems="flex-end";

// // "You" label
// let label=document.createElement("div");
// label.style.cssText=`
// font-size:11px;
// font-weight:600;
// color:#6b7fcc;
// margin-bottom:4px;
// padding-right:6px;
// letter-spacing:.5px;
// text-transform:uppercase;
// `;
// label.innerHTML="You";
// row.appendChild(label);

// let bubble=document.createElement("div");

// Object.assign(bubble.style,{
// maxWidth:"78%",
// background:"linear-gradient(135deg,#4f6df5,#6d88ff)",
// color:"#fff",
// padding:"12px 16px",
// borderRadius:"18px 18px 4px 18px",
// fontSize:"14px",
// lineHeight:"1.6",
// wordBreak:"break-word",
// boxShadow:"0 4px 14px rgba(79,109,245,.3)",
// fontWeight:"500"
// });

// bubble.innerHTML=html;
// row.appendChild(bubble);

// }


// // ================= BOT MESSAGE =================
// else{

// row.style.alignItems="flex-start";

// // Bot name label
// let label=document.createElement("div");
// label.style.cssText=`
// font-size:11px;
// font-weight:600;
// color:#4a6cf7;
// margin-bottom:4px;
// padding-left:4px;
// letter-spacing:.5px;
// text-transform:uppercase;
// display:flex;
// align-items:center;
// gap:5px;
// `;
// label.innerHTML=`<span style="font-size:13px;">👩‍💻</span> ${chatbotName}`;
// row.appendChild(label);

// let bubble=document.createElement("div");

// Object.assign(bubble.style,{
// width:"100%",
// background:"#ffffff",
// border:"1px solid #e2e8ff",
// borderRadius:"4px 18px 18px 18px",
// padding:"14px 38px 14px 16px",
// fontSize:"14px",
// lineHeight:"1.7",
// color:"#2d2d2d",
// position:"relative",
// wordBreak:"break-word",
// boxShadow:"0 2px 10px rgba(74,108,247,.08)"
// });

// bubble.innerHTML=html;


// // ================= COPY BUTTON =================
// let copy=document.createElement("span");

// copy.innerHTML=`<i class="fa-solid fa-copy"></i>`;

// Object.assign(copy.style,{
// position:"absolute",
// top:"10px",
// right:"10px",
// fontSize:"14px",
// cursor:"pointer",
// opacity:"0",
// transition:"0.2s",
// color:"#666"
// });

// bubble.onmouseenter=()=>{
// copy.style.opacity="1";
// };

// bubble.onmouseleave=()=>{
// copy.style.opacity="0";
// };

// copy.onclick=async function(e){

// e.stopPropagation();

// let txt=bubble.innerText.trim();

// await navigator.clipboard.writeText(txt);

// copy.innerHTML=`<i class="fa-solid fa-check"></i>`;

// setTimeout(()=>{
// copy.innerHTML=`<i class="fa-solid fa-copy"></i>`;
// },1200);

// };

// bubble.appendChild(copy);

// row.appendChild(bubble);

// }


// chatArea.appendChild(row);

// chatArea.scrollTop=chatArea.scrollHeight;

// }




// // ================== SEND MESSAGE ==================
// function sendMessage(){

// let message=input.value.trim();

// if(message==="") return;


// // user message (use addMessage)
// addMessage(message,true);

// setBotStatus("thinking");

// input.value="";


// // typing indicator
// // ================== THINKING UI ==================
// chatArea.innerHTML += `

// <div id="typing" class="typingWrap">

// <div class="typingBubble">

// <span class="typingText">
// Thinking...
// </span>

// <span class="dot"></span>
// <span class="dot"></span>
// <span class="dot"></span>

// </div>

// </div>

// `;


// chatArea.scrollTop=chatArea.scrollHeight;


// fetch("http://localhost:5000/chat",{
// method:"POST",
// headers:{
// "Content-Type":"application/json"
// },
// body:JSON.stringify({
// message:message,
// agent_id:agent_id
// })
// })
// .then(res=>res.json())
// .then(data=>{

// let typing=document.getElementById("typing");
// if(typing) typing.remove();

// let formatted=formatResponse(data.response);

// setBotStatus("online");
// // BOT MESSAGE with COPY BUTTON now works
// addMessage(formatted,false);

// })
// .catch(()=>{

// let typing=document.getElementById("typing");
// if(typing) typing.remove();

// setBotStatus("online");

// addMessage("⚠ Error generating response",false);

// });

// }

// // ================== EVENTS ==================
// sendBtn.onclick = sendMessage;

// input.addEventListener("keypress",function(e){
//     if(e.key === "Enter"){
//         sendMessage();
//     }
// });









































// // ================== GET PARAMS ==================
// const params = new URLSearchParams(document.currentScript.src.split("?")[1]);
// const agent_id = params.get("agent_id");

// const fa = document.createElement("link");
// fa.rel = "stylesheet";
// fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
// document.head.appendChild(fa);

// // ✅ chatbot name from backend OR fallback
// let chatbotName = params.get("name") || "AI Assistant";


// // ================== GLOBAL STYLE ==================
// let globalStyle=document.createElement("style");

// globalStyle.innerHTML=`

// .typingWrap{
// display:flex;
// align-items:center;
// gap:10px;
// margin-bottom:18px;
// animation:fadeIn .3s ease;
// }

// .typingBubble{
// background:#ffffff;
// padding:14px 18px;
// border-radius:18px;
// display:flex;
// align-items:center;
// gap:6px;
// box-shadow:0 4px 15px rgba(0,0,0,.08);
// }

// .typingText{
// font-size:14px;
// color:#888;
// margin-right:5px;
// }

// .dot{
// width:8px;
// height:8px;
// border-radius:50%;
// background:#4f6df5;
// animation:bounce 1.3s infinite ease-in-out;
// }

// .dot:nth-child(2){
// animation-delay:.2s;
// }

// .dot:nth-child(3){
// animation-delay:.4s;
// }

// @keyframes bounce{
// 0%,80%,100%{
// transform:scale(.5);
// opacity:.4;
// }
// 40%{
// transform:scale(1);
// opacity:1;
// }
// }

// @keyframes fadeIn{
// from{
// opacity:0;
// transform:translateY(5px);
// }
// to{
// opacity:1;
// transform:none;
// }
// }

// `;

// document.head.appendChild(globalStyle);


// // ================== CHAT ICON ==================

// let chatIcon = document.createElement("div");

// chatIcon.innerHTML=`
// <div class="botAvatar">
//    <span class="botEmoji">👩‍💻</span>
//    <span class="statusDot"></span>
// </div>
// `;


// // animation styles
// let avatarStyle=document.createElement("style");
// avatarStyle.innerHTML=`

// .botAvatar{
// position:relative;
// width:60px;
// height:60px;
// display:flex;
// align-items:center;
// justify-content:center;
// border-radius:50%;
// background:linear-gradient(135deg,#4a6cf7,#6f8cff);
// box-shadow:0 10px 25px rgba(0,0,0,.25);
// animation:pulseBot 2.5s infinite;
// }

// .botEmoji{
// font-size:30px;
// animation:blinkBot 4s infinite;
// transform-origin:center;
// }

// /* live status green dot */
// .statusDot{
// position:absolute;
// right:10px;
// bottom:10px;
// width:11px;
// height:11px;
// background:#00d26a;
// border-radius:50%;
// box-shadow:0 0 0 rgba(0,210,106,.6);
// animation:livePing 1.8s infinite;
// }

// /* pulse glow */
// @keyframes pulseBot{
// 0%{
// box-shadow:0 0 0 0 rgba(79,109,245,.4);
// transform:scale(1);
// }
// 50%{
// transform:scale(1.05);
// }
// 70%{
// box-shadow:0 0 0 15px rgba(79,109,245,0);
// }
// 100%{
// transform:scale(1);
// }
// }

// /* fake blinking */
// @keyframes blinkBot{
// 0%,45%,48%,100%{
// transform:scaleY(1);
// }
// 46%,47%{
// transform:scaleY(.08);
// }
// }

// /* live ping dot */
// @keyframes livePing{
// 0%{
// box-shadow:0 0 0 0 rgba(0,210,106,.6);
// }
// 70%{
// box-shadow:0 0 0 10px rgba(0,210,106,0);
// }
// 100%{
// box-shadow:0 0 0 0 rgba(0,210,106,0);
// }
// }
// `;

// document.head.appendChild(avatarStyle);


// Object.assign(chatIcon.style,{
// position:"fixed",
// bottom:"20px",
// right:"20px",
// cursor:"pointer",
// zIndex:"999999",
// transition:".3s"
// });

// chatIcon.onmouseenter=()=>{
// chatIcon.style.transform="translateY(-4px) scale(1.05)";
// };

// chatIcon.onmouseleave=()=>{
// chatIcon.style.transform="scale(1)";
// };

// document.body.appendChild(chatIcon);



// // ================== CONTAINER ==================
// let container = document.createElement("div");

// Object.assign(container.style, {
//     position: "fixed",
//     bottom: "90px",
//     right: "20px",
//     width: "400px",
//     height: "500px",
//     maxHeight: "80vh",
//     background: "white",
//     borderRadius: "15px",
//     boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
//     display: "none",
//     flexDirection: "column",
//     overflow: "hidden",
//     fontFamily: "'Inter', 'Segoe UI', sans-serif",
//     zIndex: "999999"
// });

// document.body.appendChild(container);


// // ================== MOBILE ==================
// if(window.innerWidth < 500){
//     container.style.width = "90%";
//     container.style.right = "5%";
// }



// // ================== HEADER ==================
// function setBotStatus(mode){

// let dot=document.getElementById("onlineDot");
// let txt=document.getElementById("statusText");

// if(!dot || !txt) return;

// if(mode==="online"){
// dot.style.background="#00d26a";
// dot.style.boxShadow="0 0 8px rgba(0,210,106,.6)";
// dot.style.animation="livePing 1.8s infinite";
// txt.innerHTML="Online";
// }

// if(mode==="thinking"){
// dot.style.background="#00d26a";
// dot.style.boxShadow="0 0 12px rgba(0,210,106,.9)";
// txt.innerHTML="Typing...";
// }

// if(mode==="away"){
// dot.style.background="#ffcc00";
// dot.style.boxShadow="0 0 8px rgba(255,204,0,.7)";
// dot.style.animation="none";
// txt.innerHTML="Away";
// }

// }

// let header = document.createElement("div");

// Object.assign(header.style,{
// background:"linear-gradient(135deg,#4a6cf7,#6f8cff)",
// color:"white",
// padding:"12px 14px",
// display:"flex",
// justifyContent:"space-between",
// alignItems:"center",
// fontWeight:"600"
// });

// header.innerHTML=`

// <div style="
// display:flex;
// align-items:center;
// gap:10px;
// font-size:16px;
// ">
// 👩‍💻 ${chatbotName}

// <div style="
// display:flex;
// align-items:center;
// gap:6px;
// font-size:12px;
// font-weight:500;
// ">

// <span id="onlineDot"
// style="
// width:10px;
// height:10px;
// background:#00d26a;
// border-radius:50%;
// display:inline-block;
// box-shadow:0 0 8px rgba(0,210,106,.6);
// animation:livePing 1.8s infinite;
// ">
// </span>

// <span id="statusText">Online</span>

// </div>

// </div>

// <div style="
// display:flex;
// align-items:center;
// gap:14px;
// ">

// <span id="refreshChat"
// title="New Chat"
// style="
// cursor:pointer;
// font-size:18px;
// ">
// ↻
// </span>

// <span id="closeChat"
// title="Close"
// style="
// cursor:pointer;
// font-size:20px;
// ">
// ✖
// </span>

// </div>

// `;
// container.appendChild(header);



// // ================== CHAT AREA ==================
// let chatArea = document.createElement("div");

// Object.assign(chatArea.style, {
//     flex: "1",
//     padding: "12px",
//     overflowY: "auto",
//     background: "#f7f7f8",
//     // background: "#f4f6fb",
//     fontSize: "14px",
//     lineHeight: "1.5"
// });

// container.appendChild(chatArea);


// // ================== INPUT AREA ==================
// let inputArea = document.createElement("div");

// Object.assign(inputArea.style, {
//     display: "flex",
//     padding: "10px",
//     borderTop: "1px solid #eee",
//     background: "#fff"
// });

// container.appendChild(inputArea);


// // ================== INPUT ==================
// let input = document.createElement("input");

// Object.assign(input.style, {
//     flex: "1",
//     border: "1px solid #ddd",
//     borderRadius: "20px",
//     padding: "10px",
//     outline: "none"
// });

// input.placeholder = "Type your message...";

// inputArea.appendChild(input);


// // ================== BUTTON ==================
// let sendBtn = document.createElement("button");

// sendBtn.innerHTML = "➤";

// Object.assign(sendBtn.style, {
//     marginLeft: "8px",
//     border: "none",
//     background: "linear-gradient(135deg,#4a6cf7,#6f8cff)",
//     color: "white",
//     borderRadius: "50%",
//     width: "40px",
//     height: "40px",
//     cursor: "pointer"
// });

// inputArea.appendChild(sendBtn);


// // ================== TOGGLE ==================
// chatIcon.onclick = function(){

//     container.style.display = "flex";
//     chatIcon.style.display = "none";
//     isOpen = true;

//     setBotStatus("online");

//     // ✅ SHOW WELCOME ONLY FIRST TIME
//     if(chatArea.innerHTML.trim() === ""){
//         addMessage(
//         "👋 Hello, How can I help you today?",
//         false
//         );
//     }
// };



// // ================== CLOSE ==================
// document.addEventListener("click",function(e){
//     if(e.target.id === "closeChat"){
//         container.style.display = "none";
//         chatIcon.style.display = "flex";
//         isOpen = false;

//         setBotStatus("away");
//     }
//     if(e.target.id==="refreshChat"){
//     chatArea.innerHTML="";

//     addMessage(
//     "👋 New chat started. How can I help you?",
//     false
//     );
//     }

// });


// // ================== FORMAT RESPONSE ==================

// function formatResponse(text){

// // =========================
// // MARKDOWN HEADINGS
// // =========================

// // ### Heading
// text = text.replace(
// /^### (.*$)/gim,
// `
// <div style="
// font-size:20px;
// font-weight:700;
// margin-top:16px;
// margin-bottom:10px;
// color:#111;
// ">
// $1
// </div>
// `
// );

// // ## Heading
// text = text.replace(
// /^## (.*$)/gim,
// `
// <div style="
// font-size:18px;
// font-weight:700;
// margin-top:14px;
// margin-bottom:8px;
// color:#111;
// ">
// $1
// </div>
// `
// );

// // **bold**
// text = text.replace(
// /\*\*(.*?)\*\*/g,
// `<strong>$1</strong>`
// );


// // =========================
// // BULLET POINTS
// // supports:
// // • item
// // - item
// // * item
// // =========================

// text = text.replace(
// /^(?:•|-|\*)\s(.+)$/gm,
// `<li style="
// margin-bottom:8px;
// line-height:1.7;
// ">$1</li>`
// );


// // =========================
// // NUMBERED LIST
// // =========================

// text = text.replace(
// /^\d+\.\s(.+)$/gm,
// `<li style="
// margin-bottom:8px;
// line-height:1.7;
// ">$1</li>`
// );


// // =========================
// // WRAP LIST ITEMS
// // =========================

// text = text.replace(
// /(<li.*?>.*?<\/li>)/gs,
// `<ul style="
// padding-left:22px;
// margin-top:10px;
// margin-bottom:10px;
// ">$1</ul>`
// );


// // merge multiple ul
// text = text.replace(
// /<\/ul>\s*<ul[^>]*>/g,
// ''
// );


// // =========================
// // CODE BLOCKS
// // =========================

// text = text.replace(
// /```([\s\S]*?)```/g,
// `
// <pre style="
// background:#111;
// color:#fff;
// padding:14px;
// border-radius:10px;
// overflow:auto;
// font-size:13px;
// line-height:1.6;
// margin-top:10px;
// margin-bottom:10px;
// "><code>$1</code></pre>
// `
// );


// // =========================
// // LINE BREAKS
// // =========================

// text = text.replace(/\n/g,"<br>");

// return text;

// }



// // ================== TYPE EFFECT ==================
// function typeHTML(element, html, speed = 10){

//     let temp = document.createElement("div");
//     temp.innerHTML = html;

//     let text = temp.innerText; // plain text for typing

//     let i = 0;

//     function typing(){
//         if(i < text.length){
//             element.innerText += text.charAt(i);
//             i++;
//             setTimeout(typing, speed);
//         } else {
//             // after typing → render HTML properly
//             element.innerHTML = html;
//         }
//     }

//     typing();
// }

// // ========== Add Message==========
// // ================== ADD MESSAGE ==================
// function addMessage(html,user=false){

// let row=document.createElement("div");

// row.style.display="flex";
// row.style.flexDirection="column";
// row.style.marginBottom="22px";


// // ================= USER MESSAGE =================
// if(user){

// row.style.alignItems="flex-end";

// let bubble=document.createElement("div");

// Object.assign(bubble.style,{

// maxWidth:"78%",
// background:"linear-gradient(135deg,#4f6df5,#6d88ff)",
// color:"#fff",
// padding:"14px 18px",
// borderRadius:"18px",
// fontSize:"15px",
// lineHeight:"1.6",
// wordBreak:"break-word",
// boxShadow:"0 4px 12px rgba(0,0,0,.08)"

// });

// bubble.innerHTML=html;

// row.appendChild(bubble);

// }


// // ================= BOT MESSAGE =================
// else{

// row.style.alignItems="stretch";

// let bubble=document.createElement("div");

// Object.assign(bubble.style,{

// width:"100%",
// padding:"2px 32px 2px 2px",
// // padding:"8px 40px 8px 8px",
// fontSize:"16px",
// lineHeight:"1.6",
// // lineHeight:"1.9",
// color:"#111",
// position:"relative",
// wordBreak:"break-word"

// });

// bubble.innerHTML=html;


// // ================= COPY BUTTON =================
// let copy=document.createElement("span");

// copy.innerHTML=`<i class="fa-solid fa-copy"></i>`;

// Object.assign(copy.style,{
// position:"absolute",
// top:"10px",
// right:"10px",
// fontSize:"14px",
// cursor:"pointer",
// opacity:"0",
// transition:"0.2s",
// color:"#666"
// });

// bubble.onmouseenter=()=>{
// copy.style.opacity="1";
// };

// bubble.onmouseleave=()=>{
// copy.style.opacity="0";
// };

// copy.onclick=async function(e){

// e.stopPropagation();

// let txt=bubble.innerText.trim();

// await navigator.clipboard.writeText(txt);

// copy.innerHTML=`<i class="fa-solid fa-check"></i>`;

// setTimeout(()=>{
// copy.innerHTML=`<i class="fa-solid fa-copy"></i>`;
// },1200);

// };

// bubble.appendChild(copy);

// row.appendChild(bubble);

// }


// chatArea.appendChild(row);

// chatArea.scrollTop=chatArea.scrollHeight;

// }




// // ================== SEND MESSAGE ==================
// function sendMessage(){

// let message=input.value.trim();

// if(message==="") return;


// // user message (use addMessage)
// addMessage(message,true);

// setBotStatus("thinking");

// input.value="";


// // typing indicator
// // ================== THINKING UI ==================
// chatArea.innerHTML += `

// <div id="typing" class="typingWrap">

// <div class="typingBubble">

// <span class="typingText">
// Thinking...
// </span>

// <span class="dot"></span>
// <span class="dot"></span>
// <span class="dot"></span>

// </div>

// </div>

// `;


// chatArea.scrollTop=chatArea.scrollHeight;


// fetch("http://localhost:5000/chat",{
// method:"POST",
// headers:{
// "Content-Type":"application/json"
// },
// body:JSON.stringify({
// message:message,
// agent_id:agent_id
// })
// })
// .then(res=>res.json())
// .then(data=>{

// let typing=document.getElementById("typing");
// if(typing) typing.remove();

// let formatted=formatResponse(data.response);

// setBotStatus("online");
// // BOT MESSAGE with COPY BUTTON now works
// addMessage(formatted,false);

// })
// .catch(()=>{

// let typing=document.getElementById("typing");
// if(typing) typing.remove();

// setBotStatus("online");

// addMessage("⚠ Error generating response",false);

// });

// }

// // ================== EVENTS ==================
// sendBtn.onclick = sendMessage;

// input.addEventListener("keypress",function(e){
//     if(e.key === "Enter"){
//         sendMessage();
//     }
// });







































