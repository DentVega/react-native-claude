import { cn } from './cn';

describe('cn', () => {
  it('combina clases simples', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('resuelve conflictos de tailwind: la última clase gana', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignora falsy values', () => {
    expect(cn('px-2', false, null, undefined, 'py-1')).toBe('px-2 py-1');
  });

  it('aplica clases condicionales', () => {
    const active = true;
    const disabled = false;
    expect(cn('base', active && 'on', disabled && 'off')).toBe('base on');
  });
});
