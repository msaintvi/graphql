document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('signInForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const inputPass = document.getElementById("password");
        const inputUserName = document.getElementById("username");
        const infos = {
            username: inputUserName.value,
            password: inputPass.value,
        };
        validateJWT(infos);
    });
});

function togglePasswordVisibility() {
    var passwordInput = document.getElementById("password");
    var passwordType = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = passwordType;

    // Update the eye icon based on the password input type
    var toggleIcon = document.getElementById("toggleIcon");
    toggleIcon.textContent = passwordType === "text" ? '🚫' : '👁️';
}

window.onload = function() {
    const message = document.getElementById('messagePassword');
    let newContent = '';
    for (let i = 0, delay = 0; i < message.textContent.length; i++) {
        let letter = message.textContent[i];
        if (letter === ' ') {  // Si c'est un espace
            newContent += '<span class="space">' + letter + '</span>';
        } else {  // Si c'est une lettre
            newContent += '<span class="letter" style="animation-delay: ' + (delay * 0.1) + 's;">' + letter + '</span>';
            delay++; // Incrémente le délai seulement pour les lettres
        }
    }
    message.innerHTML = newContent;
};

let infoUser;
let infoAll;
let tokenJwt;

// Fonction pour gérer la connexion réussie
async function handleSuccessfulLogin(token) {
    tokenJwt = token; // Stockez le token JWT
    hideSignIn();  // Masquez le formulaire de connexion et affichez le bouton de déconnexion
    await usersData();   // Récupérez à nouveau les données utilisateur
    profilUsers(); // Affichez les données utilisateur
}

// Modifiez votre fonction validateJWT pour gérer la connexion réussie
async function validateJWT(infos) {
    let login = async function () {
        const headers = new Headers();
        headers.append('Authorization', 'basic ' + btoa(infos.username + ':' + infos.password));
        try {
            const response = await fetch('https://zone01normandie.org/api/auth/signin', {
                method: 'POST',
                headers: headers
            });
            if (response.ok) {
                const token = await response.json();
                console.log("Login successful", token);
                handleSuccessfulLogin(token); // Gérer la connexion réussie
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            displayError("Error: Bad password or username"); // Provide a clear message to the function
        }
    };
    login();
}

async function usersData() {
    fetch('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers : {
            'content-type' : 'application/json',
            'Authorization' : `Bearer ${tokenJwt}`
        },
        body: JSON.stringify({
            query: `
            query {
                user {
                    id
                    login
                    attrs
                    totalUp
                    totalDown
                    transactions ( where: {eventId: {_eq: 148}}, order_by: {createdAt:asc}){
                    amount
                    type
                    createdAt
                    }
                }
                transaction{
                    id
                    type
                    amount 	
                    objectId 	
                    userId 	
                    createdAt 	
                    path
                }
            }`
        })
    })
    .then(rep => rep.json())
    .then(data => {
        console.log("data1:", data);
        infoUser = data.data.user[0];
        infoAll = data.data.transaction;
        profilUsers();
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
    });
}

// Fonction pour gérer la déconnexion de l'utilisateur
function logOut() {
    tokenJwt = null;  // Réinitialisez le token côté client
    infoUser = null;  // Réinitialisez les données utilisateur
    infoAll = null;   // Réinitialisez les données de transaction
    document.getElementById('page').innerHTML = ''; // Effacez les données affichées
    createSignInForm();
    newLogout();
    showSignIn();  // Affichez à nouveau le formulaire de connexion
}

// Fonction pour masquer le formulaire de connexion et afficher le bouton de déconnexion
function hideSignIn() {
    console.log("Hide sign-in form"); // Ajout du console.log ici
    document.getElementById('signInForm').style.display = 'none';   // Masquer le formulaire de connexion
    document.getElementById('logOutBtn').style.display = 'block';   // Afficher le bouton de déconnexion
}

