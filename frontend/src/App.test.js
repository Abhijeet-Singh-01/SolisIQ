import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import HomePage from './HomePage';
import SubsidyCheckerPage from './SubsidyCheckerPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import AdminLoginPage from './AdminLoginPage';
import Dashboard from './Dashboard';
import API_BASE_URL from './apiConfig';

describe('SolisIQ Premium Redesign Suite', () => {
  test('API_BASE_URL is configured correctly without trailing slash', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
    expect(API_BASE_URL.endsWith('/')).toBe(false);
    expect(API_BASE_URL.startsWith('http')).toBe(true);
  });

  test('App component renders root cleanly', () => {
    const html = ReactDOMServer.renderToString(<App />);
    expect(html).toContain('SolisIQ');
    expect(html).toContain('Know what your');
    expect(html).toContain('roof can generate');
  });

  test('HomePage renders hero, four-step method, and simulator', () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter>
        <HomePage token="" user={null} darkMode={false} toggleDarkMode={() => {}} />
      </MemoryRouter>
    );
    expect(html).toContain('SolisIQ');
    expect(html).toContain('Know what your');
    expect(html).toContain('roof can generate');
    expect(html).toContain('Explore Solar Potential');
    expect(html).toContain('Solar Intelligence, Simplified');
    expect(html).toContain('Test Your Solar ROI Live');
  });

  test('SubsidyCheckerPage renders state policy and calculator', () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter>
        <SubsidyCheckerPage darkMode={false} toggleDarkMode={() => {}} />
      </MemoryRouter>
    );
    expect(html).toContain('State &amp; Central Subsidy Explorer');
    expect(html).toContain('PM Surya Ghar Scheme');
    expect(html).toContain('Net Financial Investment');
  });

  test('LoginPage renders authentication form', () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter>
        <LoginPage onLogin={() => {}} />
      </MemoryRouter>
    );
    expect(html).toContain('Sign In');
    expect(html).toContain('Email Address');
    expect(html).toContain('Password');
  });

  test('SignupPage renders registration form', () => {
    const html = ReactDOMServer.renderToString(
      <MemoryRouter>
        <SignupPage onSignup={() => {}} />
      </MemoryRouter>
    );
    expect(html).toContain('Create Account');
    expect(html).toContain('Username');
    expect(html).toContain('Email Address');
  });

  test('Dashboard component renders empty state when results are absent', () => {
    const html = ReactDOMServer.renderToString(<Dashboard results={null} />);
    expect(html).toContain('Awaiting Assessment Parameters');
  });

  test('Dashboard component renders calculations when full results provided', () => {
    const sampleResults = {
      prediction: { predicted_energy_output_kwh: 4.8 },
      roi: {
        recommended_capacity_kw: 3.0,
        number_of_panels: 8,
        roof_area_required_sq_ft: 320,
        annual_savings: 28000,
        lifetime_savings_25_years: 700000,
        roi_percent: 310,
        estimated_monthly_savings: 2333,
        payback_period_years: 5.8,
        monthly_units_kwh: 350,
      },
      carbon: {
        co2_saved_kg: 3500,
        tree_equivalent: 166,
      },
      userInput: {
        location: 'Delhi',
        bill: 2500,
        area: 500,
        state: 'Delhi',
      },
      seasonalBreakdown: [
        { month: 'January', predicted_energy_output_kwh: 3.8 },
        { month: 'February', predicted_energy_output_kwh: 4.2 },
      ],
    };

    const html = ReactDOMServer.renderToString(<Dashboard results={sampleResults} />);
    expect(html).toContain('Comprehensive Rooftop Solar Intelligence');
    expect(html).toContain('Estimated Generation');
    expect(html).toContain('Rooftop Panel Layout');
    expect(html).toContain('8 Panels');
    expect(html).toContain('500 sq ft available');
    expect(html).toContain('64%</strong> roof coverage');
    expect(html).toContain('180 sq ft</strong> available');
    expect(html).toContain('Capital Recovery Timeline');
  });

  test('Rooftop panel layout renders exact panel count dynamically (e.g. 27 panels)', () => {
    const dynamicResults = {
      prediction: { predicted_energy_output_kwh: 5.5 },
      roi: {
        recommended_capacity_kw: 10.8,
        number_of_panels: 27,
        roof_area_required_sq_ft: 1153.2,
        annual_savings: 95000,
        lifetime_savings_25_years: 2375000,
        roi_percent: 320,
        estimated_monthly_savings: 7916,
        payback_period_years: 4.8,
        monthly_units_kwh: 1130,
      },
      carbon: {
        co2_saved_kg: 12000,
        tree_equivalent: 570,
      },
      userInput: {
        location: 'Jaipur',
        bill: 8000,
        area: 1500,
        state: 'Rajasthan',
      },
      seasonalBreakdown: [],
    };

    const html = ReactDOMServer.renderToString(<Dashboard results={dynamicResults} />);
    expect(html).toContain('27 Panels');
    expect(html).toContain('1,500 sq ft available');
    expect(html).toContain('<strong>27</strong> panels');
    expect(html).toContain('347 sq ft</strong> available');
    expect(html).toContain('77%</strong> roof coverage');
    // Ensure all 27 panel spec chips are rendered
    expect(html).toContain('#27');
    expect(html).not.toContain('#28');
  });
});
