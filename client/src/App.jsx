import React from 'react'
import {Routes, Route, useLocation} from "react-router-dom"
import LoginPage from './pages/LoginPage'
import {ToastContainer} from "react-toastify";
import HomePage from './pages/HomePage';
import GenerateQuizPage from './pages/GenerateQuizPage';

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
      </Routes>
    </div>
  )
}

export default App