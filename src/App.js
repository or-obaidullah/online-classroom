import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignIn: false,
    name: '',
    email: '',
    photo: '',
    error: '',
    success: false
  })
  //Start  Google Sign IN and OUT
  //SignIN
  var googleProvider = new firebase.auth.GoogleAuthProvider();
  const handleSignIn = () => {
    firebase.auth()
      .signInWithPopup(googleProvider)
      .then(res => {
        const { displayName, email, photoURL } = res.user;
        const signInUser = {
          isSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signInUser);

      })
      .catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode, errorMessage)
      });
  }
  //Sign Out
  const handleSignOut = () => {
    firebase.auth().signOut().then(() => {
      const signInUser = {
        isSignIn: false,
        name: '',
        email: '',
        photo: ''
      }
      setUser(signInUser);
    }).catch((error) => {
      console.log(error);
    });
  }
  //End  Google Sign IN and OUT

  //Start Form Validation
  const handleOnBlur = (e) => {
    console.log(e.target.name, e.target.value)
    let isFieldValid = true;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.+\S+/.test(e.target.value)
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasValid = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasValid;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
      console.log('new user info', newUserInfo)
    }
  }
  //End Form Validation


  // Start Manage User -create user with email and password
  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user }
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name)
        })
        .catch((error) => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    //for Sign In old user
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user }
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log(res.user);
        })
        .catch(error => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();
  }
  // End Manage User -create user with email and password

  //Update User Name
  const updateUserName =(name) => {
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
    }).then(() => {
      // Update successful.
    }).catch(error =>{
      console.log(error)
    });
  }
  return (
    <div className='App'>
      <p>Name : {user.name}</p>
      <p>Email : {user.email}</p>
      <p>Email : {user.password}</p>
      <p>Photo: <img src={user.photo} alt="" /></p>
      {
        user.isSignIn ? <button onClick={handleSignOut}>Sign Out</button> :
          <button onClick={handleSignIn}>Sign With Google</button>
      }
      <h3>Form Validation</h3>
      <input type="checkbox" name="newUser" id="" onChange={() => setNewUser(!newUser)} />
      <label htmlFor="newUser">New user SignUp</label>
      <form onClick={handleSubmit}>
        {
          newUser &&
          <p>
            <label htmlFor="name">Name: </label>
            <input onBlur={handleOnBlur} type="text" name="name" id="" placeholder="Enter Your name" />
          </p>
        }
        <p>
          <label htmlFor="email">Email: </label>
          <input onBlur={handleOnBlur} type="text" name="email" id="" placeholder="Enter Your email" required />
        </p>
        <p>
          <label htmlFor="password">Password: </label>
          <input onBlur={handleOnBlur} type="text" name="password" id="" placeholder="Enter Your Password" required />
        </p>
        <input type="submit" value="Sign In" />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {
        user.success &&
        <p style={{ color: 'green' }}> User {newUser ? "Created " : "Logged In"} Successfully</p>
      }
    </div>
  );
}

export default App;
