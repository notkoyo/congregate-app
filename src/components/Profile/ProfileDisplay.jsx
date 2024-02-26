"use client";
// import { createClient } from "@supabase/supabase-js";
import { supabaseAuth } from "@/utils/supabaseClient";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Interests from "./Interests";

export default function ProfileDisplay() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userInterests, setUserInterests] = useState(null);
  const [editableUser, setEditableUser] = useState(null);
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);
  const [userInterestsArray, setUserInterestsArray] = useState([]);
  // const [showInterests, setShowInterests] = useState(false);

  const handleInterestsChange = (newInterests) => {
    setUserInterestsArray(newInterests);
    console.log(newInterests, "<<< newInterests");
  };

  const fetchInterestsData = async (interestIds) => {
    console.log("InterestIds:", interestIds);
    try {
      const { data, error } = await supabaseAuth
        .from("interests")
        .select("*")
        .in("interest_id", interestIds);

      if (error) {
        console.error("Error fetching interests data:", error);
        return [];
      }
      console.log(data, "<<< interests");
      return data;
    } catch (error) {
      console.error("Error fetching interests data:", error);
      return [];
    }
  };

  const fetchUserInterests = async (userId) => {
    // Check if userId is defined and not null
    if (userId === undefined || userId === null) {
      console.error("Error: userId is undefined or null");
      return [];
    }

    console.log("userId:", userId);
    try {
      const { data: interestIds, error: userError } = await supabaseAuth
        .from("user_interests")
        .select("interest_id")
        .eq("user_id", userId);

      if (userError) {
        console.error("Error fetching user interests:", userError);
        return [];
      }

      // Log interestIds
      console.log("Interest IDs from the database:", interestIds);

      const validInterestIds = interestIds.map(
        (interest) => interest.interest_id,
      );
      console.log("Valid Interest IDs:", validInterestIds);

      const interestsData = await fetchInterestsData(validInterestIds);

      // Log interest details from the 'interests' table
      console.log(
        "Interest details from the 'interests' table:",
        interestsData,
      );
      // Create the string of interests to be set
      const interestsString = interestsData
        .map((interest) => interest.interest)
        .join(", ");

      // Log the interests string before setting it
      console.log("Interests string to set:", interestsString);

      setUserInterests(interestsString);
      return interestsData;
    } catch (error) {
      console.error("Error fetching user interests:", error);
      return [];
    }
  };

  useEffect(() => {
    console.log("Entering useEffect");

    const fetchCurrentUser = async () => {
      console.log("Entering fetchUserData");
      try {
        const { data, error } = await supabaseAuth.auth.getUser();

        console.log(data, "<<< UserData");
        console.log(data.user.id, "<<< authId");

        if (error) {
          console.error("Error fetching user:", error);
        } else if (data && data.user) {
          const authUser = data.user;
          const userData = await fetchUserData(authUser.id);

          if (userData) {
            const userId = userData.id;
            setCurrentUser(userData);
            setEditableUser(userData);
            await fetchUserInterests(userId);
          }
        }
        console.log("Exiting fetchCurrentUser");
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    const fetchUserData = async (authId) => {
      console.log("Inside fetchUserData, authId:", authId);
      try {
        const { data, error } = await supabaseAuth
          .from("users")
          .select("*")
          .eq("auth_id", authId);

        if (error) {
          console.error("Error fetching user data:", error);
          return null;
        }

        const user = data[0];
        console.log(user.id, "userId, data[0].id");
        return user;
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    };

    // Initial fetch
    fetchCurrentUser();
    console.log("Exiting useEffect");
  }, []);

  const toggleUpdate = () => {
    console.log("Toggling update");

    if (!isUpdating) {
      console.log("Setting editable user:", { ...currentUser });
      setEditableUser({ ...currentUser });
    }
    setIsUpdating((prevState) => !prevState);
  };

  const clearUserInterests = async () => {
    console.log(editableUser.id, "<<< userId");
    await supabaseAuth
      .from("user_interests")
      .delete()
      .eq("user_id", editableUser.id);
  };

  const updateUserInterests = async (userId, interestsArray) => {
    console.log("Updating user interests for userId:", userId);

    // Fetch interest IDs first
    const interestIds = await Promise.all(
      interestsArray.map(async (interestDescription) => {
        console.log(interestDescription, "<<< Fetching interest description");

        const { data: interest, error } = await supabaseAuth
          .from("interests")
          .select("interest_id")
          .eq("interest", interestDescription);

        if (error) {
          console.error("Error fetching interest ID:", error);
          return null;
        }

        console.log(interest, "<<< interest array of objects");
        return interest?.[0]?.interest_id || null;
      }),
    );

    console.log("Interest IDs:", interestIds);

    // Filter out any null values (in case of errors)
    const validInterestIds = interestIds.filter((id) => id !== null);

    console.log("Valid Interest IDs:", validInterestIds);

    // Create userInterestObjects array
    const userInterestObjects = validInterestIds.map((interestId) => {
      return {
        user_id: userId,
        interest_id: interestId,
      };
    });

    console.log("User Interest Objects:", userInterestObjects);

    try {
      // Use upsert to insert or update based on interest_id
      const { data, error } = await supabaseAuth
        .from("user_interests")
        .upsert(userInterestObjects, { onConflict: "id" });

      if (error) {
        console.error("Error updating user interests:", error);
      } else {
        console.log("User interests updated");
      }
    } catch (error) {
      console.error("Error updating user interests:", error);
    }
  };

  const handleProfileUpdate = async () => {
    if (!editableUser) return;

    try {
      // await clearUserInterests();
      const updatedInterests = await fetchUserInterests(currentUser.id); // last update editableUser.id

      console.log("Fetched user interests:", updatedInterests);

      if (updatedInterests !== null) {
        console.log("Type of updated interests >>>", typeof updatedInterests);
      }

      if (Array.isArray(updatedInterests)) {
        const interestsArray = updatedInterests.map(
          (interest) => interest.interest,
        );

        setUserInterests(interestsArray.join(", "));
        console.log(updatedInterests, "<<< updated Interests");
        // console.log(updatedInterests[0].interest, "<<< updated Interests");
        console.log("User interests updated successfully");
      } else {
        console.error(
          "Error fetching updated user interests. Data format is unexpected:",
          updatedInterests,
        );
      }

      const { data, error } = await supabaseAuth.from("users").upsert(
        [
          {
            auth_id: currentUser.auth_id,
            given_names: editableUser.given_names,
            surname: editableUser.surname,
            dob: editableUser.dob,
            email: editableUser.email,
          },
        ],
        { onConflict: ["auth_id"] },
      );

      if (error) {
        console.error("Error updating user details:", error);
      } else {
        setCurrentUser(editableUser);
        setIsUpdating(false);
        setIsProfileUpdated(true);
        setTimeout(() => setIsProfileUpdated(false), 4000);

        await updateUserInterests(currentUser.id, userInterestsArray);

        setUserInterestsArray([]);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-satoshi">
      <div className="flex">
        <div className="flex flex-col items-center gap-10 p-6">
          <img
            width={200}
            src="https://buffer.com/library/content/images/size/w1200/2023/10/free-images.jpg"
            alt=""
          />
          {currentUser && <p>{`${currentUser.email}`}</p>}
        </div>

        <div className="w-96 p-6">
          <div className="flex justify-between">
            <h3 className="text-center text-2xl font-bold">Information</h3>
            {isUpdating ? (
              <button
                type="button"
                onClick={() => toggleUpdate()}
                className="rounded bg-cyan-600 px-4 py-2 text-white hover:bg-blue-600"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggleUpdate()}
                className="rounded bg-cyan-600 px-4 py-2 text-white hover:bg-blue-600"
              >
                Update
              </button>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProfileUpdate();
            }}
          >
            {editableUser && (
              <div className="flex flex-col gap-4 pt-4">
                <div className="flex justify-between">
                  <label htmlFor="email">Given Name</label>
                  <input
                    id="given_names"
                    type="text"
                    defaultValue={editableUser.given_names}
                    onChange={(e) =>
                      setEditableUser({
                        ...editableUser,
                        given_names: e.target.value,
                      })
                    }
                    disabled={!isUpdating}
                    className={`${isUpdating ? "rounded border pl-2" : "bg-inherit pl-2"}`}
                  />
                </div>
                <div className="flex justify-between">
                  <label htmlFor="email">Surname</label>
                  <input
                    id="name"
                    type="text"
                    defaultValue={editableUser.surname}
                    onChange={(e) =>
                      setEditableUser({
                        ...editableUser,
                        surname: e.target.value,
                      })
                    }
                    disabled={!isUpdating}
                    className={`${isUpdating ? "rounded border pl-2" : "bg-inherit pl-2"}`}
                  />
                </div>

                <div className="flex justify-between">
                  <label htmlFor="dob">Date of Birth</label>
                  <input
                    id="dob"
                    type="date"
                    defaultValue={editableUser.dob}
                    onChange={(e) =>
                      setEditableUser({ ...editableUser, dob: e.target.value })
                    }
                    disabled={!isUpdating}
                    className={`bg-none ${isUpdating ? "rounded border pl-2" : "bg-inherit pl-2"}`}
                    style={{ flex: 0.65 }}
                  />
                </div>
                <div>
                  {isUpdating && (
                    <Interests
                      userInterestsArray={userInterestsArray}
                      setUserInterestsArray={setUserInterestsArray}
                      onInterestsChange={handleInterestsChange}
                    />
                  )}
                </div>

                <div className="flex justify-between text-2xl font-bold">
                  <p>Interests</p>
                </div>
                <div>
                  {userInterests &&
                    userInterests
                      .split(",")
                      .map((interest, index) => (
                        <div key={index}>{interest.trim()}</div>
                      ))}
                </div>

                {isUpdating && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      onClick={handleProfileUpdate}
                      className="rounded bg-cyan-600 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
          <AnimatePresence>
            {isProfileUpdated && (
              <motion.div
                initial={{ x: 5000, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1.2 }}
                exit={{ x: 1000, transition: { duration: 3 } }}
                layout
                className="fixed bottom-4 right-4 z-50 rounded-lg border border-black bg-white px-4 py-3 font-semibold text-black shadow-xl"
              >
                Your profile has been updated! 🚀
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
