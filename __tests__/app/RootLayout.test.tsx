import { render } from '@testing-library/react';
import RootLayout from '@/app/layout';

describe('RootLayout', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('sets the correct lang attribute on the html element', () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );
  
    // Periksa elemen <html> yang di-render di document
    const htmlElement = document.documentElement;
    expect(htmlElement).toBeInTheDocument(); // Pastikan elemen html ada
    expect(htmlElement.getAttribute('lang')).toBe('en'); // Pastikan lang adalah 'en'
  });

//   it('applies the correct classes to the body element', () => {
//     render(
//       <RootLayout>
//         <div>Test Child</div>
//       </RootLayout>
//     );
//     // Check for the classes we set in the "className" property
//     expect(document.body).toHaveClass('antialiased');
//     expect(document.body).toHaveClass('geist-sans');
//     expect(document.body).toHaveClass('geist-mono');
//   });
});