import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Clock, CheckCircle, ChevronRight, BarChart2, FileText, Book, Send } from "lucide-react"
import { useLocation,useNavigate } from 'react-router-dom';
const ModuleGeneration = () => {
  const location = useLocation(); // Get the state passed from the previous page
  const courseData = location?.state;
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const handleSpanClick = async (moduleName) => {
    try {
      setSelectedModule(moduleName);
      setLoading(true);

      console.log(setSelectedModule)
      const result = await axios.get(`http://127.0.0.1:8000/agent/generate-chapters?course_name=${encodeURIComponent(courseData.courseTitle)}&module_title=${encodeURIComponent(moduleName)}`);
      setResponse(result.data);
    } catch (error) {
      console.error('Error submitting course name:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const handleChapterClick = (chapter) => {
    console.log('Clicked Chapter:', chapter);  // Debug log to check the structure
     console.log(chapter.chapter_title,"hello")
    navigate('/chapters', {
      state: {
        courseTitle: courseData.courseTitle,
        moduleNames: courseData.module_title,
        selectedModule: selectedModule,
        chapterTitle: chapter.chapter_title,
        chapterSummary: chapter.chapter_summary,
        learningFlow: chapter.learning_flow, // Accessing the correct learning flow
      },
    });
    
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold">AILearn</h1>

          <nav className="flex items-center space-x-6">
            <a href="#" className="flex items-center space-x-2">
              <span className="text-sm">Courses</span>
            </a>
            <a href="#" className="flex items-center space-x-2">
              <span className="text-sm">My Learning</span>
            </a>
            <a href="#" className="flex items-center space-x-2">
              <span className="text-sm">Resources</span>
            </a>
            <a href="#" className="flex items-center space-x-2">
              <span className="text-sm">Community</span>
            </a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-xs">JD</span>
            </div>
            <span className="text-sm">John Doe</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 gap-16">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h2 className="text-lg font-medium mb-4">
            <h1 className="text-2xl font-bold mb-6"> {courseData.courseTitle}</h1></h2>

          <div className="space-y-6">
            {courseData?.module_title?.map((moduleName, index) => (
              <div className="space-y-1 border border-gray-600 rounded-lg p-3 mb-4 hover:bg-gray-700 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleSpanClick(moduleName)} className='text-left w-full text-sm font-medium text-white'>
                      {moduleName}
                    </button>
                  </div>
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                </div>
                <div className="h-1 bg-blue-400 rounded-full" />
              </div>
            ))}
          </div>

        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6  justify-center">
          <div className="w-full max-w-screen-xl">
            <h1 className="text-3xl font-bold mb-4">{selectedModule || 'Select a Module'}</h1>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-full bg-gray-700 h-2 rounded-full">
                <div className="bg-blue-500 h-2 rounded-full w-1/3" />
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400 mb-8">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>12 weeks</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Advanced</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Dr. Sarah Johnson</span>
              </div>
            </div>

            <div className="flex space-x-2 mb-6">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Content</button>
              <button className="bg-gray-700 text-white px-4 py-2 rounded-md">Quizzes</button>
              <button className="bg-gray-700 text-white px-4 py-2 rounded-md">Assignments</button>
              <button className="bg-gray-700 text-white px-4 py-2 rounded-md">Projects</button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search in course..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-sm"
              />
            </div>

            <div className="flex items-center space-x-2 text-sm mb-6">
              <span>{courseData.courseTitle}</span>
              <ChevronRight className="h-4 w-4 text-gray-500" />
              <span>{selectedModule || 'Select a Module'}</span>

            </div>

            {loading ? (
              <div className="text-center text-gray-400">Loading chapters...</div>
            ) : (
              <div>
                {response?.chapters?.map((chapter, index) => {
                 
                  return (
                  
                      <div key={index} className="bg-gray-800 rounded-lg p-4 mb-6 "onClick={() => handleChapterClick(chapter)}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <BarChart2 className="h-5 w-5 text-blue-400" />
                            <h3 className="text-lg font-medium">{chapter.chapter_title}</h3>
                          </div>
                          <div className="flex items-center">
                            <div className="relative h-12 w-12">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-medium">45%</span>
                              </div>
                              <svg className="h-12 w-12" viewBox="0 0 36 36">
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#2563EB"
                                  strokeWidth="3"
                                  strokeDasharray="45, 100"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-400 mb-2">{chapter.chapter_summary}</p>


                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-400" />
                            <span className="text-xs">
                              Quizzes: <span className="text-blue-400">2/6</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Book className="h-4 w-4 text-blue-400" />
                            <span className="text-xs">
                              Content: <span className="text-blue-400">6/12</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-400" />
                            <span className="text-xs">
                              Assignments: <span className="text-blue-400">1/3</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Book className="h-4 w-4 text-blue-400" />
                            <span className="text-xs">
                              Workbook: <span className="text-blue-400">2/4</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end mt-2">
                          <span className="text-xs text-gray-400">4h remaining</span>
                        </div>
                      </div>);
                  })}
              </div>
            )}</div>
        </main>

        {/* Right Sidebar - AI Assistant */}
        <aside className="w-72 bg-gray-800 border-l border-gray-700 p-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
              <span className="text-xs">AI</span>
            </div>
            <h2 className="text-lg font-medium">AI Assistant</h2>
          </div>

          <div className="space-y-4 mb-6">
            <button className="w-full flex items-center space-x-3 bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-lg">?</span>
              </div>
              <span className="text-sm">Ask a Question</span>
            </button>

            <button className="w-full flex items-center space-x-3 bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition">
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="text-lg">💡</span>
              </div>
              <span className="text-sm">Summarize Content</span>
            </button>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
                <span className="text-xs">AI</span>
              </div>
              <p className="text-sm">How can I help you with Machine Learning concepts?</p>
            </div>

            <div className="flex space-x-2 mb-2">
              <button className="bg-gray-600 text-xs px-3 py-1 rounded">Explain concepts</button>
              <button className="bg-gray-600 text-xs px-3 py-1 rounded">Show examples</button>
            </div>
          </div>

          <div className="relative mt-auto">
            <input
              type="text"
              placeholder="Type your question..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-4 pr-10 text-sm"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Send className="h-4 w-4 text-blue-400" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
export default ModuleGeneration;