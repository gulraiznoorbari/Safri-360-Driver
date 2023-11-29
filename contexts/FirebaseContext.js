import { useState, useEffect, useContext, createContext } from "react";
import {
    PhoneAuthProvider,
    EmailAuthProvider,
    onAuthStateChanged,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    sendEmailVerification,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    updatePassword,
    signOut,
} from "firebase/auth";
import { useSelector, useDispatch } from "react-redux";

import { auth } from "../firebase/config";
import { setUser, setUserType, selectUserType } from "../store/slices/userSlice";

const FirebaseContext = createContext();

export function useFirebase() {
    return useContext(FirebaseContext);
}

export function FirebaseProvider({ children }) {
    const userType = useSelector(selectUserType);
    const dispatch = useDispatch();

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (userType === "RentACarOwner" || userType === "ToursCompany") {
            let prevState;
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setCurrentUser(user);
                console.log("User: ", user);
                console.log("Authstate Changed!");
                if (user) {
                    prevState = prevState || user;
                    console.log("User is signed in!");
                }
            });
            return () => unsubscribe();
        }
    }, []);

    const signUp = (email, password, onSuccess, onError) => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((credential) => {
                dispatch(setUser({ uid: credential.user.uid, lastLoginAt: credential.user.metadata.lastSignInTime }));
                console.log("User signed up successfully!");
                if (typeof onSuccess === "function") return onSuccess(credential);
            })
            .catch((error) => {
                console.log("Error signing up: ", error);
                if (typeof onError === "function") return onError(error.code);
            });
    };

    const signIn = (email, password, onSuccess, onError) => {
        signInWithEmailAndPassword(auth, email, password)
            .then((credential) => {
                dispatch(setUser({ isLoggedIn: true }));
                console.log("User signed In Successfully!");
                if (typeof onSuccess === "function") return onSuccess(credential);
            })
            .catch((error) => {
                console.log("Error signing in: ", error);
                if (typeof onError === "function") return onError(error.code);
            });
    };

    const sendPhoneVerificationCode = (phoneNumber, recaptchaState, onSuccess, onError) => {
        console.log("Sending phone verification code...");
        const phoneProvider = new PhoneAuthProvider(auth);
        phoneProvider
            .verifyPhoneNumber(phoneNumber, recaptchaState)
            .then((verificationID) => {
                console.log("Verification ID: ", verificationID);
                if (typeof onSuccess === "function") return onSuccess(verificationID);
            })
            .catch((error) => {
                console.log("Error sending verification code: ", error);
                if (typeof onError === "function") return onError(error.code);
            });
    };

    const sendVerificationEmail = (onSuccess) => {
        if (!currentUser) return;
        console.log("\nSending Verification Email...");
        sendEmailVerification(currentUser)
            .then(() => {
                console.log("Verification Email was sent successfully!");
                if (typeof onSuccess === "function") onSuccess();
            })
            .catch((error) => {
                console.log("Firebase VerificationEmail Error: ", error);
                if (error.code === "auth/email-already-in-use") {
                    console.log("That email address is already in use!");
                }
            });
    };

    const sendPasswordResetMail = (email, onSuccess, onError) => {
        console.log("\nSending Password Reset Email...");
        sendPasswordResetEmail(auth, email)
            .then(() => {
                console.log("Password Reset Email was sent successfully!");
                if (typeof onSuccess === "function") onSuccess();
            })
            .catch((error) => {
                console.log("Firebase PasswordResetEmail Error: ", error);
                if (typeof onError === "function") onError(error.code);
            });
    };

    const updateUserProfile = (updateData) => {
        if (!currentUser) return;
        console.log("\nUpdating User Profile...");
        updateProfile(currentUser, updateData)
            .then(() => {
                console.log("\nUser Profile Updated successfully\n");
            })
            .catch((error) => {
                console.log("\nUser Profile Update Error!!!", error);
            });
    };

    const updateUserPassword = (oldPassword, newPassword, onSuccess, onError) => {
        if (!currentUser) return;
        const credential = EmailAuthProvider.credential(currentUser?.email, oldPassword);
        reauthenticateWithCredential(currentUser, credential)
            .then(() => {
                updatePassword(newPassword)
                    .then(() => {
                        onSuccess();
                    })
                    .catch((error) => {
                        onError(error);
                    });
            })
            .catch((error) => {
                onError(error);
            });
    };

    const logout = () => {
        signOut(auth)
            .then(() => {
                dispatch(setUser({ isLoggedIn: false }));
                dispatch(setUserType(null));
                console.log("User logged out successfully!");
            })
            .catch((error) => {
                console.log("Oops...Aomething went wrong while logging Out: ", error);
            });
    };

    const value = {
        currentUser,
        signUp,
        signIn,
        sendPhoneVerificationCode,
        sendVerificationEmail,
        sendPasswordResetMail,
        updateUserProfile,
        updateUserPassword,
        logout,
    };

    return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}
