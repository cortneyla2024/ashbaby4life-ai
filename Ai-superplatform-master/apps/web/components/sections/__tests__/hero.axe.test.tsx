import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Hero } from '../hero';

expect.extend(toHaveNoViolations);

describe('Hero Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<Hero />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading structure', async () => {
    const { container } = render(<Hero />);
    const results = await axe(container, {
      rules: {
        'heading-order': { enabled: true },
        'page-has-heading-one': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });

  it('should have proper link accessibility', async () => {
    const { container } = render(<Hero />);
    const results = await axe(container, {
      rules: {
        'link-name': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });

  it('should have proper color contrast', async () => {
    const { container } = render(<Hero />);
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });
});


