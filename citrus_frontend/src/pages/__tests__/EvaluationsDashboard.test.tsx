import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import EvaluationsDashboard from '../EvaluationsDashboard';
import { PrivacyProvider } from '../../context/PrivacyContext';
import { AuthProvider } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock API
vi.mock('../../api_evaluations', () => ({
  fetchCampaigns: vi.fn(() => Promise.resolve({ campaigns: [] })),
  fetchTestSets: vi.fn(() => Promise.resolve({ test_sets: [] })),
  fetchStats: vi.fn(() => Promise.resolve({ 
    total_campaigns: 0, 
    total_test_sets: 0,
    total_traces: 0,
    total_preferences: 0,
    total_evaluations: 0
  })),
  fetchAvailableModels: vi.fn(() => Promise.resolve([])),
  seedSampleData: vi.fn(() => Promise.resolve({})),
}));

const MockedDashboard = () => (
  <BrowserRouter>
    <AuthProvider>
      <PrivacyProvider>
        <EvaluationsDashboard />
      </PrivacyProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('EvaluationsDashboard - VaultGemma Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renders Run Private Eval button in Quick Actions', async () => {
    render(<MockedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Run Private Eval/i)).toBeInTheDocument();
    });
  });
  
  it('triggers VaultGemma pipeline and shows loading state', async () => {
    const user = userEvent.setup();
    render(<MockedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Run Private Eval/i)).toBeInTheDocument();
    });
    
    const button = screen.getByText(/Run Private Eval/i);
    await user.click(button);
    
    // Button should show "Anonymizing & Scoring..." during run
    expect(screen.getByText(/Anonymizing & Scoring.../i)).toBeInTheDocument();
  });

  it('shows Delta View after running private eval with privacy mode enabled', async () => {
    const user = userEvent.setup();
    render(<MockedDashboard />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/Run Private Eval/i)).toBeInTheDocument();
    });
    
    const button = screen.getByText(/Run Private Eval/i);
    await user.click(button);
    
    // Wait for the mock async operation to complete (2 seconds in implementation)
    await waitFor(() => {
      expect(screen.getByText(/Delta View/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
