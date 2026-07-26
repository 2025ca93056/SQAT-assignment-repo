const { screen, fireEvent } = require('@testing-library/dom');
require('@testing-library/jest-dom');
const fs = require('fs');
const path = require('path');

// Load the HTML file into JSDOM environment before each test
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

beforeEach(() => {
  document.documentElement.innerHTML = html.toString();
  // Execute inline scripts to bind event listeners
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    try {
      eval(scripts[i].innerHTML);
    } catch (e) {
      // Prevents empty or external scripts from throwing errors during evaluation
    }
  }
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Insurance Application - UI & Navigation Tests', () => {
  test('should render the company logo and navigation elements', () => {
    const logo = screen.getByText(/ShieldSure Insurance/i);
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
});

describe('Insurance Application - Policy Comparison Tests', () => {
  test('should verify the comparison table contains critical metric headers', () => {
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('Plan Name')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Maturity Period')).toBeInTheDocument();
    expect(screen.getByText('Eligibility')).toBeInTheDocument();
  });
});

describe('Insurance Application - Form Validation & Submission Tests', () => {
  test('should block submission and trigger native validation if required fields are missing', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const form = screen.getByRole('form') || document.querySelector('form');
    
    // Attempt submission with empty fields
    fireEvent.submit(form);
    
    // Form should not print payload due to browser validation constraints
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test('should fail validation when a mobile number does not match the 10-digit pattern', () => {
    const mobileInput = screen.getByLabelText(/Mobile Number/i);
    mobileInput.value = '12345'; // Invalid pattern
    
    const form = document.querySelector('form');
    fireEvent.submit(form);
    
    expect(mobileInput.checkValidity()).toBe(false);
  });

  test('should successfully validate inputs and log data structure on valid form submission', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Fill out all form attributes accurately
    fireEvent.change(screen.getByLabelText(/Customer Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Age/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/Annual Income/i), { target: { value: '600000' } });
    fireEvent.change(screen.getByLabelText(/Occupation/i), { target: { value: 'Software Engineer' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Select Policy/i), { target: { value: 'Health Insurance' } });
    fireEvent.change(screen.getByLabelText(/Policy Term/i), { target: { value: '15 Years' } });

    // Mock file upload element data
    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Upload Aadhaar\/PAN/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit form payload safely
    const form = document.querySelector('form');
    fireEvent.submit(form);

    // Form validation check pass expectation
    expect(form.checkValidity()).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
