import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { BusinessProvider, useBusiness } from '../context/BusinessContext';
import { WorkspaceEntryView } from '../components/auth/WorkspaceEntryView';

const LocationProbe: React.FC = () => {
  const location = useLocation();
  const { workspace } = useBusiness();
  return <output data-testid="location-state">{`${location.pathname}:${workspace.mode}`}</output>;
};

const renderEntry = () => render(
  <MemoryRouter initialEntries={['/login']}>
    <BusinessProvider>
      <WorkspaceEntryView />
      <LocationProbe />
    </BusinessProvider>
  </MemoryRouter>,
);

describe('workspace entry view', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders both workspace choices', () => {
    renderEntry();

    expect(screen.getByRole('button', { name: /enter demo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enter client/i })).toBeInTheDocument();
    expect(screen.getByText(/realistic indian sample data/i)).toBeInTheDocument();
    expect(screen.getByText(/your own business workspace/i)).toBeInTheDocument();
  });

  it('switches to demo and navigates to the dashboard', () => {
    renderEntry();

    fireEvent.click(screen.getByRole('button', { name: /enter demo/i }));

    expect(screen.getByTestId('location-state')).toHaveTextContent('/dashboard:demo');
  });

  it('switches to client and navigates to the dashboard', () => {
    renderEntry();

    fireEvent.click(screen.getByRole('button', { name: /enter client/i }));

    expect(screen.getByTestId('location-state')).toHaveTextContent('/dashboard:client');
  });
});
