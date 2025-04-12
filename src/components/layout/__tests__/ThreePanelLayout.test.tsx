import React from 'react';
import { render, screen } from '@testing-library/react';
import ThreePanelLayout from '../ThreePanelLayout';

describe('ThreePanelLayout', () => {
  it('renders all three panels', () => {
    render(
      <ThreePanelLayout
        leftPanel={<div data-testid="left-panel">Left Panel</div>}
        mainPanel={<div data-testid="main-panel">Main Panel</div>}
        rightPanel={<div data-testid="right-panel">Right Panel</div>}
      />
    );

    expect(screen.getByTestId('left-panel')).toBeInTheDocument();
    expect(screen.getByTestId('main-panel')).toBeInTheDocument();
    expect(screen.getByTestId('right-panel')).toBeInTheDocument();
  });
});