// Modifiez votre fonction showSignIn pour cacher le bouton de déconnexion
function showSignIn() {
    console.log("Showing login form");
    document.getElementById('signInForm').style.display = 'block';  // Affichez le formulaire de connexion
    document.getElementById('logOutBtn').style.display = 'none';    // Masquez le bouton de déconnexion
    document.getElementById('signInForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const inputPass = document.getElementById("password");
        const inputUserName = document.getElementById("username");
        const infos = {
            username: inputUserName.value,
            password: inputPass.value,
        };
        validateJWT(infos);
    });
}

function profilUsers() {
    if (infoUser) {
        const page = document.getElementById("page");
        page.innerHTML = ""; //Notes: LogOut se fait détruire par cette ligne de code.
        newLogout()
        usersProfil(page);
        generateGraphLinear();
        generateGraphBar();
        console.log(transactSkill());
        createRadarChart(transactSkill());
    }
}

function createSignInForm() {
    
    var title = document.createElement('h2')
    title.className = 'mb-3'
    title.textContent = "Sign In"

    // Create elements for the sign-in form
    var signInForm = document.createElement('form');
    signInForm.id = 'signInForm';
    
    var usernameDiv = document.createElement('div');
    usernameDiv.className = 'mb-3';
    
    var usernameLabel = document.createElement('label');
    usernameLabel.setAttribute('for', 'username');
    usernameLabel.className = 'form-label';
    usernameLabel.textContent = 'Username:';
    
    var usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.className = 'form-control';
    usernameInput.placeholder = 'Your username';
    usernameInput.required = true;
    
    var passwordDiv = document.createElement('div');
    passwordDiv.className = 'mb-3';
    
    var passwordLabel = document.createElement('label');
    passwordLabel.setAttribute('for', 'password');
    passwordLabel.className = 'form-label';
    passwordLabel.textContent = 'Password:';
    
    var passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.className = 'form-control';
    passwordInput.placeholder = 'Your password';
    passwordInput.required = true;

    var messagePassword = document.createElement('span');
    messagePassword.id = 'messagePassword';
    messagePassword.textContent = "Alors on sait plus écrire ? Bah clique sur l'oeil";
    messagePassword

    var button = document.createElement('button');
    button.type = 'button';
    button.onclick = togglePasswordVisibility;
    button.style = "background:none;border:none;";

    var icon = document.createElement('span');
    icon.id = 'toggleIcon';
    icon.textContent= '👁️';
    
    var errorMessageDiv = document.createElement('div');
    errorMessageDiv.id = 'errorMessage';
    errorMessageDiv.className = 'mb-3';
    
    var submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn btn-primary';
    submitButton.textContent = 'Send';
    
    // Append elements to the sign-in form
    usernameDiv.appendChild(usernameLabel);
    usernameDiv.appendChild(usernameInput);
    passwordDiv.appendChild(passwordLabel);
    passwordDiv.appendChild(passwordInput);
    passwordDiv.appendChild(messagePassword);
    button.appendChild(icon);
    passwordDiv.appendChild(button);
    signInForm.appendChild(usernameDiv);
    signInForm.appendChild(passwordDiv);
    signInForm.appendChild(errorMessageDiv);
    signInForm.appendChild(submitButton);
    // icon ==> button
    // button ==> mb-3
    // mb-3 ==> signInForm
    // signInForm==> page    
    // Append the sign-in form to the "page" div
    var pageDiv = document.getElementById('page');
    pageDiv.appendChild(title)
    pageDiv.appendChild(signInForm);

        const message = document.getElementById('messagePassword');
        let newContent = '';
        for (let i = 0, delay = 0; i < message.textContent.length; i++) {
            let letter = message.textContent[i];
            if (letter === ' ') {  // Si c'est un espace
                newContent += '<span class="space">' + letter + '</span>';
            } else {  // Si c'est une lettre
                newContent += '<span class="letter" style="animation-delay: ' + (delay * 0.1) + 's;">' + letter + '</span>';
                delay++; // Incrémente le délai seulement pour les lettres
            }
        }
        message.innerHTML = newContent;

    var passwordInput = document.getElementById("password");
    var passwordType = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = passwordType;
    // var toggleIcon = document.getElementById("toggleIcon");
    // toggleIcon.textContent = passwordType === "text" ? '🚫' : '👁️';
};

