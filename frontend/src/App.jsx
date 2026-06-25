import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReadAloud from './components/ReadAloud';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Jobseeker pages
import JobseekerDashboard from './pages/jobseeker/Dashboard';
import JobseekerProfile from './pages/jobseeker/Profile';
import ResumeChecker from './pages/jobseeker/ResumeChecker';
import AvailableJobs from './pages/jobseeker/AvailableJobs';
import MyApplications from './pages/jobseeker/MyApplications';
import GovernmentSchemes from './pages/jobseeker/GovernmentSchemes';
import JobseekerSettings from './pages/jobseeker/Settings';

// Employer pages
import EmployerDashboard from './pages/employer/Dashboard';
import PostJob from './pages/employer/PostJob';
import JobApplications from './pages/employer/JobApplications';
import AIMatching from './pages/employer/AIMatching';
import Resources from './pages/employer/Resources';
import EmployerSettings from './pages/employer/Settings';

function App() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Jobseeker Private Routes */}
          <Route
            path="/jobseeker/dashboard"
            element={
              <ProtectedRoute allowedRole="jobseeker">
                <JobseekerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker/profile"
            element={
              <ProtectedRoute allowedRole="jobseeker">
                <JobseekerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker/resume-checker"
            element={
              <ProtectedRoute allowedRole="jobseeker">
                <ResumeChecker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker/available-jobs"
            element={
              <ProtectedRoute allowedRole="jobseeker">
                <AvailableJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker/my-applications"
            element={
              <ProtectedRoute allowedRole="jobseeker">
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker/government-schemes"
            element={
              <ProtectedRoute allowedRole="jobseeker">
                <GovernmentSchemes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker/settings"
            element={
              <ProtectedRoute allowedRole="jobseeker">
                <JobseekerSettings />
              </ProtectedRoute>
            }
          />

          {/* Employer Private Routes */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRole="employer">
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/post-job"
            element={
              <ProtectedRoute allowedRole="employer">
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/applications"
            element={
              <ProtectedRoute allowedRole="employer">
                <JobApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/ai-matching"
            element={
              <ProtectedRoute allowedRole="employer">
                <AIMatching />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/resources"
            element={
              <ProtectedRoute allowedRole="employer">
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/settings"
            element={
              <ProtectedRoute allowedRole="employer">
                <EmployerSettings />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <ReadAloud />
      <Footer />
    </>
  );
}

export default App;
