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

  test('should render all 5 specific policy categories in the catalog', () => {
    expect(screen.getByText('Health Insurance')).toBeInTheDocument();
    expect(screen.getByText('Life Insurance')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Insurance')).toBeInTheDocument();
    expect(screen.getByText('Term Insurance')).toBeInTheDocument();
    expect(screen.getByText('Child Plan')).toBeInTheDocument();
  });

  test('should display the application header with main banner', () => {
    const heading = screen.getByText(/Secure Your Family's Financial Future/i);
    expect(heading).toBeInTheDocument();
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

  test('should display all policy data in the comparison table', () => {
    const tableBody = document.getElementById('comparisonTableBody');
    expect(tableBody).toBeInTheDocument();
    
    const rows = tableBody.querySelectorAll('tr');
    expect(rows.length).toBeGreaterThanOrEqual(5);
  });

  test('should have comparison table with policy types', () => {
    const table = document.querySelector('table');
    const tableText = table.textContent;
    
    expect(tableText).toContain('Health Insurance');
    expect(tableText).toContain('Life Insurance');
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

  test('should successfully validate inputs and log data structure on valid form submission', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Fill out all form fields with valid data
    fireEvent.change(document.getElementById('custName'), { target: { value: 'John Doe' } });
    fireEvent.change(document.getElementById('custAge'), { target: { value: '30' } });
    fireEvent.change(document.getElementById('custIncome'), { target: { value: '600000' } });
    fireEvent.change(document.getElementById('custOccupation'), { target: { value: 'Salaried' } });
    fireEvent.change(document.getElementById('custMobile'), { target: { value: '9876543210' } });
    fireEvent.change(document.getElementById('custEmail'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(document.getElementById('policySelect'), { target: { value: 'Health' } });
    fireEvent.change(document.getElementById('policyTerm'), { target: { value: '15' } });

    // Mock file upload element data
    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = document.getElementById('docUpload');
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit the form
    const form = document.getElementById('insuranceForm');
    fireEvent.submit(form);

    // Verify that console.log was called with application data
    expect(consoleSpy).toHaveBeenCalled();
    const loggedCalls = consoleSpy.mock.calls.map(call => String(call[0]));
    const hasPayloadLog = loggedCalls.some(call => call.includes('Premium Insurance Application Data Payload'));
    expect(hasPayloadLog).toBe(true);
    
    consoleSpy.mockRestore();
  });

  test('should display success toast after form submission', () => {
    // Fill out form with valid data
    fireEvent.change(document.getElementById('custName'), { target: { value: 'Jane Smith' } });
    fireEvent.change(document.getElementById('custAge'), { target: { value: '28' } });
    fireEvent.change(document.getElementById('custIncome'), { target: { value: '450000' } });
    fireEvent.change(document.getElementById('custOccupation'), { target: { value: 'Salaried' } });
    fireEvent.change(document.getElementById('custMobile'), { target: { value: '8765432109' } });
    fireEvent.change(document.getElementById('custEmail'), { target: { value: 'jane.smith@example.com' } });
    fireEvent.change(document.getElementById('policySelect'), { target: { value: 'Life' } });
    fireEvent.change(document.getElementById('policyTerm'), { target: { value: '20' } });

    const file = new File(['content'], 'aadhaar.pdf', { type: 'application/pdf' });
    fireEvent.change(document.getElementById('docUpload'), { target: { files: [file] } });

    const form = document.getElementById('insuranceForm');
    fireEvent.submit(form);

    // Check if success toast is visible
    const toast = document.getElementById('successToast');
    expect(toast.style.display).toBe('block');
  });

  test('should reset form after successful submission', () => {
    // Fill and submit form
    fireEvent.change(document.getElementById('custName'), { target: { value: 'Test User' } });
    fireEvent.change(document.getElementById('custAge'), { target: { value: '35' } });
    fireEvent.change(document.getElementById('custIncome'), { target: { value: '750000' } });
    fireEvent.change(document.getElementById('custOccupation'), { target: { value: 'Professional' } });
    fireEvent.change(document.getElementById('custMobile'), { target: { value: '7654321098' } });
    fireEvent.change(document.getElementById('custEmail'), { target: { value: 'test@example.com' } });
    fireEvent.change(document.getElementById('policySelect'), { target: { value: 'Vehicle' } });
    fireEvent.change(document.getElementById('policyTerm'), { target: { value: '10' } });

    const file = new File(['content'], 'pan.pdf', { type: 'application/pdf' });
    fireEvent.change(document.getElementById('docUpload'), { target: { files: [file] } });

    const form = document.getElementById('insuranceForm');
    fireEvent.submit(form);

    // Verify form was reset
    expect(document.getElementById('custName').value).toBe('');
    expect(document.getElementById('custAge').value).toBe('');
    expect(document.getElementById('custEmail').value).toBe('');
  });
});

describe('Insurance Application - Navigation Tests', () => {
  test('should navigate to different pages when menu items are clicked', () => {
    // Check home page is active initially
    const homeSection = document.getElementById('home');
    expect(homeSection.classList.contains('active')).toBe(true);

    // Navigate to policies page using navigation links
    const navLinks = document.querySelectorAll('.nav-menu a');
    const policiesLink = Array.from(navLinks).find(link => link.textContent.includes('Policies'));
    fireEvent.click(policiesLink);
    
    const policiesSection = document.getElementById('policies');
    expect(policiesSection.classList.contains('active')).toBe(true);
    expect(homeSection.classList.contains('active')).toBe(false);
  });

  test('should navigate to apply page from featured plans button', () => {
    const applyButtons = document.querySelectorAll('.card .btn');
    expect(applyButtons.length).toBeGreaterThan(0);

    // Click first apply button
    fireEvent.click(applyButtons[0]);
    
    const applySection = document.getElementById('apply');
    expect(applySection.classList.contains('active')).toBe(true);
  });

  test('should show policies section when view insurance plans button is clicked', () => {
    const viewPlansButtons = document.querySelectorAll('button');
    const viewPlansButton = Array.from(viewPlansButtons).find(btn => btn.textContent.includes('View Insurance Plans'));
    
    if (viewPlansButton) {
      fireEvent.click(viewPlansButton);
      const policiesSection = document.getElementById('policies');
      expect(policiesSection.classList.contains('active')).toBe(true);
    }
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

  test('should have featured grid with policy cards', () => {
    const featuredGrid = document.getElementById('featuredGrid');
    const cards = featuredGrid.querySelectorAll('.card');
    expect(cards.length).toBeGreaterThan(0);
  });

  test('should have policy catalog grid populated', () => {
    const policyCatalogGrid = document.getElementById('policyCatalogGrid');
    const cards = policyCatalogGrid.querySelectorAll('.card');
    expect(cards.length).toBeGreaterThanOrEqual(5);
  });
});
