// ================== GLOBAL ==================
let selectedFiles = [];
let chatbotName = "";
let agentID = "";
let botNamed = false;
let botBuilt = false;
let botTrained = false;


// ================== TOAST ==================
function showToast(message, type = "success"){
    let container = document.getElementById("toast-container");

    let toast = document.createElement("div");
    toast.classList.add("toast");
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


// ================== TAB ==================
function openTab(evt, tabName){
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}


// ================== BOT NAME ==================
function saveBotName(){
    chatbotName = document.getElementById("botName").value;

    if(chatbotName.trim() === ""){
        showToast("Enter chatbot name");
        return;
    }

    botNamed = true;

    document.getElementById("botSaved").innerText =
        "Chatbot Name Saved: " + chatbotName + " ✅";

    document.getElementById("buildTitle").innerText =
        chatbotName + " - Create AI Agent";
}


// ================== BUILD ==================
function createAgent(){

    if(!botNamed){
        showToast("Give chatbot name first");
        return;
    }

    let prompt = document.getElementById("prompt").value;

    fetch("/build",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            prompt:prompt,
            name:chatbotName
        })
    })
    .then(res=>res.json())
    .then(data=>{

        if(data.error){
            showToast(data.error);
            return;
        }

        agentID = data.agent_id;
        botBuilt = true;

        showToast("Agent Created 🚀");

    });
}


// ================== FILE LIST ==================
function showFileList(){

    let fileInput = document.getElementById("file");
    let newFiles = Array.from(fileInput.files);

    if(newFiles.length === 0) return;

    newFiles.forEach(file => {

        // limit
        if(selectedFiles.length >= 5){
            showToast("Maximum 5 files allowed");
            return;
        }

        // avoid duplicate
        let exists = selectedFiles.some(f => f.name === file.name);

        if(!exists){
            selectedFiles.push(file);
        }
    });

    console.log("FILES ARRAY:", selectedFiles); // debug

    renderFileList();

    // VERY IMPORTANT
    fileInput.value = "";
}



// ================== RENDER FILE UI ==================
function renderFileList(){

    let list = document.getElementById("fileList");
    list.innerHTML = "";

    selectedFiles.forEach((file, index) => {

        let ext = file.name.split(".").pop().toLowerCase();

        let icon = "📄";
        if(ext === "pdf") icon = "📕";
        else if(["jpg","jpeg","png"].includes(ext)) icon = "🖼️";
        else if(["doc","docx"].includes(ext)) icon = "📘";
        else if(ext === "txt") icon = "📃";

        let size = (file.size / 1024).toFixed(1) + " KB";

        let li = document.createElement("li");
        li.className = "file-block";

        li.innerHTML = `
            <div class="file-top">
                <span class="file-icon">${icon}</span>
                <span class="file-name">${file.name}</span>
            </div>

            <div class="file-bottom">
                <span class="file-size">📦 ${size}</span>
                <button class="remove-btn" onclick="removeFile(${index})">
                    Remove
                </button>
            </div>
        `;

        list.appendChild(li);
    });
}




// ================== REMOVE FILE ==================
function removeFile(index){
    selectedFiles.splice(index,1);
    renderFileList();
}


//  TRAIN 
function trainAgent(){

    if(!botNamed){
        showToast("Please first give chatbot name");
        return;
    }

    if(!botBuilt){
        showToast("Please build the agent first");
        return;
    }

    let crawlURL = document.getElementById("crawl_url").value;

    let formData = new FormData();

    selectedFiles.forEach(file => {
        formData.append("files", file);
    });

    if(crawlURL){
        formData.append("crawl_url", crawlURL);
    }

    if(selectedFiles.length === 0 && !crawlURL){
        showToast("Upload file or enter crawler URL");
        return;
    }

    document.getElementById("loader").style.display = "block";

    fetch("/train",{
        method:"POST",
        body:formData
    })
    .then(async res => {

        let data = await res.json();

        // 🔥 HANDLE ERROR RESPONSE
        if(!res.ok){
            throw new Error(data.error || "Training failed");
        }

        return data;
    })
    .then(data => {

        document.getElementById("loader").style.display = "none";

        botTrained = true;

        showToast(`Training Completed 🚀 (${data.chunks} chunks)`, "success");

        selectedFiles = [];
        renderFileList();

        loadAgentDashboard();
    })
    .catch(err => {

        document.getElementById("loader").style.display = "none";

        console.error(err);

        showToast(err.message || "Training failed ❌", "error");
    });
}


// ================== ASK ==================
function askQuestion(){

    if(!botNamed || !botBuilt || !botTrained){
        showToast("Complete all steps first");
        return;
    }

    let question = document.getElementById("question").value;

    document.getElementById("answer").innerHTML = `
        <div class="typing">
            <span></span><span></span><span></span>
        </div>
    `;

    fetch("/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            message:question,
            agent_id:agentID
        })
    })
    .then(res=>res.json())
    .then(data=>{
        document.getElementById("answer").innerText = data.response;
    });
}

// load agent dashboard
function loadAgentDashboard(){

fetch("/get_agent_data")
.then(res => res.json())
.then(data => {

    let agentDiv = document.getElementById("agentDetails");
    let list = document.getElementById("trainingList");

    if(!agentDiv || !list) return;

    list.innerHTML = "";

    // ❌ No agent
    if(!data.agent){
        agentDiv.innerHTML = "<p>No agent created yet</p>";
        return;
    }

    // ✅ Restore state
    botBuilt = true;
    agentID = data.agent.id;
    chatbotName = data.agent.name;
    botNamed = true;

    // ✅ Show agent details
    agentDiv.innerHTML = `
        <div style="background:#f5f7ff;padding:15px;border-radius:10px;">
            <b>🤖 Name:</b> ${data.agent.name} <br>
            <b>🧠 Prompt:</b> ${data.agent.prompt}
            <br><br>

            <button class="action-btn" onclick="editPrompt()">✏️ Edit Prompt</button>
        </div>
    `;

    // ✅ Show training data
    data.training.forEach(item => {

        let li = document.createElement("li");

        let value = item.source_value || item.file_name;

        let icon = "📄";
        if(item.source_type === "crawler") icon = "🌐";
        if(item.source_type === "url") icon = "🔗";

        li.className = "training-item";

        li.innerHTML = `
            <div class="training-left">
                <span class="icon">${icon}</span>
                <span class="training-text">${value}</span>
            </div>

            <button class="delete-btn" onclick="deleteTraining(${item.id})">
                🗑️ Delete
            </button>
        `;


        list.appendChild(li);
    });

});
}

// Edit prompt function
function editPrompt(){

    let newPrompt = prompt("Enter new prompt");

    if(!newPrompt) return;

    fetch("/update_prompt",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            agent_id: agentID,
            prompt: newPrompt
        })
    })
    .then(res=>res.json())
    .then(()=>{
        showToast("Prompt updated ✅");
        loadAgentDashboard();
    });
}

// delete training function
function deleteTraining(id){

fetch(`/delete_training/${id}`,{
    method:"DELETE"
})
.then(res=>res.json())
.then(()=>{
    showToast("Deleted successfully");
    loadAgentDashboard();
});
}

// ================== EMBED ==================
function getEmbed(){

    if(!botTrained){
        showToast("Train chatbot first");
        return;
    }
    let safeName = encodeURIComponent(chatbotName); 
    let code = `<script src="http://localhost:5000/static/widget.js?agent_id=${agentID}&name=${safeName}"></script>`;

    document.getElementById("embed").innerText = code;
}

// LOAD DATA WHEN PAGE OPENS
window.onload = function(){
    loadAgentDashboard();
};


