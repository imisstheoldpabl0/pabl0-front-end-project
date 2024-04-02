/* FIREBASE */

const firebaseConfig = {
    apiKey: "AIzaSyAz26KxPIpMItdKXUtqLvIUIDWAacPuEkk",
    authDomain: "tradeboyai.firebaseapp.com",
    projectId: "tradeboyai",
    storageBucket: "tradeboyai.appspot.com",
    messagingSenderId: "130827237254",
    appId: "1:130827237254:web:bd8f8a90d24ad1b71c9e07"
  };

firebase.initializeApp(firebaseConfig); // Initializes Firebase App

const db = firebase.firestore(); // Initializes Firestore



// FIRESTORE USERS COLLECTION

const createUser = (user) => {
    db.collection("users")
        .add(user)
        .then((docRef) => console.log("Document written with ID: ", docRef.id))
        .catch((error) => console.error("Error adding document: ", error));
};

//FIREBASE AUTH

const signUpUser = (email, password) => {
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            let user = userCredential.user;
            console.log(`se ha registrado ${user.email} ID:${user.uid}`)
            alert(`se ha registrado ${user.email} ID:${user.uid}`)
            // ...
            // Saves user in firestore
            createUser({
                id: user.uid,
                email: user.email,
                partidas: datosPartidas,
            });

        })
        .catch((error) => {
            console.log("Error en el sistema" + error.message, "Error: " + error.code);
            alert("Por favor compruebe sus datos y rellene todos los campos.")
        });
};


document.getElementById("form1").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = event.target.elements.email.value;
    let pass = event.target.elements.pass.value;
    let pass2 = event.target.elements.pass2.value;

    pass === pass2 ? signUpUser(email, pass) : alert("error password");
})

// SIGN-IN
const signInUser = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            let user = userCredential.user;
            console.log(`User with email: ${user.email} and ID: ${user.uid} has logged in`)
            console.log("USER", user);
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode)
            console.log(errorMessage)
            alert("No user has been found on the system. Please check your credentials")
        });
}

// SIGN-OUT
const signOut = () => {
    let user = firebase.auth().currentUser;

    firebase.auth().signOut().then(() => {
        console.log(`User with email: ${ user.email} has logged out`)

    }).catch((error) => {
        console.log(`${error}`);
    });
}


document.getElementById("form2").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = event.target.elements.email2.value;
    let pass = event.target.elements.pass3.value;
    signInUser(email, pass)
})




document.getElementById("salir").addEventListener("click", signOut);

// Listener de usuario en el sistema
// Controlar usuario logado
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(`Está en el sistema:${user.email} ${user.uid}`);
        console.log(`User with email ${user.email} is in the system`);
        document.getElementById("userInSystem").innerHTML = user.email;
    } else {
        console.log(`No users in the system`);
        document.getElementById("userInSystem").innerHTML = "My Account";
    }
});