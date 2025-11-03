import React from 'react';
import LessonPlanner from './components/LessonPlanner';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Header />
      <main>
        <LessonPlanner />
      </main>
    </div>
  );
};

export default App;