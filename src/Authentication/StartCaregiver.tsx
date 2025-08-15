"use client";
import React, { useState, useContext } from "react";
import MongoContext from "@/app/MongoContext";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { cn, fetchUserData } from "@/lib/utils";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import TagManager from "react-gtm-module";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";

// Validation schema for the email signup form
const schema = yup.object().shape({
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

function StartCaregiver() {
  const {
    app,
    client,
    user,
    setAuthenticated,
    setUser,
    setUserData,
    userData,
  }: any = useContext(MongoContext);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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
          role: "caregiver",
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
          setUserData(fetchedData.result);
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
          router.push(`/vitae/jobs/all`);
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

  const handleFacebookCallback = (response: any) => {
    if (response?.status === "unknown") {
      toast({
        variant: "destructive",
        description: "Facebook Login Failed. Please try again.",
      });
      return;
    }
    // console.log(response);
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const email = data.email.toLowerCase();
      const password = data.password;
      await app.emailPasswordAuth.registerUser({ email, password });
      const credentials = Realm.Credentials.emailPassword(email, password);
      await app.logIn(credentials);
      if (app.currentUser) {
        setUser(app.currentUser);
        await app.currentUser.refreshCustomData();
        const payload = {
          tel: data.tel,
          role: data.role,
          fname: data.fname,
          lname: data.lname,
          userID: app.currentUser.id,
          email,
          auth_mode: "local-userpass",
        };
        await createUserDuringRegistration(payload);
        const providerUserID = app.currentUser.id;
        const emails = app.currentUser.email;
        const user_data = await fetchUserData(providerUserID, emails);
        if (user_data) {
          setUserData(user_data.result);
          app.currentUser.refreshCustomData();
          user.refreshCustomData();
          router.refresh();
          router.push(`/vitae/jobs/all`);
        }
      }
      setLoading(false);
    } catch (error) {
      handleError(error);
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const targetSection = document.getElementById("find-caregiver-jobs");
    if (targetSection) {
      const startingY = window.scrollY;
      const targetY = targetSection.offsetTop - 60; // adjust if needed
      const distance = targetY - startingY;
      let start = null;
      const easeInOutQuad = (t) =>
        t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) * (t - 1);

      const animation = (timestamp) => {
        if (start === null) start = timestamp;
        const time = (timestamp - start) / 100;
        const easedTime = easeInOutQuad(time);
        let newY = startingY + distance * easedTime;
        if (newY > targetY) newY = targetY;
        window.scrollTo(0, newY);
        if (time < 1) requestAnimationFrame(animation);
      };
      requestAnimationFrame(animation);
    }
  };

  return (
    <div className="py-4 bg-gray-50">
    {/* Hero Section */}
    <section
      id="find-caregiver-jobs"
      className="relative w-full bg-cover bg-no-repeat"
      style={{
        backgroundImage:
          "url('https://firebasestorage.googleapis.com/v0/b/career-awesome-ac470.appspot.com/o/RED%20hue%20fing%20caregvers.svg?alt=media&token=83121d84-9a7e-46b2-ad0d-b76ff20e84e5')",
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
  
      <div className="container mx-auto py-24 relative z-10 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
          Looking for a caregiver job?
        </h1>
        <h4 className="mt-6 text-lg md:text-2xl text-gray-200 font-light">
          Sign up now to find:
        </h4>
        <div className="space-y-3 mt-6 text-lg font-semibold text-gray-100">
          <p>Jobs in hospitals, clinics, nursing homes, and home care agencies.</p>
          <p>Full-time, part-time, live-in, one-on-one, and on-call jobs.</p>
          <p>CNA, HCA, NAR, and companion/sitter jobs.</p>
        </div>
        <button className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-lg font-medium rounded-lg shadow-md transition">
          New caregiver jobs are posted daily!
        </button>
      </div>
    </section>
  
    {/* Features Section */}
    <section className="mt-16">
      <div className="container mx-auto px-6">
        <div className="bg-white shadow-lg rounded-lg p-10">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-gray-800">
            Why Use Kinscare?
          </h2>
          <p className="text-center text-lg text-gray-600 mt-4">
            We focus on caregivers and help you find the best job opportunities faster.
          </p>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Feature 1 */}
            <div className="text-center bg-gray-100 rounded-lg p-6 shadow-sm transition transform hover:-translate-y-1">
              <div className="text-4xl text-blue-600 mb-4">
                <i className="fa-solid fa-inbox"></i>
              </div>
              <h6 className="font-semibold text-lg text-gray-700">
                Receive Job Offers
              </h6>
              <p className="text-gray-600 mt-2 text-sm">
                Get offers from top employers in hospitals, assisted living homes, and private residences.
              </p>
            </div>
  
            {/* Feature 2 */}
            <div className="text-center bg-gray-100 rounded-lg p-6 shadow-sm transition transform hover:-translate-y-1">
              <div className="text-4xl text-green-600 mb-4">
                <i className="fa-solid fa-phone"></i>
              </div>
              <h6 className="font-semibold text-lg text-gray-700">
                Contact Employers
              </h6>
              <p className="text-gray-600 mt-2 text-sm">
                Easily communicate with hiring managers and caregivers who match your profile.
              </p>
            </div>
  
            {/* Feature 3 */}
            <div className="text-center bg-gray-100 rounded-lg p-6 shadow-sm transition transform hover:-translate-y-1">
              <div className="text-4xl text-red-600 mb-4">
                <i className="fa-solid fa-location-crosshairs"></i>
              </div>
              <h6 className="font-semibold text-lg text-gray-700">
                Search & Apply
              </h6>
              <p className="text-gray-600 mt-2 text-sm">
                Browse thousands of jobs in different industries and apply instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  
    {/* FAQ Section */}
    <section className="mt-20 mb-10">
      <div className="container mx-auto px-6">
        <h2 className="text-center text-3xl font-bold text-gray-800">
          Frequently Asked Questions
        </h2>
        <div className="mt-6">
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-700">
              Do all caregiver jobs require a license?
            </h3>
            <p className="text-gray-600 mt-2 text-sm">
              Not all jobs require a license. Some employers offer in-house training and support for licensing.
            </p>
          </div>
  
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700">
              Does CNA work meet clinical requirements?
            </h3>
            <p className="text-gray-600 mt-2 text-sm">
              Yes, working as a CNA in hospitals or nursing homes can fulfill clinical work experience requirements.
            </p>
          </div>
        </div>
  
        <div className="mt-10 text-center">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg shadow-md transition">
            Find Jobs Now
          </button>
        </div>
      </div>
    </section>
  </div>
  
  );
}

export default StartCaregiver;
