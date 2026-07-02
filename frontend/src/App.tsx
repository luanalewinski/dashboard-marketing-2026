import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import BriefCapture from './pages/BriefCapture';
import TaskReview from './pages/TaskReview';
import SyncConfirmation from './pages/SyncConfirmation';
import TaskClose from './pages/TaskClose';
import Dashboard from './pages/Dashboard';
import Sprints from './pages/Sprints';
import Social from './pages/teams/Social';
import Benchmarking from './pages/teams/Benchmarking';
import Atendimento from './pages/teams/Atendimento';
import Design from './pages/teams/Design';
import EventosList from './pages/eventos/EventosList';
import Instagram from './pages/Instagram';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<BriefCapture />} />
          <Route path="/review/:campaignId" element={<TaskReview />} />
          <Route path="/sync/:campaignId" element={<SyncConfirmation />} />
          <Route path="/close/:taskId" element={<TaskClose />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/time/social" element={<Social />} />
          <Route path="/time/benchmarking" element={<Benchmarking />} />
          <Route path="/time/atendimento" element={<Atendimento />} />
          <Route path="/time/design" element={<Design />} />
          <Route path="/instagram" element={<Instagram />} />
          <Route path="/eventos" element={<EventosList />} />
          <Route path="/eventos/:eventId" element={<EventosList />} />
          <Route path="/eventos/:eventId/:year" element={<EventosList />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