function newLogout(){
    const page = document.getElementById('page')

    const logout = document.createElement('button')
    logout.id = "logOutBtn"
    logout.className = "btn btn-secondary mt-3"
    logout.textContent = "Log Out"

    page.appendChild(logout)
    document.getElementById('logOutBtn').addEventListener('click', logOut);
}

function usersProfil(page) {
    // Création des éléments d'informations personnelles
    const infoPerso = document.createElement("div");
    infoPerso.className = "infouser";
    infoPerso.textContent = "Infos perso :";
    infoPerso.style.fontWeight = "bold"; // Modifier le poids de la police
    infoPerso.style.fontSize = "28px"; // Modifier la taille du texte
    infoPerso.style.color = "blue"; // Modifier la couleur du texte


    const infoId = document.createElement("div");
    infoId.className = "infoUser";
    infoId.textContent = `Id: ${infoUser.id}`;
    infoId.style.fontWeight = "bold"; // Modifier le poids de la police
    infoId.style.fontSize = "18px"; // Modifier la taille du texte
    infoId.style.color = "blue"; // Modifier la couleur du texte

    const infoLog = document.createElement("div");
    infoLog.className = "infoUser";
    infoLog.textContent = `Username: ${infoUser.login}`;
    infoLog.style.fontWeight = "bold"; // Modifier le poids de la police
    infoLog.style.fontSize = "18px"; // Modifier la taille du texte
    infoLog.style.color = "blue"; // Modifier la couleur du texte

    const infoMail = document.createElement("div");
    infoMail.className = "infoUser";
    infoMail.textContent = `Mail: ${infoUser.attrs.email}`;
    infoMail.style.fontWeight = "bold"; // Modifier le poids de la police
    infoMail.style.fontSize = "18px"; // Modifier la taille du texte
    infoMail.style.color = "blue"; // Modifier la couleur du texte
    infoMail.style.textDecoration = "underline"; // Modifier le style du texte

    const infoLevel = document.createElement("div");
    infoLevel.className = "infoUser";
    infoLevel.textContent = `Level: ${userLevel()}`;
    infoLevel.style.fontWeight = "bold"; // Modifier le poids de la police
    infoLevel.style.fontSize = "18px"; // Modifier la taille du texte
    infoLevel.style.color = "blue"; // Modifier la couleur du texte

    // Ajout des éléments au document
    page.appendChild(infoPerso);
    page.appendChild(infoId);
    page.appendChild(infoLog);
    page.appendChild(infoMail);
    page.appendChild(infoLevel);
}

function userLevel() {
    let level;
    for (let i = 0; i < infoUser.transactions.length-1; i++) {
        if (infoUser.transactions[i].type === "level") {
            level = infoUser.transactions[i].amount;
        }
    }
    return level;
}

function exp() {
    let array = [];
    for (let i = 0; i < infoUser.transactions.length-1; i++) {
        if (infoUser.transactions[i].type === "xp") {
            array.push(Number(infoUser.transactions[i].amount));
        }
    }
    return array;
}

let errorTimeout; // Keep a reference to the timeout to clear it as needed

function displayError(message) {
    clearTimeout(errorTimeout); // Clear any existing timeouts to avoid premature clearing of messages
    const errorDiv = document.getElementById("errorMessage");
    errorDiv.textContent = message; // Display the new error message

    // Set a new timeout to clear the message after 2 seconds
    errorTimeout = setTimeout(() => {
        errorDiv.textContent = "";
    }, 2000);
}

