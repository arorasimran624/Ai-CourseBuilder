import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const CourseGeneration = () => {
  const [courseName, setCourseName] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const handleSubmit = async () => {
    
    try {
      setLoading(true); 
      const result = await axios.get(`http://localhost:8000/agent/module-metadata?course_name=${encodeURIComponent(courseName)}`);
      setResponse(result.data);
      const moduleTitles = result.data.course.levels.flatMap(level =>
        level.modules.map(module => module.module_title)
      );
      
      navigate('/modules', {
        state: {
          courseTitle: result.data.course.course_title,
          module_title: moduleTitles
          
        },
      });
    }
    catch (error) {
      console.error('Error submitting course name:', error);
    }finally {
      setLoading(false); // Stop loader
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-[#0f1117] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-5 border-b border-white/10">
        <div className="text-2xl font-bold">CourseFind</div>
        <nav>
          <ul className="flex gap-8">
            <li><a href="#" className="text-white hover:text-blue-500 transition-colors">Home</a></li>
            <li><a href="#" className="text-white hover:text-blue-500 transition-colors">Courses</a></li>
            <li><a href="#" className="text-white hover:text-blue-500 transition-colors">About</a></li>
            <li><a href="#" className="text-white hover:text-blue-500 transition-colors">Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-10 py-10 flex flex-col items-center gap-20">
        {/* Hero Section */}
        <section className="text-center max-w-3xl w-full">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Course</h1>
          <p className="text-white/70 mb-10">Select your preferences to discover tailored course recommendations</p>

          {/* Course Finder Form */}
          <div className="bg-[#1e222d]/50 rounded-lg p-8 w-full max-w-2xl mx-auto">
            <div className="mb-5 text-left">
              <label className="block mb-2 font-medium">Course Name</label>
              <input
                type="text"
                placeholder="Enter Course"
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full p-3 rounded bg-white/10 border-0 text-white placeholder-white/50"
              />
            </div>

            <div className="mb-5 text-left">
              <label className="block mb-2 font-medium">Course Duration</label>
              <select className="w-full p-3 rounded bg-white/10 border-0 text-white appearance-none">
                <option>Select duration</option>
                <option>1-3 months</option>
                <option>3-6 months</option>
                <option>6-12 months</option>
                <option>1+ year</option>
              </select>
            </div>

            <div className="mb-5 text-left">
              <label className="block mb-2 font-medium">Experience Level</label>
              <div className="flex gap-3">
                <button className="flex-1 p-3 border border-white/20 bg-white/5 text-white rounded hover:bg-white/10 transition-colors">
                  Beginner
                </button>
                <button className="flex-1 p-3 border border-white/20 bg-white/5 text-white rounded hover:bg-white/10 transition-colors">
                  Intermediate
                </button>
                <button className="flex-1 p-3 border border-white/20 bg-white/5 text-white rounded hover:bg-white/10 transition-colors">
                  Advanced
                </button>
              </div>
            </div>

            <button onClick={handleSubmit} className="w-full p-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition-colors">
            {loading ? "Generating..." : "Find Courses"}
            </button>
          </div>
        </section>

        {/* Recommended Courses Section */}
        <section className="w-full max-w-6xl">
          <h2 className="text-3xl font-bold mb-8">Recommended Courses</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <div className="bg-[#1e222d]/50 rounded-lg overflow-hidden transition-transform hover:-translate-y-1">
              <div className="h-48 overflow-hidden">
                <img
                  src="/placeholder.svg?height=200&width=400"
                  alt="Web Development"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">Web Development Fundamentals</h3>
                <div className="flex gap-4 mb-3 text-white/70 text-sm">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    3-6 months
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Beginner
                  </span>
                </div>
                <p className="text-sm mb-4">Learn the basics of web development including HTML, CSS, and JavaScript.</p>
                <button className="w-full p-2.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors">
                  Learn More
                </button>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="bg-[#1e222d]/50 rounded-lg overflow-hidden transition-transform hover:-translate-y-1">
              <div className="h-48 overflow-hidden">
                <img
                  src="/placeholder.svg?height=200&width=400"
                  alt="Data Science"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">Data Science Essentials</h3>
                <div className="flex gap-4 mb-3 text-white/70 text-sm">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    6-12 months
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Intermediate
                  </span>
                </div>
                <p className="text-sm mb-4">Master data analysis, visualization, and machine learning fundamentals.</p>
                <button className="w-full p-2.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors">
                  Learn More
                </button>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="bg-[#1e222d]/50 rounded-lg overflow-hidden transition-transform hover:-translate-y-1">
              <div className="h-48 overflow-hidden">
                <img
                  src="/placeholder.svg?height=200&width=400"
                  alt="UI/UX Design"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">Advanced UI/UX Design</h3>
                <div className="flex gap-4 mb-3 text-white/70 text-sm">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    3-6 months
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Advanced
                  </span>
                </div>
                <p className="text-sm mb-4">Create sophisticated user interfaces and enhance user experiences.</p>
                <button className="w-full p-2.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex justify-between items-center px-10 py-5 border-t border-white/10">
        <div className="text-white/70 text-sm">
          © 2024 CourseFind. All rights reserved.
        </div>
        <div className="flex gap-5">
          <a href="#" aria-label="Twitter" className="text-white/70 hover:text-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </a>
          <a href="#" aria-label="GitHub" className="text-white/70 hover:text-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
          <a href="#" aria-label="LinkedIn" className="text-white/70 hover:text-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default CourseGeneration;