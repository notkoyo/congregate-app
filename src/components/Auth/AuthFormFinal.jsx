"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseAuth } from "../../utils/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";

import { EyeFilledIcon } from "../Icons/_eye-icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "../Icons/_eye-icons/EyeSlashFilledIcon";
import {
  Button,
  Progress,
  Input,
  Divider,
  Link,
  Tooltip,
} from "@nextui-org/react";
import GoogleIcon from "../Icons/GoogleIcon";
import GitHubIcon from "../Icons/GitHubIcon";
import { QuestionMarkIcon } from "../Icons/Icons";
import { fetchUserData } from "@/utils/api";
import { useLogin } from "../loginContext";
// import FacebookIcon from "../Icons/FacebookIcon";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isProgressVisible, setIsProgressVisible] = useState(false);
  const [isPasswordModal, setIsPasswordModal] = useState(false);
  const [isInfoIncorrect, setIsInfoIncorrect] = useState(false);

  const [isNewUser, setIsNewUser] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSignupError, setIsSignupError] = useState(false);

  const router = useRouter();

  const { setIsLoggedIn } = useLogin();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
    });
    if (!error) {
      setIsSigningUp(true);
      setIsSigningIn(false);
      setEmail("");
      setPassword("");
      setIsNewUser(false);
      setPasswordStrength(0);
      setTimeout(() => setIsSigningUp(false), 7000);
    } else if (error) {
      setIsSignupError(true);
      setTimeout(() => setIsSignupError(false), 7000);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      // check if user exists that satisfies auth.user.id === public.user.auth_id
      const userPublic = await fetchUserData(data.user.id);
      console.log(userPublic);
      if (userPublic) {
        console.log(userPublic);

        setIsLoggedIn(true);
        router.push("/profile");
      } else {
        router.push("/profile/create");
      }
    } else {
      setIsInfoIncorrect(true);
      setIsSigningIn(false);
      setIsSigningUp(false);
    }
  };

  const handleFacebook = async () => {
    const { user, session, error } = await supabaseAuth.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `http://localhost:3000/auth/callback`,
      },
    });
    if (!error) {
      router.push("/profile");
    }
  };

  const handleGitHub = async () => {
    const { user, session, error } = await supabaseAuth.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `http://localhost:3000/auth/callback`,
      },
    });
    if (!error) {
      router.push("/profile");
    }
  };

  const handleGoogle = async () => {
    const { user, session, error } = await supabaseAuth.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `http://localhost:3000/auth/callback`,
      },
    });
    if (!error) {
      router.push("/profile");
    }
  };

  let signInMessage = "Login";

  isNewUser ? (signInMessage = "Sign Up") : undefined;

  const validateEmail = (email) =>
    email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);

  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
    if (newEmail === "") {
      setIsEmailValid(true);
    } else {
      setIsEmailValid(validateEmail(newEmail));
    }
  };

  let complexityScore = 0;

  const toggleVisibility = () => setIsProgressVisible(!isProgressVisible);

  const validatePassword = (password) =>
    password.match(
      /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[\d].*[\d])(?=.*[a-z].*[a-z].*[a-z]).{8,}$/g,
    );

  const testComplexity = (password) => {
    complexityScore += /(?=.*[a-z].*[a-z].*[a-z])/g.test(password) ? 25 : 0;
    complexityScore += /(?=.*[A-Z].*[A-Z])/g.test(password) ? 25 : 0;
    complexityScore += /(?=.*[!@#$&*])/g.test(password) ? 25 : 0;
    complexityScore += /(?=.*[\d].*[\d])/g.test(password) ? 25 : 0;
  };

  const handlePasswordChange = (newPassword) => {
    testComplexity(newPassword);
    newPassword === ""
      ? setPasswordStrength(0)
      : setPasswordStrength(complexityScore);
    setPassword(newPassword);
    newPassword === ""
      ? setIsPasswordValid(true)
      : setIsPasswordValid(validatePassword(newPassword));
  };

  return (
    <form
      onSubmit={isNewUser ? handleSignUp : handleLogin}
      className="flex flex-col gap-4 font-satoshi"
    >
      <h2 className="mb-10 text-center text-2xl font-bold">
        {isNewUser ? "Create an account" : "Login"}
      </h2>
      <Input
        isClearable
        isRequired
        value={email}
        type="email"
        label="Email"
        variant="faded"
        isInvalid={isSigningUp && !isEmailValid ? true : false}
        color={
          !isNewUser
            ? "default"
            : email !== ""
              ? isEmailValid
                ? "success"
                : "danger"
              : "default"
        }
        errorMessage={
          isNewUser && !isEmailValid ? "Please enter a valid email" : ""
        }
        onValueChange={handleEmailChange}
        className="max-w-xs font-medium"
      />
      <div className="flex items-center gap-4">
        <Input
          isRequired
          value={password}
          label="Password"
          variant="faded"
          endContent={
            <div>
              <button
                className="focus:outline-none"
                type="button"
                onClick={toggleVisibility}
              >
                {isProgressVisible ? (
                  <EyeSlashFilledIcon className="pointer-events-none text-2xl text-default-400" />
                ) : (
                  <EyeFilledIcon className="pointer-events-none text-2xl text-default-400" />
                )}
              </button>
            </div>
          }
          type={isProgressVisible ? "text" : "password"}
          isInvalid={isSigningUp && !isPasswordValid ? true : false}
          color={
            !isNewUser
              ? "default"
              : password !== ""
                ? isPasswordValid
                  ? "success"
                  : "danger"
                : "default"
          }
          errorMessage={
            isNewUser && !isPasswordValid ? "Please enter a valid password" : ""
          }
          onValueChange={handlePasswordChange}
          className="max-w-xs font-medium"
        />
        {isNewUser && (
          <Tooltip
            isOpen={isPasswordModal}
            onOpenChange={(open) => setIsPasswordModal(open)}
            content={
              <div className="p-2 text-center font-satoshi">
                <h6 className="py-2 font-semibold">Password Requirements</h6>
                <ul className="font-medium">
                  <li>
                    3 Lowercase Characters{" "}
                    <span className="font-bold">(a-z)</span>
                  </li>
                  <li>
                    2 Uppercase Characters{" "}
                    <span className="font-bold">(A-Z)</span>
                  </li>
                  <li>
                    1 Special Character{" "}
                    <span className="font-bold">(!,@,$,&,*)</span>
                  </li>
                  <li>
                    2 Numbers <span className="font-bold">(0-9)</span>
                  </li>
                </ul>
              </div>
            }
          >
            <Button isIconOnly>
              <QuestionMarkIcon />
            </Button>
          </Tooltip>
        )}
      </div>
      {isNewUser && (
        <Progress
          aria-label="password strength bar"
          className={passwordStrength > 0 ? "" : "hidden"}
          color={passwordStrength === 100 ? "success" : "danger"}
          size="sm"
          value={passwordStrength}
        />
      )}
      {isNewUser ? (
        <div className="my-1 flex justify-center gap-1">
          <p className="cursor-default text-sm">Already have an account?</p>
          <Link
            className="cursor-pointer text-sm font-medium"
            onPress={() => setIsNewUser(false)}
          >
            Login
          </Link>
        </div>
      ) : (
        <div className="my-1 flex justify-center gap-1">
          <p className="cursor-default text-sm">Don't have an account?</p>
          <Link
            className="cursor-pointer text-sm font-medium"
            onPress={() => setIsNewUser(true)}
          >
            Sign Up
          </Link>
        </div>
      )}
      <AnimatePresence>
        {isSigningUp && (
          <motion.div
            key="signupNotification"
            initial={{ x: 5000, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 3 }}
            exit={{ x: 5000, transition: { duration: 6 } }}
            layout
            className="fixed bottom-4 right-4 z-50 rounded-lg border border-black bg-white px-4 py-3 font-semibold text-black shadow-xl"
          >
            Email sent! Check your email to confirm sign up. 🚀
          </motion.div>
        )}
        {isSignupError && (
          <motion.div
            key="signupErrorNotification"
            initial={{ x: 5000, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 3 }}
            exit={{ x: 5000, transition: { duration: 6 } }}
            layout
            className="fixed bottom-4 right-4 z-50 rounded-lg border border-red-500 bg-white px-4 py-3 font-semibold text-black shadow-xl"
          >
            Error signing up, please try again later. 😔
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        isLoading={isSigningIn}
        type="submit"
        variant="ghost"
        color="primary"
        className="font-semibold text-black"
      >
        {signInMessage}
      </Button>
      {isInfoIncorrect && (
        <div className="max-w-xs">
          <p className="text-center text-tiny text-red-500">
            Incorrect password or email, please try again.
          </p>
        </div>
      )}
      <Divider className="my-5" />
      <Button
        className="bg-white font-semibold text-black"
        color="primary"
        variant="ghost"
        onPress={handleGoogle}
        endContent={<GoogleIcon />}
      >
        Login with Google
      </Button>
      <Button
        className="bg-white font-semibold text-black"
        color="primary"
        variant="ghost"
        onPress={handleGitHub}
        endContent={<GitHubIcon />}
      >
        Login with GitHub
      </Button>
      {/*<Button onPress={handleFacebook} endContent={<FacebookIcon />}>
        Login with Facebook
        </Button>*/}
    </form>
  );
}