function generateGraphLinear() {
    const xpAlltransact = document.createElement("div");
    xpAlltransact.className = "graphDiv";

    const xpAmount = document.createElement("div");
    xpAmount.className = "userinfo";
    xpAmount.textContent = `Nombres de transactions d'exp recu (projets, piscine, évaluation...) : ${exp().length}\n`;

    // Calcul de la valeur maximale et minimale dans le tableau de données
    const maxAmount = Math.max(...exp());
    const minAmount = Math.min(...exp());
    const sumOfAllValues = exp().reduce((acc, curr) => acc + curr, 0);
    const average = sumOfAllValues / exp().length;

    // Crée un élément SVG avec un contour jaune
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 900);
    svg.setAttribute("height", 400);
    svg.style.boxShadow = "0 0 0 3px blue"; // Ombre jaune avec une taille de 3 pixels

    // Ajoutez des infos sur l'axe des Y
    for (let i = 0; i <= 10; i++) {
        const y = 400 - (i * 40);
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", 20); // Position horizontale du texte
        text.setAttribute("y", y); // Position verticale du texte
        text.setAttribute("fill", "blue"); // Couleur du texte
        if (i === 0) {
            text.textContent = i; // Valeur de la graduation
        } else if (i === 6) {
            text.textContent = `Nombre d'exp totale : ${sumOfAllValues}`; // Valeur de la graduation
        } else if (i === 7) {
            text.textContent = `Plus faible transaction ---> ${minAmount}`;
        } else if (i === 8) {
            text.textContent = `Moyenne des transactions ---> ${average}`;
        } else if (i === 9) {
            text.textContent = `Plus grosse transaction ---> ${maxAmount}`;
        }
        svg.appendChild(text);
    }

    // Crée une ligne SVG pour représenter les données
    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

    let amountValue = 0;

    // Convertissez les valeurs en points pour la ligne SVG
    const points = exp().map((value, index) => {
        amountValue += value;
        const x = index * 20;
        const y = 400 - (amountValue / sumOfAllValues) * 400;
        return `${x},${y}`;
    }).join(" ");

    // Définissez les attributs de la ligne SVG
    line.setAttribute("points", points);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "blue"); // Couleur de la ligne principale
    line.setAttribute("stroke-width", 2); // Épaisseur de la ligne principale

    // Ajoutez la ligne SVG à votre conteneur SVG
    svg.appendChild(line);

    // Ajoute l'élément SVG au document HTML
    xpAlltransact.appendChild(xpAmount);
    xpAlltransact.appendChild(svg);
    document.getElementById("page").appendChild(xpAlltransact);
}

// Fonction pour créer un graphique à barres avec SVG pour les points d'audits
function generateGraphBar() {
    const data = transactPointAudits(); // Assuming transactPointAudits returns an array of transaction objects
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 600);
    svg.setAttribute("height", 400);
    svg.style.boxShadow = "0 0 0 3px steelblue";

    const xpAlltransact = document.createElement("div");
    xpAlltransact.className = "graphDiv";

    const auditAllTarnsact = document.createElement("div");
    auditAllTarnsact.className = "infoUser";
    auditAllTarnsact.textContent = `Nombre d'audits passés : ${data.length}\n`;

    xpAlltransact.appendChild(auditAllTarnsact);
    xpAlltransact.appendChild(svg); // Append the SVG to your content

    const chartWidth = 600; // Total width of the chart
    const chartHeight = 400; // Total height of the chart
    const barWidth = chartWidth / data.length; // Width of each bar

    // Find the maximum value in the data
    const maxValue = Math.max(...data.map(item => Math.abs(item.amount))); // Use the absolute value

    const dataBig = data.filter((value) => value.amount === maxValue); // Biggest audit

    // Display information about the largest audit
    if (dataBig.length > 0) {
        const textInfo = document.createElement("div");
        textInfo.textContent = `Largest audit: ${dataBig[0].path}, with ${dataBig[0].amount} points.`;
        textInfo.className = "infoUser";
        xpAlltransact.appendChild(textInfo);
    }

    // Create an SVG element for each bar
    data.forEach((value, index) => {
        let barHeight = (Math.abs(value.amount) / maxValue) * chartHeight; // Bar height based on its value
        if (value.type === "down") {
            barHeight *= -1; // Reverse the height for "down" type bars
        }
        const x = index * barWidth; // Horizontal position of the bar
        const y = chartHeight - Math.max(0, Math.abs(barHeight)); // Vertical position of the bar (inverted for a y-axis that grows upwards)

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", Math.abs(barHeight));
        rect.setAttribute("fill", value.type === "up" ? "green" : "red"); // Bar color based on type

        svg.appendChild(rect); // Add the bar to the SVG element
    });

    document.getElementById("page").appendChild(xpAlltransact); // Ensure you append to the right element
}


