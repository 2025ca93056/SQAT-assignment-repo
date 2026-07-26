const { screen, fireEvent } = require('@testing-library/dom');
require('@testing-library/jest-dom');
const fs = require('fs');
const path = require('path');

// Load the HTML file into JSDOM environment before each test
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

beforeEach(() => {
  // Clear the DOM first
  document.documentElement.innerHTML = '';
  
  // Set the full HTML content (including script tag)
  document.documentElement.innerHTML = html;
  
  // Re-extract and execute script after DOM is loaded
  const scriptTags = document.querySelectorAll('script');
  scriptTags.forEach(tag => {
    try {
      // Execute each script in the global window context
      eval(tag.textContent);
    } catch (e) {
      console.error('Script error:', e.message);
    }
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Insurance Application - UI & Navigation Tests', () => {
  test('should render the company logo and navigation elements', () => {
    const logo = screen.getByRole('link', { name: /SureTrust/i });
    expect(logo).toBeInTheDocument();
    
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Policies/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Compare/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Apply/i })).toBeInTheDocument();
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
  test('should verify the comparison table contains critical metric headers', () => {
    const table = document.querySelector('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('Policy Type')).toBeInTheDocument();
    expect(screen.getByText('Min. Premium')).toBeInTheDocument();
    expect(screen.getByText('Maturity Period')).toBeInTheDocument();
    expect(screen.getByText('Eligibility Criteria')).toBeInTheDocument();
  });

  test('should display all policy data in the comparison table', () => {
    const healthRow = screen.getByText('Health Insurance');
    expect(healthRow).toBeInTheDocument();
    
    const lifeRow = screen.getByText('Life Insurance');
    expect(lifeRow).toBeInTheDocument();
  });
});

describe('Insurance Application - Form Validation & Submission Tests', () => {
  test('should have all required form fields rendered', () => {
    expect(screen.getByLabelText(/Customer Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Annual Income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Occupation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select Insurance Policy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Policy Term/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload Aadhaar/i)).toBeInTheDocument();
  });

  test('should fail validation when age is below minimum (18)', () => {
    const ageInput = screen.getByLabelText(/Age/i);
    fireEvent.change(ageInput, { target: { value: '15' } });
    expect(ageInput.checkValidity()).toBe(false);
  });

  test('should fail validation when age exceeds maximum (65)', () => {
    const ageInput = screen.getByLabelText(/Age/i);
    fireEvent.change(ageInput, { target: { value: '70' } });
    expect(ageInput.checkValidity()).toBe(false);
  });

  test('should pass validation when age is within valid range', () => {
    const ageInput = screen.getByLabelText(/Age/i);
    fireEvent.change(ageInput, { target: { value: '30' } });
    expect(ageInput.checkValidity()).toBe(true);
  });

  test('should fail validation when a mobile number does not match the 10-digit pattern', () => {
    const mobileInput = screen.getByLabelText(/Mobile Number/i);
    fireEvent.change(mobileInput, { target: { value: '12345' } });
    expect(mobileInput.checkValidity()).toBe(false);
  });

  test('should fail validation when mobile number starts with invalid digit', () => {
    const mobileInput = screen.getByLabelText(/Mobile Number/i);
    fireEvent.change(mobileInput, { target: { value: '5123456789' } });
    expect(mobileInput.checkValidity()).toBe(false);
  });

  test('should pass validation when mobile number is valid (10 digits, starts with 6-9)', () => {
    const mobileInput = screen.getByLabelText(/Mobile Number/i);
    fireEvent.change(mobileInput, { target: { value: '9876543210' } });
    expect(mobileInput.checkValidity()).toBe(true);
  });

  test('should fail validation when income is below minimum', () => {
    const incomeInput = screen.getByLabelText(/Annual Income/i);
    fireEvent.change(incomeInput, { target: { value: '50000' } });
    expect(incomeInput.checkValidity()).toBe(false);
  });

  test('should pass validation when income meets minimum requirement', () => {
    const incomeInput = screen.getByLabelText(/Annual Income/i);
    fireEvent.change(incomeInput, { target: { value: '100000' } });
    expect(incomeInput.checkValidity()).toBe(true);
  });

  test('should successfully validate inputs and log data structure on valid form submission', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Fill out all form fields with valid data
    fireEvent.change(screen.getByLabelText(/Customer Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/Annual Income/i), { target: { value: '600000' } });
    fireEvent.change(screen.getByLabelText(/Occupation/i), { target: { value: 'Salaried' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Select Insurance Policy/i), { target: { value: 'Health' } });
    fireEvent.change(screen.getByLabelText(/Policy Term/i), { target: { value: '15' } });

    // Mock file upload element data
    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Upload Aadhaar/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit the form
    const form = document.querySelector('form');
    fireEvent.submit(form);

    // Verify form passes validation
    expect(form.checkValidity()).toBe(true);
    
    // Verify that console.log was called with application data
    expect(consoleSpy).toHaveBeenCalled();
    const lastCall = consoleSpy.mock.calls.find(call => 
      call[0] && call[0].includes('Premium Insurance Application Data Payload')
    );
    expect(lastCall).toBeDefined();
    
    consoleSpy.mockRestore();
  });

  test('should display success toast after form submission', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Fill out form with valid data
    fireEvent.change(screen.getByLabelText(/Customer Full Name/i), { target: { value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '28' } });
    fireEvent.change(screen.getByLabelText(/Annual Income/i), { target: { value: '450000' } });
    fireEvent.change(screen.getByLabelText(/Occupation/i), { target: { value: 'Salaried' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '8765432109' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'jane.smith@example.com' } });
    fireEvent.change(screen.getByLabelText(/Select Insurance Policy/i), { target: { value: 'Life' } });
    fireEvent.change(screen.getByLabelText(/Policy Term/i), { target: { value: '20' } });

    const file = new File(['content'], 'aadhaar.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText(/Upload Aadhaar/i), { target: { files: [file] } });

    const form = document.querySelector('form');
    fireEvent.submit(form);

    // Check if success toast is visible
    const toast = document.getElementById('successToast');
    expect(toast.style.display).toBe('block');
    
    consoleSpy.mockRestore();
  });

  test('should reset form after successful submission', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/Customer Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '35' } });
    fireEvent.change(screen.getByLabelText(/Annual Income/i), { target: { value: '750000' } });
    fireEvent.change(screen.getByLabelText(/Occupation/i), { target: { value: 'Professional' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '7654321098' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Select Insurance Policy/i), { target: { value: 'Vehicle' } });
    fireEvent.change(screen.getByLabelText(/Policy Term/i), { target: { value: '10' } });

    const file = new File(['content'], 'pan.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText(/Upload Aadhaar/i), { target: { files: [file] } });

    const form = document.querySelector('form');
    fireEvent.submit(form);

    // Verify form was reset
    expect(screen.getByLabelText(/Customer Full Name/i).value).toBe('');
    expect(screen.getByLabelText(/Age/i).value).toBe('');
    expect(screen.getByLabelText(/Email Address/i).value).toBe('');
    
    consoleSpy.mockRestore();
  });
});

describe('Insurance Application - Navigation Tests', () => {
  test('should navigate to different pages when menu items are clicked', () => {
    // Check home page is active initially
    const homeSection = document.getElementById('home');
    expect(homeSection.classList.contains('active')).toBe(true);

    // Navigate to policies page
    fireEvent.click(screen.getByRole('link', { name: /Policies/i }));
    const policiesSection = document.getElementById('policies');
    expect(policiesSection.classList.contains('active')).toBe(true);
    expect(homeSection.classList.contains('active')).toBe(false);

    // Navigate to compare page
    fireEvent.click(screen.getByRole('link', { name: /Compare/i }));
    const compareSection = document.getElementById('compare');
    expect(compareSection.classList.contains('active')).toBe(true);
  });

  test('should navigate to apply page from featured plans button', () => {
    const applyButtons = screen.getAllByText('Apply Now');
    expect(applyButtons.length).toBeGreaterThan(0);

    fireEvent.click(applyButtons[0]);
    const applySection = document.getElementById('apply');
    expect(applySection.classList.contains('active')).toBe(true);
  });
});
