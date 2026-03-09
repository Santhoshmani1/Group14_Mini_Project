import React from 'react'
import { useNavigate } from 'react-router-dom';

interface CourseDetails {
  title: string;
  description: string;
  duration: string;
  price: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  language:string;
  status: 'draft' | 'published' | 'archived';
}

interface QuizDetails {
    title: string;
    description: string;
    duration: number;
    passingScore: number;
    questions: object;
}

const courseData: CourseDetails[] = [];
const quizData: QuizDetails[] = [];

const InstructorPage = () => {
    const navigate = useNavigate();
  return (
    <div>
        <h1 className="text-3xl font-bold mx-4 my-2 p-4">Instructor Dashboard</h1>
        <p className="text-gray-700 mx-6 p-2">Welcome to your instructor dashboard! Here you can manage your courses, view student progress, and create new content.</p>

        <div className="flex gap-6 justify-items-center items-center mx-4 my-2 px-4 py-2">
            <button onClick={() => navigate(`/instructor/createCourse/`)} 
            className="mt-4 text-white px-4 py-2 rounded-md shadow-md hover:bg-white hover:text-black bg-black ">Create Course</button>
            <button onClick={() => navigate(`/instructor/createQuiz/`)} 
            className="mt-4 text-white px-4 py-2 rounded-md shadow-md hover:bg-white hover:text-black bg-black">Create Quiz</button>
        </div>

        <div>
            <h2 className="text-2xl font-semibold mx-4 my-2 p-4">Your Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-6 px-8">
                <div className="border rounded-lg shadow-md p-4">
                    <h3 className="text-xl font-bold mb-2">{courseData.length > 0 ? courseData[0].title : 'No Courses Available'}</h3>
                    <p className="text-gray-600 mb-4">{courseData.length > 0 ? courseData[0].description : 'Please create a course to see details here.'}</p>
                    <p className="text-sm text-gray-500">Duration: {courseData.length > 0 ? courseData[0].duration : 'N/A'}</p>
                    <p className="text-sm text-gray-500">Price: ${courseData.length > 0 ? courseData[0].price : 'N/A'}</p>
                    <p className="text-sm text-gray-500">Language: {courseData.length > 0 ? courseData[0].language : 'N/A'}</p>
                    <p className="text-sm text-gray-500">Status: {courseData.length > 0 ? courseData[0].status : 'N/A'}</p>
                </div>
            </div>
        </div>


        <div>
            <h2 className="text-2xl font-semibold mx-4 my-2 p-4">Your Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-6 px-8">
                <div className="border rounded-lg shadow-md p-4">
                    <h3 className="text-xl font-bold mb-2">{quizData.length > 0 ? quizData[0].title : 'No Quizzes Available'}</h3>
                    <p className="text-gray-600 mb-4">{quizData.length > 0 ? quizData[0].description : 'Please create a quiz to see details here.'}</p>
                    <p className="text-sm text-gray-500">Duration: {quizData.length > 0 ? quizData[0].duration : 'N/A'} minutes</p>
                    <p className="text-sm text-gray-500">Passing Score: {quizData.length > 0 ? quizData[0].passingScore : 'N/A'}%</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default InstructorPage;