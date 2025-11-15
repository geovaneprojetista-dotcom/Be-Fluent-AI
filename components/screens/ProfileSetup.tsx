import React, { useState } from 'react';
import { UserProfile, EnglishLevel } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';

type ProfileSetupProps = {
  onComplete: (profile: UserProfile) => void;
};

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<EnglishLevel>(EnglishLevel.Beginner);
  const [goals, setGoals] = useState<string>('');
  const [fears, setFears] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete({
        name,
        level,
        goals: goals.split(',').map(g => g.trim()).filter(Boolean),
        fears,
      });
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Conte-nos Sobre Você</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Qual é o seu nome?</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-brand-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-brand-light text-text-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-text-secondary">Seu nível de inglês atual?</label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as EnglishLevel)}
            className="mt-1 block w-full px-3 py-2 border border-brand-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-brand-light text-text-primary"
          >
            {Object.values(EnglishLevel).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="goals" className="block text-sm font-medium text-text-secondary">Quais são seus objetivos? (ex: viajar, entrevista de emprego)</label>
          <input
            type="text"
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Separe por vírgulas"
            className="mt-1 block w-full px-3 py-2 border border-brand-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-brand-light text-text-primary"
          />
        </div>
        <div>
          <label htmlFor="fears" className="block text-sm font-medium text-text-secondary">Qual é o seu maior medo ao falar inglês?</label>
          <textarea
            id="fears"
            value={fears}
            onChange={(e) => setFears(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-brand-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-brand-light text-text-primary"
          />
        </div>
        <Button onClick={()=>{}} disabled={!name.trim()}>Completar Perfil</Button>
      </form>
    </Card>
  );
};

export default ProfileSetup;