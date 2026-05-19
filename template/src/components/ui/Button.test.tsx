import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';

describe('Button', () => {
  it('renderiza el children como texto', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByText('Guardar')).toBeTruthy();
  });

  it('dispara onPress al tocar', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Acción</Button>);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('no dispara onPress cuando está disabled', () => {
    const onPress = jest.fn();
    render(
      <Button onPress={onPress} disabled>
        Acción
      </Button>,
    );
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
