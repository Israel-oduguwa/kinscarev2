"use client";
import MongoContext from "@/app/MongoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { cn, fetchUserData } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as Realm from "realm-web";
import * as yup from "yup";

const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const signupSchema = yup.object().shape({
  fname: yup.string().required("First name is required"),
  lname: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  tel: yup.string().required("Phone number is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  terms: yup.bool().oneOf([true], "You must accept the Terms and Conditions"),
});

function AdminAuthentication() {
  const {
    app,
    client,
    user,
    setAuthenticated,
    setUser,
    setUserData,
  }: any = useContext(MongoContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const loginForm = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      fname: "",
      lname: "",
      email: "",
      tel: "",
      password: "",
      terms: false,
    },
  });

  // console.log(signupForm.watch());

  const handleError = (error: any) => {
    console.error("An error occurred:", error);
    toast({
      variant: "destructive",
      className: cn(
        "top-0 right-0 flex fixed md:max-w-[640px] md:top-4 md:right-4"
      ),
      description: error?.message || "An error occurred. Please try again.",
      action: <ToastAction altText="Try again">Try again</ToastAction>,
    });
    setLoading(false);
  };

  const createUserDuringRegistration = async (payload: any) => {
    try {
      const response = await axios.get("/api/ip");
      if (response.data) {
        const {
          ip,
          city,
          latitude,
          longitude,
          country_code,
          region_name,
          zip,
        } = response.data;
        Object.assign(payload, {
          route: "Regular",
          userIp: ip,
          zipcode: zip,
          address: `${city}, ${region_name}, ${country_code}`,
          geocode_address: { lng: longitude, lat: latitude },
          city,
          returning: false,
          role: "admin",
          signup_route: "start",
        });

        await axios.post(
          "https://kinscare-backend.onrender.com/api/v1/auth/create_user",
          payload
        );
        setAuthenticated(true);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    const token = response.credential;
    if (token) {
      try {
        setLoading(true);
        const decodedToken: any = jwtDecode(token);
        const credentials = Realm.Credentials.jwt(token);
        const userObj = await app.logIn(credentials);

        const existingUser = await client
          ?.db("kinshealth")
          .collection("contacts")
          .findOne({
            userID: userObj.id,
            email: userObj.profile.email,
          });

        if (!existingUser) {
          const payload = {
            email: userObj.profile.email,
            userID: userObj.id,
            profileImage: decodedToken.picture,
            fname: decodedToken.given_name,
            lname: decodedToken.family_name,
            verified: decodedToken.email_verified,
            auth_mode: "oauth2-google",
            googleId: userObj.identities[0].id,
            route: "Regular",
            created: new Date(),
          };
          await createUserDuringRegistration(payload);
          const fetchedData: any = await fetchUserData(
            userObj.id,
            userObj.profile.email
          );
          setUser(userObj);
          setUserData(fetchedData.result);
          router.push(`/admin/blog/all`);
        } else {
          const fetchedData: any = await fetchUserData(
            userObj.id,
            userObj.profile.email
          );
          setUserData(fetchedData.result);
          setUser(userObj);
          setAuthenticated(true);
          user.refreshCustomData();
          router.refresh();
          if (fetchedData.result.role === "admin") {
            router.push(`/admin/blog/all`);
          } else {
            router.push(`/`);
          }
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleError = () => {
    toast({
      variant: "destructive",
      description: "Google Login Failed. Please try again.",
    });
  };

  const handleLogin = async (data: any) => {
    try {
      setLoading(true);
      const credentials = Realm.Credentials.emailPassword(
        data.email,
        data.password
      );
      const userObj = await app.logIn(credentials);
      setUser(userObj);
      const fetchedData: any = await fetchUserData(userObj.id, data.email);
      setUserData(fetchedData.result);
      setAuthenticated(true);
      if (fetchedData.result.role === "admin") {
        router.push("/admin/blog/all");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data: any) => {
    try {
      setLoading(true);
      const email = data.email.toLowerCase();
      const password = data.password;
      await app.emailPasswordAuth.registerUser({ email, password });
      const credentials = Realm.Credentials.emailPassword(email, password);
      const userObj = await app.logIn(credentials);
      setUser(userObj);
      const payload = {
        tel: data.tel,
        role: "admin",
        fname: data.fname,
        lname: data.lname,
        userID: userObj.id,
        email,
        auth_mode: "local-userpass",
      };
      await createUserDuringRegistration(payload);
      const fetchedData: any = await fetchUserData(userObj.id, email);
      setUserData(fetchedData.result);
      setAuthenticated(true);
      router.push("/admin/blog/all");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={`${process.env.GOOGLE_APP_ID}`}>
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
        <div className="rounded-lg shadow-xl p-8 bg-white w-full max-w-md text-center">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            Kinscare Admin
          </h3>
          <p className="text-gray-600 text-sm mt-2">Sign in as admin</p>

          {!loading ? (
            <div className="flex justify-center mt-6">
              <GoogleLogin
                size="large"
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                text="continue_with"
              />
            </div>
          ) : (
            <div className="flex justify-center mt-6">
              <Loader2 size={30} className="animate-spin" />
            </div>
          )}
        </div>

        <div className="text-center my-6 text-gray-500 text-sm">OR</div>

        <div className="rounded-lg shadow-xl bg-white w-full max-w-md p-8">
          {isLoginMode ? (
            <>
              <h3 className="text-xl font-bold text-center mb-4">
                Login with Email
              </h3>
              <form
                key="login"
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium"
                  >
                    Email Address
                  </label>
                  <Controller
                    name="email"
                    control={loginForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="login-email"
                        placeholder="Email Address"
                        className={`mt-1 ${
                          loginForm.formState.errors.email ? "border-red-500" : ""
                        }`}
                      />
                    )}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium"
                  >
                    Password
                  </label>
                  <Controller
                    name="password"
                    control={loginForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="login-password"
                        type="password"
                        placeholder="Password"
                        className={`mt-1 ${
                          loginForm.formState.errors.password
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                    )}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
                </Button>
              </form>
              {/* <p className="text-center mt-4">
                Don’t have an account?{" "}
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setIsLoginMode(false)}
                >
                  Sign up
                </span>
              </p> */}
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-center mb-4">
                Signup with Email
              </h3>
              <form
                key="signup"
                onSubmit={signupForm.handleSubmit(handleSignup)}
                className="space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label htmlFor="fname" className="block text-sm font-medium">
                      First Name
                    </label>
                    <Controller
                      name="fname"
                      control={signupForm.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="fname"
                          placeholder="First Name"
                          className={`mt-1 ${
                            signupForm.formState.errors.fname ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {signupForm.formState.errors.fname && (
                      <p className="text-red-500 text-xs mt-1">
                        {signupForm.formState.errors.fname.message}
                      </p>
                    )}
                  </div>

                  <div className="w-1/2">
                    <label htmlFor="lname" className="block text-sm font-medium">
                      Last Name
                    </label>
                    <Controller
                      name="lname"
                      control={signupForm.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="lname"
                          placeholder="Last Name"
                          className={`mt-1 ${
                            signupForm.formState.errors.lname ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {signupForm.formState.errors.lname && (
                      <p className="text-red-500 text-xs mt-1">
                        {signupForm.formState.errors.lname.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email Address
                  </label>
                  <Controller
                    name="email"
                    control={signupForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="email"
                        placeholder="Email Address"
                        className={`mt-1 ${
                          signupForm.formState.errors.email ? "border-red-500" : ""
                        }`}
                      />
                    )}
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="tel" className="block text-sm font-medium">
                    Phone Number
                  </label>
                  <Controller
                    name="tel"
                    control={signupForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="tel"
                        placeholder="123-456-7890"
                        className={`mt-1 ${
                          signupForm.formState.errors.tel ? "border-red-500" : ""
                        }`}
                      />
                    )}
                  />
                  {signupForm.formState.errors.tel && (
                    <p className="text-red-500 text-xs mt-1">
                      {signupForm.formState.errors.tel.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Controller
                    name="password"
                    control={signupForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        className={`mt-1 ${
                          signupForm.formState.errors.password
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                    )}
                  />
                  {signupForm.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Controller
                    name="terms"
                    control={signupForm.control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="checkbox"
                        className="h-5 w-5 text-blue-600"
                        value={field.value ? "true" : "false"}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                  <span className="text-sm">
                    I agree to the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      Terms and Conditions
                    </a>
                  </span>
                </div>
                {signupForm.formState.errors.terms && (
                  <p className="text-red-500 text-xs mt-1">
                    {signupForm.formState.errors.terms.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Signup"}
                </Button>
              </form>
              <p className="text-center mt-4">
                Already have an account?{" "}
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setIsLoginMode(true)}
                >
                  Login
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default AdminAuthentication;