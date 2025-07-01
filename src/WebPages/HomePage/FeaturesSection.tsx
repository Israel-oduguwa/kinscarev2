// app/components/FeaturesSection.tsx
"use client"
import Link from "next/link";
import { motion } from "framer-motion";

const FeaturesSection = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const benefits = [
    {
      title: "Hire the Right Caregiver with Confidence",
      description: "Finding reliable caregivers shouldn't be difficult. Kinscare connects you with qualified local caregivers and CNAs ready to work in adult family homes, assisted living and nursing home, home care, and beyond.",
      items: [
        {
          icon: (
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          title: "View Caregiver Profiles & Contact Details",
          color: "bg-blue-100"
        },
        {
          icon: (
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "Reduce Turnover with Better-Matched Hires",
          color: "bg-green-100"
        },
        {
          icon: (
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          ),
          title: "Join Discussions & Connect Directly",
          color: "bg-purple-100"
        }
      ],
      buttonText: "Start Matching With Caregivers →",
      image: "https://firebasestorage.googleapis.com/v0/b/climare-pushbots.appspot.com/o/caregiver%20final%20(1).png?alt=media&token=30bc0150-58b7-4f59-8b51-57968abe482c",
      reverse: false
    },
    {
      title: "Find Jobs That Match Your Skills & Availability",
      description: "Looking for a full-time, part-time, live-in, or on-call caregiving job? KinsCare helps you connect directly with employers so you can choose the best opportunity for you.",
      items: [
        {
          icon: (
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          title: "Apply for jobs in minutes",
          color: "bg-blue-100"
        },
        {
          icon: (
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "Get discovered by local employers",
          color: "bg-green-100"
        },
        {
          icon: (
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          ),
          title: "Advance your career with healthcare training opportunities",
          color: "bg-purple-100"
        }
      ],
      buttonText: "Find Jobs That Match Your Skill Now",
      image: "https://firebasestorage.googleapis.com/v0/b/climare-pushbots.appspot.com/o/Provider%20Group%20(1).png?alt=media&token=aee75ff2-5344-49d4-986a-dd4f7125fc30",
      reverse: true
    },
    {
      title: "Your First Step Toward a Career in Nursing or Allied Healthcare",
      description: "Thinking about becoming an LPN, RN, or allied healthcare professional? Many programs require direct patient care experience—and caregiving can be your stepping stone into the field.",
      items: [
        {
          icon: (
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          title: "Learn about nursing & allied healthcare programs",
          color: "bg-blue-100"
        },
        {
          icon: (
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "Find local employers who offer training & tuition support",
          color: "bg-green-100"
        },
        {
          icon: (
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          ),
          title: "Connect with professionals & get career guidance",
          color: "bg-purple-100"
        }
      ],
      buttonText: "Start exploring your future in healthcare →",
      image: "https://firebasestorage.googleapis.com/v0/b/exhct2004.appspot.com/o/iStock-1792043615-min%20(1).jpg?alt=media&token=88e040f7-a86a-44ee-8108-bd3ffb5b3f06",
      reverse: false
    }
  ];

  return (
    <section className="bg-white relative py-20 md:py-30 overflow-hidden dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-center mb-16 md:mb-24"
        >
          <motion.h2 
            variants={fadeIn}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Empowering <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">care</span>, simplifying connections
          </motion.h2>
          <motion.p 
            variants={fadeIn}
            className="text-xl text-slate-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            #1 best platform for providers to find qualified caregivers
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="space-y-24 md:space-y-32"
        >
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              variants={fadeIn}
              className={`flex flex-col ${benefit.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-16 items-center`}
            >
              {/* Text Content */}
              <div className="lg:w-1/2">
                <motion.h3 
                  variants={fadeIn}
                  className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6"
                >
                  {benefit.title}
                </motion.h3>
                
                <motion.p 
                  variants={fadeIn}
                  className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                >
                  {benefit.description}
                </motion.p>
                
                <motion.div 
                  variants={staggerContainer}
                  className="space-y-4 mb-10"
                >
                  {benefit.items.map((item, itemIndex) => (
                    <motion.div 
                      key={itemIndex}
                      variants={fadeIn}
                      className="group p-4 rounded-xl transition-all hover:bg-indigo-50/50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`${item.color} rounded-lg p-2 flex-shrink-0 mt-1`}>
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                <motion.div variants={fadeIn}>
                  <Link 
                    href="/find-caregivers" 
                    className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1"
                  >
                    {benefit.buttonText}
                  </Link>
                </motion.div>
              </div>
              
              {/* Image */}
              <div className="lg:w-1/2">
                <motion.div 
                  variants={fadeIn}
                  className="relative"
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-xl border-8 border-white dark:border-gray-800">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-80 md:h-96" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">Featured</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-10 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-40 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-10 animate-blob animation-delay-4000"></div>
    </section>
  );
};

export default FeaturesSection;