import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SexToggle } from './sex-toggle';

describe('SexToggle', () => {
  it('should render both options with accessible radio roles', () => {
    render(<SexToggle value={undefined} onChange={() => {}} />);
    const group = screen.getByRole('radiogroup');
    expect(group).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0]).toHaveTextContent('Macho');
    expect(radios[1]).toHaveTextContent('Fêmea');
  });

  it('should reflect the selected value via aria-checked', () => {
    render(<SexToggle value="female" onChange={() => {}} />);
    const [male, female] = screen.getAllByRole('radio');
    expect(male).toHaveAttribute('aria-checked', 'false');
    expect(female).toHaveAttribute('aria-checked', 'true');
  });

  it('should call onChange with "male" when clicking the male option', () => {
    const handleChange = vi.fn();
    render(<SexToggle value={undefined} onChange={handleChange} />);
    const [male] = screen.getAllByRole('radio');
    fireEvent.click(male);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('male');
  });

  it('should call onChange with "female" when clicking the female option', () => {
    const handleChange = vi.fn();
    render(<SexToggle value={undefined} onChange={handleChange} />);
    const [, female] = screen.getAllByRole('radio');
    fireEvent.click(female);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('female');
  });

  it('should expose aria-invalid and describe the error via aria-describedby', () => {
    render(
      <SexToggle
        id="pet-sex"
        value={undefined}
        onChange={() => {}}
        error="Selecione o sexo do pet"
      />,
    );
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-describedby', 'pet-sex-error');
  });

  it('should not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(<SexToggle value={undefined} onChange={handleChange} disabled />);
    const [male] = screen.getAllByRole('radio');
    fireEvent.click(male);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should move selection with ArrowRight/ArrowLeft', () => {
    const handleChange = vi.fn();
    render(<SexToggle value="male" onChange={handleChange} />);
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenLastCalledWith('female');
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenLastCalledWith('female');
  });
});
