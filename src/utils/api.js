import { supabaseAuth } from "./supabaseClient";

export const fetchCurrentUserID = async () => {
  try {
    const { data, error } = await supabaseAuth.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
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
