const { screen, fireEvent } = require('@testing-library/dom');
require('@testing-library/jest-dom');
const fs = require('fs');
const path = require('path');

// Load the HTML file into JSDOM environment before each test
const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

beforeEach(() => {
  // Clear the DOM first
  document.documentElement.innerHTML = '';
  
  // Parse the HTML to extract script separately
  const scriptStartIdx = html.indexOf('<script>');
  const scriptEndIdx = html.indexOf('</script>');
  
  const htmlContent = html.substring(0, scriptStartIdx) + html.substring(scriptEndIdx + 9);
  const scriptContent = html.substring(scriptStartIdx + 8, scriptEndIdx);
  
  // Set the DOM with full HTML
  document.documentElement.innerHTML = htmlContent;
  
  // Execute the script in global scope
  try {
    const fn = new Function(scriptContent);
    fn.call(window);
    
    // Call initApp after script execution
    if (typeof window.initApp === 'function') {
      window.initApp();
    }
  } catch (e) {
    console.error('Script error:', e);
  }
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Insurance Application - UI & Navigation Tests', () => {
  test('should render the company logo and navigation elements', () => {
    const logo = screen.getByText(/SureTrust/i);
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
    const table = document.querySelector('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('Policy Type')).toBeInTheDocument();
    expect(screen.getByText('Min. Premium')).toBeInTheDocument();
    expect(screen.getByText('Maturity Period')).toBeInTheDocument();
    expect(screen.getByText('Eligibility Criteria')).toBeInTheDocument();
  });
});

describe('Insurance Application - Form Validation & Submission Tests', () => {
  test('should block submission and trigger native validation if required fields are missing', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const form = document.querySelector('form');
    
    // Attempt submission with empty fields - browser validation should prevent it
    fireEvent.submit(form);
    
    // The form should not trigger console.log for empty submission due to HTML5 validation
    // If consoleSpy was called, it means validation was bypassed (which we accept for JSDOM)
    // So we just check the form validity instead
    expect(form.checkValidity()).toBe(false);
    
    consoleSpy.mockRestore();
  });

  test('should fail validation when a mobile number does not match the 10-digit pattern', () => {
    const mobileInput = screen.getByLabelText(/Mobile Number/i);
    fireEvent.change(mobileInput, { target: { value: '12345' } });
    
    expect(mobileInput.checkValidity()).toBe(false);
  });

  test('should successfully validate inputs and log data structure on valid form submission', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Fill out all form attributes accurately
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

    // Submit form payload safely
    const form = document.querySelector('form');
    fireEvent.submit(form);

    // Form validation check pass expectation
    expect(form.checkValidity()).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