function transactPointAudits(){
    return infoAll.filter(t => t.type === "up" || t.type === "down");
}

//Retourne les transacts qui contiennent le niveau actuelle des skills afficher sur l'intra
function transactSkill(){
    let obj1 ={
        amount: 0,
        createdAt: "",
        id: 0,
        objectId: 0,
        path: "",
        type: "",
        userId: 0
    }
    let obj = {
        go : obj1,
        js : obj1,
        algo : obj1,
        front : obj1,
        back : obj1,
        prog : obj1
    }
    for(let i = 0; i < infoAll.length-1; i++){
        let transact = infoAll[i].type;
        switch (transact){
            case "skill_prog":
                if (infoAll[i].amount > obj.prog.amount){
                    obj.prog = infoAll[i];
                }
                break
            
            case "skill_go":
                if (infoAll[i].amount > obj.go.amount){
                    obj.go = infoAll[i];
                }
                break

            case "skill_js":
                if (infoAll[i].amount > obj.js.amount){
                    obj.js = infoAll[i];
                }
                break

            case "skill_front-end":
                if (infoAll[i].amount > obj.front.amount){
                    obj.front = infoAll[i];
                }
                break

            case "skill_back-end":
                if (infoAll[i].amount > obj.back.amount){
                    obj.back = infoAll[i];
                }
                break

            case "skill_algo":
                if (infoAll[i].amount > obj.algo.amount){
                    obj.algo = infoAll[i];
                }
                break
            default:
                break
        }
    }
    let array = [];
    array.push(obj.algo);
    array.push(obj.back);
    array.push(obj.front);
    array.push(obj.go);
    array.push(obj.js);
    array.push(obj.prog);
    return array
}

function createRadarChart(data) {

    const skillInfo = document.createElement("div");
    skillInfo.className = "graphDiv";
    skillInfo.textContent= `Vos skills : `;
    document.getElementById("page").appendChild(skillInfo);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 600);
    svg.setAttribute("height", 400);

    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Création des lignes de progression
    data.forEach((value, index) => {
        const angle = (Math.PI * 2 * index) / data.length;
        const labelRadius = radius + 20; // Rayon pour placer les libellés à une certaine distance du centre
        const x = centerX + labelRadius * Math.cos(angle); // Coordonnée x du libellé
        const y = centerY + labelRadius * Math.sin(angle); // Coordonnée y du libellé
    
        // Création de la ligne jusqu'à 100%
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", centerX);
        line.setAttribute("y1", centerY);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "rgba(255, 255, 255, 0.5)");
        line.setAttribute("stroke-width", 2);
        svg.appendChild(line);
    
        // Ajout du libellé de compétence au bout de la ligne
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", x);
        label.setAttribute("y", y);
        label.setAttribute("fill", "blue");
        label.setAttribute("font-size", "14px");
        label.setAttribute("text-anchor", "middle"); // Alignement du texte au centre horizontalement
        label.textContent = `${data[index].type} : ${data[index].amount}`; // Remplacez "label" par le nom de la compétence dans vos données
        svg.appendChild(label);
    });
    
    // Création des polygones représentant les compétences
    const polyPoints = data.map((value, index) => {
        const angle = (Math.PI * 2 * index) / data.length;
        const x = centerX + (radius * value.amount) / 100 * Math.cos(angle);
        const y = centerY + (radius * value.amount) / 100 * Math.sin(angle);
        return `${x},${y}`;
    });
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", polyPoints.join(" "));
    polygon.setAttribute("fill", "rgba(255, 0, 0, 0.5)");
    svg.appendChild(polygon);

    // Ajout du SVG à la div "page"
    document.getElementById("page").appendChild(svg);

    const ligne = document.createElement("div");
    ligne.className = "userinfo";
    document.getElementById("page").appendChild(ligne);
}

