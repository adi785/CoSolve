import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ProblemsDirectoryPage } from './pages/ProblemsDirectoryPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { CandidateComparisonPage } from './pages/CandidateComparisonPage';
import { CreateProblemPage } from './pages/CreateProblemPage';
import { AIAnalysisReportPage } from './pages/AIAnalysisReportPage';
import { SolverDashboard } from './pages/SolverDashboard';
import { SolverRecommendationsPage } from './pages/SolverRecommendationsPage';
import { SolverSkillsPage } from './pages/SolverSkillsPage';
import { SolverPortfolioPage } from './pages/SolverPortfolioPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { OrganizationDashboard } from './pages/OrganizationDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PoliciesPage } from './pages/PoliciesPage';

function MainRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simple path matching
  const renderPage = () => {
    const path = currentPath;

    if (path === '/' || path === '') {
      return <LandingPage navigate={navigate} />;
    }
    if (path === '/how-it-works') {
      return <HowItWorksPage navigate={navigate} />;
    }
    if (path === '/problems') {
      return <ProblemsDirectoryPage navigate={navigate} />;
    }
    if (path.startsWith('/problems/') && path.endsWith('/applications')) {
      const parts = path.split('/');
      const problemId = parts[2];
      return <CandidateComparisonPage problemId={problemId} navigate={navigate} />;
    }
    if (path.startsWith('/problems/')) {
      const problemId = path.replace('/problems/', '');
      return <ProblemDetailPage problemId={problemId} navigate={navigate} />;
    }
    if (path === '/provider/dashboard') {
      return <ProviderDashboard navigate={navigate} />;
    }
    if (path === '/provider/create-problem') {
      return <CreateProblemPage navigate={navigate} />;
    }
    if (path.startsWith('/provider/ai-analysis/')) {
      const problemId = path.replace('/provider/ai-analysis/', '');
      return <AIAnalysisReportPage problemId={problemId} navigate={navigate} />;
    }
    if (path === '/solver/dashboard') {
      return <SolverDashboard navigate={navigate} />;
    }
    if (path === '/solver/recommendations') {
      return <SolverRecommendationsPage navigate={navigate} />;
    }
    if (path === '/solver/skills') {
      return <SolverSkillsPage navigate={navigate} />;
    }
    if (path.startsWith('/solver/portfolio/')) {
      const userId = path.replace('/solver/portfolio/', '');
      return <SolverPortfolioPage userId={userId} navigate={navigate} />;
    }
    if (path.startsWith('/projects/')) {
      const projectId = path.replace('/projects/', '');
      return <ProjectWorkspacePage projectId={projectId} navigate={navigate} />;
    }
    if (path === '/organization') {
      return <OrganizationDashboard navigate={navigate} />;
    }
    if (path === '/admin') {
      return <AdminDashboard navigate={navigate} />;
    }
    if (path === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (path === '/register') {
      return <RegisterPage navigate={navigate} />;
    }
    if (path === '/policies') {
      return <PoliciesPage navigate={navigate} />;
    }

    // Default Fallback
    return <LandingPage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar currentRoute={currentPath} navigate={navigate} />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
