
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./Pages/Home/Home"
import "./index.css";
import Layout from './Layouts/Layout'
import Explore from './Pages/Explore/Explore';
import Profile from './Pages/Profile/Profile';
import ProfileLayout from './Layouts/ProfileLayout';
import EditProfile from './Pages/EditProfile/EditProfile';
import Signup from './Pages/Signup/Signup';
import Login from './Pages/Login/Login';
import OTPVerification from './Pages/OTPVerification/OTPVerification';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';
import ResetPassword from './Pages/ResetPassword/ResetPassword';
import Connections from './Pages/Connections/Connections';
import { ThemeProvider } from './Context/ThemeContext';
import CreateArticle from './Pages/CreateArticle/CreateArticle';
import DraftArticles from './Pages/DraftArticles/DraftArticles';
import ReadArticle from './Pages/ReadArticle/ReadArticle';
import PublicProfile from './Pages/PublicProfile/PublicProfile';
import { AuthProvider } from './Context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SingleLayout from './Layouts/SingleLayout';
import Bookmarks from './Pages/Bookmarks/Bookmarks';
import NotFound from './Components/NotFound/NotFound';
import Settings from './Pages/Settings/Settings';
import Community from './Pages/Community/Community';
import SinglePostPage from './Pages/SinglePostPage/SinglePostPage';
import { CommunityAIProvider } from './Context/CommunityAIContext';
import Dashboard from './Pages/Dashboard/Dashboard';


const queryClient = new QueryClient();


const router = createBrowserRouter([
  {
    element: <Layout />,
    // errorElement: <NotFound />,

    children: [
      {
        path: "/",
        element: <Home />
      },

      {
        path: "/explore",
        element: <Explore />
      },

      {
        path: "/profile",
        element: <Profile />
      },

      {
        path: "/drafts",
        element: <DraftArticles />
      },

      {
        path: "/user/:id",
        element: <PublicProfile />
      },

      {
        path: "/bookmarks",
        element: <Bookmarks />
      },

      {
        path: "/community",
        element: <Community />
      },

      {
        path: '/dashboard',
        element: <Dashboard/>
      }


    ]
  },

  {
    element: <ProfileLayout />,
    children: [
      {
        path: "/profile",
        element: <Profile />
      },

    ]
  },

  {
    element: <SingleLayout />,
    children: [

      {
        path: "/article/:id",
        element: <ReadArticle />
      },

      {
        path: "/article-editor/:id",
        element: <CreateArticle />
      },

      {
        path: "/article-editor",
        element: <CreateArticle />
      },

      { 
        path: "/settings",
        element: <Settings />
      },

      
      {
        path: "/edit-profile",
        element: <EditProfile />
      },

      {
        path: "/community/post/:id",
        element: <SinglePostPage />
      },

    ]
  },

  {
    path: "/signup",
    element: <Signup />
  },

  {
    path: "/verify",
    element: <OTPVerification />
  },

  {
    path: "/login",
    element: <Login />
  },

  {
    path: "/forgot-password",
    element: <ForgotPassword />
  },

  {
    path: "/reset-password/:token",
    element: <ResetPassword />
  },

  {
    path: "/connections/:type",
    element: <Connections />
  },

  {
    path: "*",
    element: <NotFound />
  }

]
)


createRoot(document.getElementById('root')).render(


  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <CommunityAIProvider>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
      </CommunityAIProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
)
