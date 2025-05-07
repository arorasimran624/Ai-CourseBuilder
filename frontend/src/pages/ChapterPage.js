
import { useLocation } from 'react-router-dom'
import { Search, Zap, FileText, Clock, Link, MessageCircle, CheckCircle, Component } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import AlgorithmCard from '../components/AlgorithmCard'
import BulletPointsCard from '../components/BulletPoints';
import CaseStudyCard from '../components/CaseStudy';
import CommonMistakesCard from '../components/CommonMistakes';
import FlowchartCard from '../components/FlowChart';
import FormulasCard from '../components/Formulas';
import GlossaryCard from '../components/GlossaryCard';
import KeyPointsCard from '../components/KeyPoints';
import OverviewCard from '../components/Overview'
import ParagraphBlock from '../components/Paragraph'
import RealWorldExampleCard from '../components/RealWorld';
import TableCard from '../components/Table'
import TipsAndTricksCard from '../components/TipsTricks'
import TypesCard from '../components/TypeCard'
import UseCasesCard from '../components/UseCase';
const ChapterGeneration = () => {
    const location = useLocation(); // Get the state passed from the previous page

    const { courseTitle, moduleNames, selectedModule,chapterTitle, chapterSummary, learningFlow } = location.state || {};
    
    
    console.log('Chapter Data:', chapterTitle, chapterSummary, learningFlow);
    const [chapterContent, setChapterContent] = useState(null);
    const [loading, setLoading] = useState(false);
    if (!chapterTitle || !chapterSummary || !learningFlow) {
        console.error('Chapter data is missing or not passed correctly.');
        return <div>Chapter data is missing or not passed correctly.</div>;
    }
    const handleResourceClick = async (item) => {
        console.log(`Clicked on resource type: ${item.type}`);
        setLoading(true);         // Show loading spinner
        // setChapterContent(null);
        try {
            let response;
        
           
    
            switch (item.type) {
                case 'theory':
                    response = await axios.get(`http://127.0.0.1:8000/agent/generate-chapter-content?course_name=${encodeURIComponent(courseTitle)}&module_name=${encodeURIComponent(selectedModule)}&chapter_name=${encodeURIComponent(chapterTitle)}&block_title=${encodeURIComponent(item.title)}`);
                    break;
                case 'quiz':
                    response = await axios.get(`http://127.0.0.1:8000/agent/generate-chapters?course_name=${encodeURIComponent(courseTitle)}&module_title=${encodeURIComponent(moduleNames)}&chapter_title=${encodeURIComponent(chapterTitle)}&block_title=${encodeURIComponent(item.title)}`);
                    break;
                case 'assignment':
                    response = await axios.get(`http://127.0.0.1:8000/agent/generate-chapters?course_name=${encodeURIComponent(courseTitle)}&module_title=${encodeURIComponent(moduleNames)}&chapter_title=${encodeURIComponent(chapterTitle)}&block_title=${encodeURIComponent(item.title)}`);
                    break;
                case 'workbook':
                    response = await axios.get(`http://127.0.0.1:8000/agent/generate-chapters?course_name=${encodeURIComponent(courseTitle)}&module_title=${encodeURIComponent(moduleNames)}&chapter_title=${encodeURIComponent(chapterTitle)}&block_title=${encodeURIComponent(item.title)}`);
                    break;
                default:
                    console.warn('Unknown type:', item.type);
                    return;
            }
    
            console.log("Raw response data:", response.data);

            if (
                response.data.chapter_content &&
                Array.isArray(response.data.chapter_content) &&
                response.data.chapter_content.length > 0
            ) {
                setChapterContent(response.data.chapter_content);
            } else {
                setChapterContent([{ type: 'paragraph', data: 'Content type not supported yet.' }]);
            }
            
        } catch (error) {
            console.error('Error generating content:', error);
            setChapterContent([{ type: 'paragraph', data: 'Failed to load content. Please try again.' }]);

        }finally {
            setLoading(false);
        }
    };
    const componentMap = {
        overview: OverviewCard,
        paragraph: ParagraphBlock,
        key_points: KeyPointsCard,
        types: TypesCard,
        use_cases: UseCasesCard,
        table: TableCard,
        algorithm: AlgorithmCard,
        bullet_points: BulletPointsCard,
        case_study: CaseStudyCard,
        common_mistakes: CommonMistakesCard,
        flowchart: FlowchartCard,
        formulas: FormulasCard,
        glossary: GlossaryCard,
        real_world_example: RealWorldExampleCard,
        tips_and_tricks: TipsAndTricksCard,
      };
      
    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            {/* Navigation Bar */}
            <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-8">
                    <h1 className="text-xl font-bold">AI Course</h1>
                    <nav className="flex items-center space-x-6">
                        <a href="#" className="text-sm">Dashboard</a>
                        <a href="#" className="text-sm">My Courses</a>
                        <a href="#" className="text-sm">Resources</a>
                    </nav>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="bg-gray-700 rounded-md py-1 pl-8 pr-4 text-sm w-64"
                        />
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                        <div className="h-4 w-4">📶</div>
                        <div className="h-4 w-4">📡</div>
                        <div className="h-4 w-4">🔋</div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Left Sidebar */}
                <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4">
                    <h2 className="text-lg font-medium mb-4">
                        <h1 className="text-2xl font-bold mb-6"> {courseTitle}</h1></h2>

                    <div className="space-y-6">
                        {moduleNames.map((moduleName, index) => (
                            <div className="space-y-1 border border-gray-600 rounded-lg p-3 mb-4 hover:bg-gray-700 transition">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <button className='text-left w-full text-sm font-medium text-white'>
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
                <main className="flex-1 p-6 justify-center">
                    <div className="w-full max-w-screen-xl">
                        <div className="flex items-center space-x-2 mb-6">
                            <Zap className="h-5 w-5 text-blue-500" />
                            <h2 className="text-xl font-medium">{chapterTitle}</h2>
                        </div>

                        <div className="flex space-x-6 border-b border-gray-700 mb-6">
                            <button className="px-4 py-2 text-blue-500 border-b-2 border-blue-500">Content</button>
                            <button className="px-4 py-2 text-gray-400">Quizzes</button>
                            <button className="px-4 py-2 text-gray-400">Assignments</button>
                            <button className="px-4 py-2 text-gray-400">Projects</button>
                        </div>


                        <p className="text-gray-300 mb-6">
                            {chapterSummary}
                        </p>

                        {loading && (
        <div className="text-center mt-4 text-gray-600 font-semibold">
          Loading content...
        </div>
      )}

      {chapterContent && !loading && (
        <div className="space-y-4 mt-4">
          {chapterContent.map((block, index) => {
            const Component = componentMap[block.type];
            if (!Component) return null;
            return <Component key={index} data={block.data} />;
          })}
        </div>
      )}
                     
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className="w-72 bg-gray-800 border-l border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium">AI Assistant</h2>
                        <div className="flex space-x-2">
                            <button className="text-blue-500 underline text-sm">Resources</button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-md font-medium mb-3 text-white">Internal Resources</h3>

                        {learningFlow && learningFlow.map((item, index) => (
                            <div key={index}  onClick={() => handleResourceClick(item)}className="border border-gray-700 rounded-lg p-4 bg-gray-800 mb-3">
                                <div className="flex items-start space-x-3">
                                    {/* Icons for different types */}
                                    {item.type === 'theory' && <FileText className="h-4 w-4 text-blue-500 mt-1" />}
                                    {item.type === 'quiz' && <Clock className="h-4 w-4 text-green-500 mt-1" />}
                                    {item.type === 'assignment' && <CheckCircle className="h-4 w-4 text-yellow-500 mt-1" />}

                                    {/* Text content */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                                        <p className="text-xs text-gray-400">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>


                    <div className="mb-6">
                        <h3 className="text-md font-medium mb-3">External Resources</h3>

                        <div className="space-y-4">
                            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800 mb-3">
                                <div className="flex items-start space-x-3">
                                    <Link className="h-4 w-4 mt-1 text-blue-500" />
                                    <div>
                                        <h4 className="text-sm font-medium">Research Paper</h4>
                                        <p className="text-xs text-gray-400">Original implementation details</p>
                                    </div>
                                </div></div>

                                <div className="border border-gray-700 rounded-lg p-4 bg-gray-800 mb-3"> <div className="flex items-start space-x-3">
                                    <MessageCircle className="h-4 w-4 mt-1 text-blue-500" />
                                    <div>
                                        <h4 className="text-sm font-medium">Community Forum</h4>
                                        <p className="text-xs text-gray-400">Discussion and solutions</p>
                                    </div></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-medium mb-3">Skills you will acquire</h3>

                        <div className="flex flex-wrap gap-2">
                            <span className="bg-gray-700 rounded-full px-3 py-1 text-xs">Python</span>
                            <span className="bg-gray-700 rounded-full px-3 py-1 text-xs">NumPy</span>
                            <span className="bg-gray-700 rounded-full px-3 py-1 text-xs">Matplotlib</span>
                            <span className="bg-gray-700 rounded-full px-3 py-1 text-xs">Statistics</span>
                            <span className="bg-gray-700 rounded-full px-3 py-1 text-xs">Linear Algebra</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
export default ChapterGeneration;