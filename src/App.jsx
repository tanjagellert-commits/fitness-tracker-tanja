import { useState, useCallback } from 'react';
import { signOut } from './services/googleDrive';
import Login from './components/Login';
import HomeScreen from './components/HomeScreen';
import UnitSelect from './components/UnitSelect';
import ExerciseFlow from './components/ExerciseFlow';
import FinishScreen from './components/FinishScreen';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const [screen, setScreen]               = useState('login');
  const [selectedUnit, setSelectedUnit]   = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);

  const handleLogin = useCallback(async () => {
    setScreen('home');
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
    setScreen('login');
  }, []);

  const handleStartUnit = useCallback((unit) => {
    setSelectedUnit(unit);
    setCompletedExercises([]);
    setScreen(unit === 'C' ? 'finish' : 'exercise-flow');
  }, []);

  const handleExercisesDone = useCallback((exercises) => {
    setCompletedExercises(exercises);
    setScreen('finish');
  }, []);

  if (screen === 'login')
    return <Login onLoginSuccess={handleLogin} />;

  if (screen === 'home')
    return <HomeScreen onStart={() => setScreen('unit-select')} onSettings={() => setScreen('settings')} />;

  if (screen === 'unit-select')
    return <UnitSelect onSelect={handleStartUnit} onBack={() => setScreen('home')} />;

  if (screen === 'exercise-flow')
    return <ExerciseFlow unit={selectedUnit} onDone={handleExercisesDone} onBack={() => setScreen('unit-select')} />;

  if (screen === 'finish')
    return <FinishScreen unit={selectedUnit} exercises={completedExercises} runData={null} onSaved={() => setScreen('home')} onSessionExpired={() => setScreen('login')} />;

  if (screen === 'settings')
    return <SettingsPanel onBack={() => setScreen('home')} onSignOut={handleSignOut} />;

  return null;
}
