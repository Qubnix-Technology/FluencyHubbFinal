import React from 'react'
import * as ReactAll from 'react'
import { Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './App.css'

if (typeof window !== 'undefined' && !window.React) {
  window.React = ReactAll;
}


import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import CustomCursor from './Components/CustomCursor'
import Home from './Pages/Home'
import About from './Pages/About' // Import About page
import Teacher from './Pages/Teacher' // Import Teacher page
import LittleTalkersClub from './Pages/LittleTalkersClub'
import School from './Pages/School/School'
import SchoolOfLanguagesCommunication from './Pages/School/SchoolOfLanguagesCommunication'
import SchoolOfBIMEngineering from './Pages/School/SchoolOfBIMEngineering'
import GlobalUpSkillingEcosystem from './Pages/School/GlobalUpSkillingEcosystem'
import NextGenK12Academy from './Pages/School/NextGenK12Academy'
import FutureTechSoftwareEngineering from './Pages/School/FutureTechSoftwareEngineering'
//import GovernmentExamPrepAcademy from './Pages/School/GovernmentExamPrepAcademy'
import WellnessPersonalGrowth from './Pages/School/WellnessPersonalGrowth'
import SchoolofFinanceBusiness from './Pages/School/SchoolofFinanceBusiness'
import GlobalTestPrepStudyAbroad from './Pages/School/GlobalTestPrepStudyAbroad'
import PerformanceMusicAcademy from './Pages/School/PerformanceMusicAcademy'
import LifestyleHomeArts from './Pages/School/LifestyleHomeArts'
import ModernSalesCustomerSuccess from './Pages/School/ModernSalesCustomerSuccess'
import CyberSecurityCloudTech from './Pages/School/CyberSecurityCloudTech'
import ProjectManagementSupplyChain from './Pages/School/ProjectManagementSupplyChain'
//import HealthcareAdministration from './Pages/School/HealthcareAdministration'
import LawCorporateGovernance from './Pages/School/Law & Corporate Governance'
import RealEstateGlobalWealth from './Pages/School/RealEstateGlobalWealth'
import JournalismMediaMassCommunication from './Pages/School/JournalismMediaMassCommunication'
import Contact from './Pages/Contact'
import Enquiry from './Pages/Enquiry'
import AdminEnquiries from './Pages/AdminEnquiries'
import AdminPanel from './Pages/AdminPanel/AdminPanel'
import TeacherPortal from './Pages/TeacherPortal'
import TeacherDashboard from './Pages/TeacherDashboard'
import AdminChat from './Pages/AdminPanel/Chat'
import TeacherChat from './Pages/TeacherPanel/TeacherChat'
import StudentPanel from './Pages/StudentPanel/StudentPanel'
import LoginSelection from './Pages/Auth/LoginSelection'
import Blog from './Pages/Blog' // Import Blog page
import FloatingContact from './Components/FloatingContact'
import HeaderLoginButton from './Components/HeaderLoginButton'
import ClassChat from './Pages/Shared/ClassChat'
import DesignCreativeSkills from './Pages/Courses/DesignCreativeSkills'
import ArchitectureInteriorDesign from './Pages/Courses/ArchitectureInteriorDesign'
import SpiritualHealingMetaphysicalSciences from './Pages/Courses/SpiritualHealingMetaphysicalSciences'
import LifestyleLifeSkills from './Pages/Courses/LifestyleLifeSkills'
import ParentingChildDevelopment from './Pages/Courses/ParentingChildDevelopment'
import SpiritualTraditionalKnowledge from './Pages/Courses/SpiritualTraditionalKnowledge'
import AcademicExcellence from './Pages/Courses/AcademicExcellence'
import DigitalMarketingMedia from './Pages/Courses/DigitalMarketingMedia'
import ChessBrainDevelopment from './Pages/Courses/ChessBrainDevelopment'
import MindsetPeakPerformance from './Pages/Courses/MindsetPeakPerformance'
import StudentTestimonials from './Components/StudentTestimonials'
import { useLocation } from 'react-router-dom';

// App component rendering routes
function App() {
  const location = useLocation();
  const isAdminPanel = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const isTeacherPortal = location.pathname === '/teacher' || location.pathname.startsWith('/teacher/');
  const isStudentPortal = location.pathname.startsWith('/student');
  const hideTestimonials = ['/contact', '/enquiry', '/admin-enquiries'].includes(location.pathname) || isAdminPanel || isTeacherPortal;

  return (
    <>
      {(!isAdminPanel && !isTeacherPortal && !isStudentPortal) && <CustomCursor />}
      {(!isAdminPanel && !isTeacherPortal && !isStudentPortal) && <Navbar />}
      {(!isAdminPanel && !isTeacherPortal && !isStudentPortal) && <HeaderLoginButton />}
      <div style={{ overflowX: 'hidden' }}> {/* Padding for fixed navbar / prevent horizontal scroll */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} /> {/* Add About route */}
          <Route path="/blog" element={<Blog />} /> {/* Add Blog route */}
          <Route path="/teachers" element={<Teacher />} />
          <Route path="/little-talkers-club" element={<LittleTalkersClub />} />
          <Route path="/schools" element={<School />} />
          <Route path="/schools/academic-excellence" element={<AcademicExcellence />} />
          <Route path="/schools/digital-marketing-media" element={<DigitalMarketingMedia />} />
          <Route path="/schools/chess-brain-development" element={<ChessBrainDevelopment />} />
          <Route path="/schools/performance-music" element={<PerformanceMusicAcademy />} />
          <Route path="/schools/languages-communication" element={<SchoolOfLanguagesCommunication />} />
          <Route path="/schools/bim-engineering" element={<SchoolOfBIMEngineering />} />
          <Route path="/schools/global-ecosystem" element={<GlobalUpSkillingEcosystem />} />
          <Route path="/schools/nextgen-k12" element={<NextGenK12Academy />} />
          <Route path="/schools/future-tech" element={<FutureTechSoftwareEngineering />} />
          {/* <Route path="/schools/government-exam" element={<GovernmentExamPrepAcademy />} /> */}
          <Route path="/schools/wellness-personal-growth" element={<WellnessPersonalGrowth />} />
          <Route path="/schools/finance-business" element={<SchoolofFinanceBusiness />} />
          <Route path="/schools/global-test-prep" element={<GlobalTestPrepStudyAbroad />} />
          <Route path="/schools/lifestyle-home-arts" element={<LifestyleHomeArts />} />
          <Route path="/schools/modern-sales" element={<ModernSalesCustomerSuccess />} />
          <Route path="/schools/cyber-security" element={<CyberSecurityCloudTech />} />
          <Route path="/schools/project-management" element={<ProjectManagementSupplyChain />} />
          {/* <Route path="/schools/healthcare-administration" element={<HealthcareAdministration />} /> */}
          <Route path="/schools/law-corporate-governance" element={<LawCorporateGovernance />} />
          <Route path="/schools/real-estate-global-wealth" element={<RealEstateGlobalWealth />} />
          <Route path="/schools/journalism-media-mass-communication" element={<JournalismMediaMassCommunication />} />
          <Route path="/schools/design-creative-skills" element={<DesignCreativeSkills />} />
          <Route path="/schools/architecture-interior-design" element={<ArchitectureInteriorDesign />} />
          <Route path="/schools/spiritual-healing-metaphysical-sciences" element={<SpiritualHealingMetaphysicalSciences />} />
          <Route path="/schools/lifestyle-life-skills" element={<LifestyleLifeSkills />} />
          <Route path="/schools/parenting-child-development" element={<ParentingChildDevelopment />} />
          <Route path="/schools/spiritual-traditional-knowledge" element={<SpiritualTraditionalKnowledge />} />
          <Route path="/schools/mindset-peak-performance" element={<MindsetPeakPerformance />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/enquiry" element={<Enquiry />} />
          <Route path="/login" element={<LoginSelection />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/login" element={<AdminPanel />} />
          <Route path="/admin/chat" element={<ClassChat role="admin" title="Class chat management" />} />
          <Route path="/teacher" element={<TeacherPortal />} />
          <Route path="/student" element={<StudentPanel />} />
          <Route path="/student/chat" element={<StudentPanel defaultTab="chat" />} />
          <Route path="/admin-enquiries" element={<AdminEnquiries />} />
          <Route path="/schools/:id" element={<div style={{padding: '120px 20px', textAlign: 'center'}}><h1>School Detail Page Coming Soon!</h1></div>} />
        </Routes>
      </div>
      {(!isAdminPanel && !isTeacherPortal && !isStudentPortal) && <FloatingContact />}
      {!hideTestimonials && <StudentTestimonials />}
      {(!isAdminPanel && !isTeacherPortal && !isStudentPortal) && <Footer />}
    </>
  )
}

export default App
