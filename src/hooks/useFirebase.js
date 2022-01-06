import { useEffect, useState } from "react";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut,
} from "firebase/auth";

import initializeFirebase from "./../pages/Login/Firebase/Firebase.init";
import swal from "sweetalert";

initializeFirebase();
const useFirebase = () => {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [admin, setAdmin] = useState(false);

  const googleProvider = new GoogleAuthProvider();
  const auth = getAuth();

  // log in with google provider
  const signInWithGoogle = (location, history) => {
    setIsLoading(true);
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        saveUser(user.email, user.displayName, "put");
        setAuthError(" ");

        const adminDestination = location?.state?.from || "/";
        history.replace(adminDestination);
        if (user?.email) {
          swal({
            title: "Good job!",
            text: "User Successfully Logged In",
            icon: "success",
            button: "Aww yiss!",
          });
        }
      })
      .catch((error) => {
        setAuthError(error.message);
      })
      .finally(() => setIsLoading(false));
  };

  const registerUser = (email, password, name, history) => {
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        const user = result.user;
        setAuthError("");

        const newUser = { email, displayName: name };
        setUser(newUser);
        // save user to the database

        saveUser(email, name, "post");
        // send name to firebase after creation

        updateProfile(auth.currentUser, {
          displayName: name,
        })
          .then(() => {})
          .catch((error) => {});
        history.replace("/");
        if (user?.email) {
          swal({
            title: "Good job!",
            text: "User Successfully Created",
            icon: "success",
            button: "Aww yiss!",
          });
        }
      })
      .catch((error) => {
        setAuthError(error.message);
        swal({
          title: "Opps !!!",
          text: error.message,
          icon: "error",
          button: "Try Again",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loginUser = (email, password, location, history) => {
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        const user = result.user;
        const adminDestination = location?.state?.from || "/";
        history.replace(adminDestination);
        if (user?.email) {
          swal({
            title: "Good job!",
            text: "User Successfully Logged In",
            icon: "success",
            button: "Aww yiss!",
          });
        }

        setAuthError("");
      })
      .catch((error) => {
        setAuthError(error.message);
        swal({
          title: "Opps !!!",
          text: error.message,
          icon: "error",
          button: "Try Again",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    const unsubscribed = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser({});
      }
      setIsLoading(false);
    });
    return () => unsubscribed;
  }, []);

  useEffect(() => {
    fetch(`https://ancient-beyond-64067.herokuapp.com/users/${user.email}`)
      .then((res) => res.json())
      .then((data) => setAdmin(data.admin));
  }, [user?.email]);

  const logOut = () => {
    setIsLoading(true);
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      })
      .finally(() => setIsLoading(false));
  };

  const saveUser = (email, displayName, method) => {
    const user = { email, displayName };
    fetch("https://ancient-beyond-64067.herokuapp.com/users", {
      method: method,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(user),
    }).then();
  };

  return {
    user,
    isLoading,
    authError,
    signInWithGoogle,
    registerUser,
    loginUser,
    admin,
    logOut,
  };
};
export default useFirebase;
