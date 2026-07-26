const { screen, fireEvent } = require('@testing-library/dom');
require('@testing-library/jest-dom');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

beforeEach(() => {
  // Clear the DOM
  document.documentElement.innerHTML = '';
  
  // Set the full HTML content
  document.documentElement.innerHTML = html;
  
  // Extract script content and execute it in global context
  const scriptTags = document.querySelectorAll('script');
  scriptTags.forEach(tag => {
    try {
      // Create a new function to properly scope the script execution
      const scriptFunction = new Function(tag.textContent);
      scriptFunction();
    } catch (e) {
      console.error('Script error:', e.message);
    }
  });
  
  // Manually trigger initApp after a small delay to ensure DOM is ready
  if (window.initApp) {
    window.initApp();
  }
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Insurance Application - UI & Navigation Tests', () => {
  test('should render the company logo with SureTrust branding', () => {
    const logo = document.querySelector('.logo');
    expect(logo).toBeInTheDocument();
    expect(logo.textContent).toContain('SureTrust');
  });

  test('should render navigation menu with all required links', () => {
    const navMenu = document.getElementById('navMenu');
    expect(navMenu).toBeInTheDocument();
    
    const links = navMenu.querySelectorAll('a');
    expect(links.length).toBeGreaterThanOrEqual(4);
    
    const linkTexts = Array.from(links).map(a => a.textContent);
    expect(linkTexts).toEqual(expect.arrayContaining(['Home', 'Policies', 'Compare Plans', 'Apply Now']));
  });
});

describe('Insurance Application - Policy Comparison Tests', () => {
  test('should verify the comparison table exists and contains headers', () => {
    const table = document.querySelector('table');
    expect(table).toBeInTheDocument();
    
    const headers = table.querySelectorAll('th');
    expect(headers.length).toBeGreaterThan(0);
    
    const headerTexts = Array.from(headers).map(h => h.textContent);
    expect(headerTexts).toEqual(expect.arrayContaining(['Policy Type', 'Min. Premium', 'Maturity Period']));
  });
});

describe('Insurance Application - Form Validation & Submission Tests', () => {
  test('should have all required form fields rendered', () => {
    const form = document.getElementById('insuranceForm');
    expect(form).toBeInTheDocument();
    
    expect(document.getElementById('custName')).toBeInTheDocument();
    expect(document.getElementById('custAge')).toBeInTheDocument();
    expect(document.getElementById('custIncome')).toBeInTheDocument();
    expect(document.getElementById('custOccupation')).toBeInTheDocument();
    expect(document.getElementById('custMobile')).toBeInTheDocument();
    expect(document.getElementById('custEmail')).toBeInTheDocument();
    expect(document.getElementById('policySelect')).toBeInTheDocument();
    expect(document.getElementById('policyTerm')).toBeInTheDocument();
    expect(document.getElementById('docUpload')).toBeInTheDocument();
  });

  test('should fail validation when age is below minimum (18)', () => {
    const ageInput = document.getElementById('custAge');
    fireEvent.change(ageInput, { target: { value: '15' } });
    expect(ageInput.checkValidity()).toBe(false);
  });

  test('should fail validation when age exceeds maximum (65)', () => {
    const ageInput = document.getElementById('custAge');
    fireEvent.change(ageInput, { target: { value: '70' } });
    expect(ageInput.checkValidity()).toBe(false);
  });

  test('should pass validation when age is within valid range', () => {
    const ageInput = document.getElementById('custAge');
    fireEvent.change(ageInput, { target: { value: '30' } });
    expect(ageInput.checkValidity()).toBe(true);
  });

  test('should fail validation when mobile number does not match 10-digit pattern', () => {
    const mobileInput = document.getElementById('custMobile');
    fireEvent.change(mobileInput, { target: { value: '12345' } });
    expect(mobileInput.checkValidity()).toBe(false);
  });

  test('should fail validation when mobile number starts with invalid digit', () => {
    const mobileInput = document.getElementById('custMobile');
    fireEvent.change(mobileInput, { target: { value: '5123456789' } });
    expect(mobileInput.checkValidity()).toBe(false);
  });

  test('should pass validation when mobile number is valid (10 digits, starts with 6-9)', () => {
    const mobileInput = document.getElementById('custMobile');
    fireEvent.change(mobileInput, { target: { value: '9876543210' } });
    expect(mobileInput.checkValidity()).toBe(true);
  });

  test('should fail validation when income is below minimum', () => {
    const incomeInput = document.getElementById('custIncome');
    fireEvent.change(incomeInput, { target: { value: '50000' } });
    expect(incomeInput.checkValidity()).toBe(false);
  });

  test('should pass validation when income meets minimum requirement', () => {
    const incomeInput = document.getElementById('custIncome');
    fireEvent.change(incomeInput, { target: { value: '100000' } });
    expect(incomeInput.checkValidity()).toBe(true);
  });
});

describe('Insurance Application - Form Field Attributes Tests', () => {
  test('should have correct input attributes for name field', () => {
    const nameInput = document.getElementById('custName');
    expect(nameInput.type).toBe('text');
    expect(nameInput.hasAttribute('required')).toBe(true);
  });

  test('should have correct input attributes for age field', () => {
    const ageInput = document.getElementById('custAge');
    expect(ageInput.type).toBe('number');
    expect(ageInput.min).toBe('18');
    expect(ageInput.max).toBe('65');
    expect(ageInput.hasAttribute('required')).toBe(true);
  });

  test('should have correct input attributes for mobile field', () => {
    const mobileInput = document.getElementById('custMobile');
    expect(mobileInput.type).toBe('tel');
    expect(mobileInput.pattern).toBe('[6-9][0-9]{9}');
    expect(mobileInput.hasAttribute('required')).toBe(true);
  });

  test('should have correct input attributes for income field', () => {
    const incomeInput = document.getElementById('custIncome');
    expect(incomeInput.type).toBe('number');
    expect(incomeInput.min).toBe('100000');
    expect(incomeInput.hasAttribute('required')).toBe(true);
  });
});

describe('Insurance Application - Data Population Tests', () => {
  test('should populate policy dropdown with all insurance types', () => {
    const policySelect = document.getElementById('policySelect');
    const options = policySelect.querySelectorAll('option');
    const optionValues = Array.from(options).map(opt => opt.value);
    
    expect(optionValues).toEqual(expect.arrayContaining(['Health', 'Life', 'Vehicle', 'Term', 'Child']));
  });

  test('should populate occupation dropdown with all required options', () => {
    const occupationSelect = document.getElementById('custOccupation');
    const options = occupationSelect.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(1);
  });
});
