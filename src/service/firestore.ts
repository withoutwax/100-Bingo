import firebase from 'firebase';

// Initialize Cloud Firestore through Firebase
const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyBxDgSvLTmytNJTdQgm0kZMktBBwHlSXAk",
  authDomain: "bingo-ac310.firebaseapp.com",
  databaseURL: "https://bingo-ac310.firebaseio.com",
  projectId: "bingo-ac310",
  storageBucket: "bingo-ac310.appspot.com",
  messagingSenderId: "210785808652",
  appId: "1:210785808652:web:cece79fd7ac480ef675929",
  measurementId: "G-0E2JY46X65"
});

export const db = firebaseApp.firestore();