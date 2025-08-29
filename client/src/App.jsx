import React from 'react'
import {Routes, Route, useLocation} from "react-router-dom"
import LoginPage from './pages/LoginPage'
import {ToastContainer} from "react-toastify";
import HomePage from './pages/HomePage';
import GenerateQuizPage from './pages/GenerateQuizPage';
import QuizListPage from './pages/QuizListPage';
import PlayQuizPage from './pages/PlayQuizPage';
import QuizResultPage from './pages/QuizResultPage';
import ChatRoomsPage from './pages/ChatRoomsPage';
import ChatRoomPage from './pages/ChatRoomPage';
import TodoPage from './pages/TodoPage';
import DashboardPage from './pages/DashboardPage';
import LecturesPage from './pages/LecturesPage';
import TimetablePage from './pages/TimetablePage';
import EBooksPage from './pages/EBooksPage';
import PerformancePage from './pages/PerformancePage';
import IdeasPage from './pages/IdeasPage';
import CustomizePage from './pages/CustomizePage';

const App = () => {
  // const location = useLocation();
  // const hideNavbarRoutes = ["/login"];
  // const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
  return (
    <div>
      <ToastContainer className="bg-transparent"/>

      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/generate-quiz' element={<GenerateQuizPage/>} />
        <Route path='/quizzes' element={<QuizListPage/>} />
        <Route path='/quiz/:quizID' element={<PlayQuizPage/>} />
        <Route path='/quiz/attempt/:attemptID' element={<QuizResultPage/>} />
        <Route path='/chat' element={<ChatRoomsPage/>} />
        <Route path='/chat/:roomId' element={<ChatRoomPage/>} />
        <Route path='/todos' element={<TodoPage/>} />
        <Route path='/dashboard' element={<DashboardPage/>} />
        <Route path='/lectures' element={<LecturesPage/>} />
        <Route path='/timetable' element={<TimetablePage/>} />
        <Route path='/ebooks' element={<EBooksPage/>} />
        <Route path='/performance' element={<PerformancePage/>} />
        <Route path='/ideas' element={<IdeasPage/>} />
        <Route path='/customize' element={<CustomizePage/>} />
      </Routes>
    </div>
  )
}

export default App