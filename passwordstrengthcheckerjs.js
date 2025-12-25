const DB_NAME="autosaveDB",STORE="inputs";
let db;

indexedDB.open(DB_NAME,1).onupgradeneeded=e=>{
  db=e.target.result;
  db.createObjectStore(STORE,{keyPath:"id"});
};
indexedDB.open(DB_NAME,1).onsuccess=e=>{
  db=e.target.result;
  restoreInputs();
};

function saveInput(el){
  const tx=db.transaction(STORE,"readwrite");
  tx.objectStore(STORE).put({id:el.id,value:el.value});
}

function restoreInputs(){
  const tx=db.transaction(STORE,"readonly");
  const store=tx.objectStore(STORE);
  store.openCursor().onsuccess=e=>{
    const c=e.target.result;
    if(c){
      const el=document.getElementById(c.value.id);
      if(el) el.value=c.value.value;
      c.continue();
    }
  };
}

function isValidEmail(email){
  return /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z]{2,})+$/.test(email);
}

function clearDatabase(){
  const tx=db.transaction(STORE,"readwrite");
  const store=tx.objectStore(STORE);
  store.clear().onsuccess=()=>{
    document.querySelectorAll("input").forEach(i=>i.value="");
    const result=document.getElementById("result");
    if(result){
      result.style.color="#008800";
      result.textContent="All saved data cleared successfully.";
    }
  };
}

document.querySelectorAll("input").forEach(i=>{
  i.oncopy=i.oncut=i.onpaste=e=>e.preventDefault();
});

document.getElementById("username").addEventListener("input",e=>{
  e.target.value=e.target.value.replace(/[^A-Za-z]/g,"");
}); 

document.getElementById("email").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/[^a-zA-Z0-9@.]/g, "");
});

document.querySelectorAll("input").forEach(i=>{
  i.addEventListener("input",()=>saveInput(i));
});

  let generatedCode = "";

  function togglePasswordVisibility() {
    const pass = document.getElementById("password");
    const confirm = document.getElementById("confirm-password");
    const toggle = document.getElementById("toggle-visibility");
    const isHidden = pass.type === "password";
    pass.type = confirm.type = isHidden ? "text" : "password";
    toggle.innerHTML = isHidden ? "<strike>👁️</strike>" : "👁️";
  }

  function trigger2FA() {
    generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById("forgot-section").style.display = "block";
    document.getElementById("code-display").textContent = generatedCode;
    document.getElementById("verify-result").textContent = "";
    document.getElementById("verify-code").value = "";
  }

  function verify2FA() {
    const inputCode = document.getElementById("verify-code").value.trim();
    const message = document.getElementById("verify-result");
    if (inputCode === generatedCode) {
      message.style.color = "#008800";
      message.textContent = "2FA verification successful. You may reset your password.";
    } else {
      message.style.color = "#cc0000";
      message.textContent = "Incorrect code. Please try again.";
    }
  }

  function hasRepeatedChars(str, len = 3) {
    for (let i = 0; i <= str.length - len; i++) {
      const seg = str.slice(i, i + len);
      if (seg.split('').every(c => c === seg[0])) return true;
    }
    return false;
  }

  function checkPassword() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;
    const result = document.getElementById("result");
    const meter = document.getElementById("strength-meter-fill");

    result.style.color = "#555";
    meter.style.width = "0%";
    meter.style.background = "#999";

    const errors = [];
    if (!username) errors.push("Username cannot be empty.");
    if (!isValidEmail(document.getElementById("email").value.trim()))
    errors.push("Invalid email format.");
    if (password.toLowerCase().includes(username.toLowerCase())) errors.push("Don't use your username in password.");
    if (!password) errors.push("Please enter a password.");
    if (!confirm) errors.push("Please confirm your password.");
    if (password.length < 8 || password.length > 32)
      errors.push("Password must be between 8 and 32 characters.");
    if (!/[a-z]/.test(password)) errors.push("Add at least one lowercase letter in the password.");
    if (!/[A-Z]/.test(password)) errors.push("Add at least one uppercase letter in the password.");
    if (!/[0-9]/.test(password)) errors.push("Add at least one digit.");

    const specialCount = new Set([...password].filter(ch => /[^a-zA-Z0-9]/.test(ch))).size;
    if (specialCount < 2) errors.push("Add at least two different special symbols.");
    if (/\s/.test(password)) errors.push("No whitespace allowed.");
    if (hasRepeatedChars(password)) errors.push("Avoid repeated characters.");
    if (/(abc|bcd|cde|123|234|345|456|567|678|789)/i.test(password)) errors.push("Avoid sequential patterns.");
    if (password !== confirm) errors.push("Passwords do not match.");

    const score = [
      password.length >= 8 && password.length <= 32,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      specialCount >= 2,
      !/\s/.test(password),
      !hasRepeatedChars(password),
      !/(abc|bcd|cde|123|234|345|456|567|678|789)/i.test(password),
      !password.toLowerCase().includes(username.toLowerCase()),
      password === confirm
    ].filter(Boolean).length;

    const colors = ["#AA0000", "#FF4C00", "#FF8C00", "#FFBF00", "#FFFF00", "#BFFF00", "#80FF00", "#40FF00", "#00FF00", "#00BB00", "#008800"];
    meter.style.width = (score * 10) + "%";
    meter.style.background = colors[score];

    if (errors.length) {
      result.style.color = "#AA0000";
      result.textContent = errors.join("\n");
    } else {
      result.style.color = "#008800";
      result.textContent = "Your Password is strong.";
    }
  }
