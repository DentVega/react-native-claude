import { Pressable, Text, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

/**
 * Botón primitivo del sistema de diseño.
 *
 * Variantes mínimas — extender según necesidad del proyecto (idealmente con `cva`).
 */

type Props = Omit<PressableProps, 'children'> & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
};

export function Button({ children, variant = 'primary', className, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'min-h-[44px] items-center justify-center rounded-lg px-4 py-2',
        variant === 'primary' && 'bg-blue-600 active:bg-blue-700',
        variant === 'secondary' && 'bg-neutral-200 active:bg-neutral-300',
        typeof className === 'string' ? className : '',
      )}
      {...rest}
    >
      <Text
        className={cn(
          'text-base font-medium',
          variant === 'primary' && 'text-white',
          variant === 'secondary' && 'text-neutral-900',
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}
