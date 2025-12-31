if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('Unregistering Service Worker:', registration);
      registration.unregister();
    }
    // Optional: Force a reload if a controller was found to ensure a clean state
    if (registrations.length > 0) window.location.reload(); 
  });
}
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector("#register-form");
const loginTab = document.querySelector("#login-tab");
const registerTab = document.querySelector("#register-tab");

const serverurl = 'https://api.cloudclipboard.app';



loginForm.addEventListener('submit', login);
registerForm.addEventListener('submit', register);

const registerPopup = document.querySelector('#register-popup');

const quill = new Quill('#editor', {
  modules: { toolbar: false },
  theme: 'snow',
  placeholder: 'Add Image/Text'
});

let getInput = function() {
  delta = quill.getContents();
  let clipboard = [];
  delta['ops'].forEach(element => {
        if (element['insert'] != undefined){
            clipboard.push(element['insert'])
        }
  });
  sendPayload(clipboard);
  console.log(quill.getSemanticHTML());
}

let sendPayload = async(payload) => {
  //Payload is an array of strings either containing an image or a string of text
  await fetch(serverurl + '/api/send' , {
    method : "POST",
    credentials : 'include',
    headers : {
      'Content-Type' : 'application/json'
    },
    body : JSON.stringify({
      'payload' : payload,
      'date' : new Date()
    })
  });
}


async function userLogout() {
  const response = await fetch(serverurl + "/logout", {
    method: "POST", 
    credentials : 'include'
  })
  if (response.ok){
    const userInfo = document.querySelector('#user-text')
    userInfo.innerText = "Please Login"
  }
  else {
    console.log("Logout failed?")
  }
}

async function login(e){
  e.preventDefault()

  const failed_text = loginForm.querySelector(".failed-login")
  const data = new FormData(loginForm)

  const response = await fetch(serverurl + "/login", {
    method : "POST",
    credentials : 'include',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({username: data.get('username'), password: data.get('password')})
  });
  response_data = await response.json()
  if (response.ok) {
    display_user(response_data['username'])
    failed_text.style.display = 'none'
  }
  else {
      failed_text.style.display = 'block'
  }
}
async function register(e){
  e.preventDefault()
  const data = new FormData(registerForm)
  const failed = registerForm.querySelector(".failed-Registration")
  const response = await fetch(serverurl + "/register", {
    method : "POST",
    credentials : 'include',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({username: data.get('username'), password: data.get('password')})
  });
  response_data = await response.json()
  if(response.ok){
    display_user(data.get('username'))
    failed.classList.toggle("hidden", true)
  }
  else {
    failed.classList.remove("hidden")
  }
}

async function fetch_clipboard(){
  const response = await fetch(serverurl + '/api/receive', {
    method : "POST",  
    credentials : 'include',
  })
  if (response.ok) {
    clear_quill();
    
    data = await response.json();
    console.log(data);
    data['payload'].forEach((element) => {
        if (typeof element !== 'string'){
          quill.insertEmbed(quill.getLength, 'image', element['image']);
        }
        else {
          quill.insertText(quill.getLength, element);
        }
      }
    ) 
  }
}

let clear_quill = () => {
  quill.deleteText(0, quill.getLength())
}

let display_user = (Username) =>{
  const userInfo = document.querySelector('#user-text')
    userInfo.innerText = "User: " + Username
}

let toggleTab = (isLogin) => {
    loginForm.classList.toggle("hidden", !isLogin)
    registerForm.classList.toggle("hidden", isLogin)
    loginTab.classList.toggle("active", isLogin)
    registerTab.classList.toggle("active", !isLogin)
}

let togglePopup = () => {
  const Popup = document.querySelector('#popup') 
  if (Popup.classList.contains("hidden")) {
    Popup.classList.remove("hidden")
  }
  else {
    Popup.classList.add("hidden")
  }

}
const editor = document.querySelector("#editor")
editor.addEventListener('copy', copy_editor , {capture : true})


function copy_editor(e) {
  /*
  e.preventDefault();
  e.clipboardData.clearData();
  const range = quill.getSelection();
  const contents = quill.getContents(range.index, range.length);
  contents['ops'].forEach(element => {
        if (element['insert'] != undefined){
            //Check if element is an image.
            if (element['insert']['image'] != undefined) {
              //Convert image (Base64) to BLOB
              //e.clipboardData.items.add();
              console.log(atob(element['insert']['image']))
            }
            //Element is not an image
            else {
              //Insert text
              console.log(element['insert']);
              e.clipboardData.items.add(element['insert'], 'text/plain');
              console.log(e.clipboardData.items);
            }
        }
  }); 
  */
}

async function login_status() {
  const response = await fetch(serverurl + "/api/login-status", {
    method : "POST",
    credentials : 'include',
  });
  if (response.ok) {
    text = await response.json();
    document.querySelector('#user-text').innerText = text['response'];
  }
}

// Load Status
login_status();

//Configure the Buttons
document.querySelector("#login-tab").addEventListener('click' , function () {toggleTab(true)});
document.querySelector("#register-tab").addEventListener('click' , function () {toggleTab(false)});
document.querySelector("#Logout").addEventListener('click' , function () {userLogout()});
document.querySelector(".user-icon").addEventListener('click' , function () {togglePopup()});
document.querySelector("#Send").addEventListener('click' , function () {getInput()});
document.querySelector("#Paste-Board").addEventListener('click' , function () {fetch_clipboard()});

//https://stackoverflow.com/questions/21125337/how-to-detect-if-web-app-running-standalone-on-chrome-mobile/34516083#34516083
function isRunningStandalone() {
    return (window.matchMedia('(display-mode: standalone)').matches);
}
