import { createContext, useState, useContext, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig"; // Adjust the path to your Firebase config
import userApi from "../apis/userApi";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        userApi
          .findByEmail(currentUser.email)
          .then((result) => {
            console.log("context mongodb ", result.data);
            if (result.data) {
              const currentUserWithDB = {
                firstName: result.data.firstName,
                lastName: result.data.lastName,
                email: result.data.email,
                _id: result.data._id,
              };
              console.log("context currentuser ", currentUserWithDB);

              setUser(currentUser ? currentUserWithDB : currentUser); // Update user state when authentication state changes
            }
          })
          .catch((err) => {
            console.log("error from contex ", err);
          });
      } else {
        console.log("context currentuser Null");
      }
      setLoading(false); // Stop loading once auth state is determined
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  const logout = () => {
    setUser(null); // Clear the user state
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {!loading && children} {/* Only render children after loading */}
    </UserContext.Provider>
  );
};

// Add PropTypes validation for children
UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => useContext(UserContext);
