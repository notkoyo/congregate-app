import { supabaseAuth } from "./supabaseClient";

export const fetchCurrentUserID = async () => {
  try {
    const { data, error } = await supabaseAuth.auth.getUser();

    if (data.user === null) {
      return null;
    } else if (data && data.user) {
      return data.user.id;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

export const fetchCurrentUserData = async () => {
  try {
    const { data, error } = await supabaseAuth.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
    } else if (data && data.user) {
      return data.user;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

export const fetchUserData = async (auth_id) => {
  try {
    if (!auth_id) {
      return null;
    }

    const { data, error } = await supabaseAuth
      .from("users")
      .select()
      .eq("auth_id", auth_id);
    if (error) {
      console.error("Error fetching user data:", error);
    } else {
      return data[0];
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

export const postUserData = async (userObject) => {
  try {
    const currentUser = await fetchCurrentUserData();

    userObject.email = currentUser.email;
    userObject.auth_id = currentUser.id;

    const { data, error } = await supabaseAuth
      .from("users")
      .insert(userObject)
      .select();
    if (error) {
      console.error("Error posting user data:", error);
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error posting user data:", error);
  }
};

export const fetchInterestsData = async () => {
  try {
    const { data, error } = await supabaseAuth.from("interests").select();
    if (error) {
      console.error("Error fetching interests data:", error);
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error fetching interests data:", error);
  }
};

export const postUserInterests = async (userInterestArray) => {
  try {
    const authID = await fetchCurrentUserID();
    const { id } = await fetchUserData(authID);
    // console.log(userData);
    // const id = userData.id;
    console.log(id);
    const interestsData = await fetchInterestsData();

    const userInterestObjects = [];

    userInterestArray.forEach((interestName) => {
      const { interest_id } = interestsData.find(
        (interestsObject) => interestsObject.interest === interestName,
      );
      const finalObject = {
        user_id: id,
        interest_id: interest_id,
      };
      userInterestObjects.push(finalObject);
    });

    const { data, error } = await supabaseAuth
      .from("user_interests")
      .insert(userInterestObjects)
      .select();
    if (error) {
      console.error("Error posting user_interests data:", error);
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error posting user_interests data:", error);
  }
};

export const fetchVenueDataByID = async (venue_id) => {
  try {
    const { data, error } = await supabaseAuth
      .from("venues")
      .select()
      .eq("venue_id", venue_id);
    if (error) {
      console.error("Error fetching venue data:", error);
    } else {
      return data[0];
    }
  } catch (error) {
    console.error("Error fetching venue data:", error);
  }
};

export const postEventAttendee = async (event_id) => {
  try {
    const currentUserID = await fetchCurrentUserID();
    const currentUser = await fetchUserData(currentUserID);

    const userObject = {
      user_id: currentUser.id,
      event_id: event_id,
    };

    const { data, error } = await supabaseAuth
      .from("event_attendees")
      .insert(userObject)
      .select();
    if (error) {
      console.error("Error posting event attendee data:", error);
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error posting event attendee data:", error);
  }
};

export const deleteEventAttendee = async (event_id) => {
  try {
    const currentUserID = await fetchCurrentUserID();
    const currentUser = await fetchUserData(currentUserID);

    const { data, error } = await supabaseAuth
      .from("event_attendees")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("event_id", event_id)
      .select();
    if (error) {
      console.error("Error deleting event attendee data:", error);
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error deleting event attendee data:", error);
  }
};

export const isUserBookedOn = async (event_id) => {
  try {
    const currentUserID = await fetchCurrentUserID();

    if (!currentUserID) {
      return false;
    }

    const currentUser = await fetchUserData(currentUserID);

    const { data, error } = await supabaseAuth
      .from("event_attendees")
      .select()
      .eq("user_id", currentUser.id)
      .eq("event_id", event_id);

    if (data.length === 0) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error("Error selecting event attendee data:", error);
  }
};
