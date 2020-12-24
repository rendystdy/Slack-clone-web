import firebase from "firebase/app";

import "firebase/auth";
import "firebase/database";
import "firebase/storage";
// import "firebase/analytics";

// <!-- The core Firebase JS SDK is always required and must be listed first -->
// <script src="https://www.gstatic.com/firebasejs/7.23.0/firebase-app.js"></script>

// <!-- TODO: Add SDKs for Firebase products that you want to use
//      https://firebase.google.com/docs/web/setup#available-libraries -->
// <script src="https://www.gstatic.com/firebasejs/7.23.0/firebase-analytics.js"></script>

// <script>
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyD5ILUeuXBVa2fGPHFRoDsIj_Bd6Pcst9o",
  authDomain: "react-slack-clone-509d6.firebaseapp.com",
  projectId: "react-slack-clone-509d6",
  storageBucket: "react-slack-clone-509d6.appspot.com",
  messagingSenderId: "131385673628",
  appId: "1:131385673628:web:7452ef4474a92905b7aa59",
  databaseURL: "https://react-slack-clone-509d6-default-rtdb.firebaseio.com/",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

export default firebase;
// </script>
