import { type UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { ApiError } from '@/services/api';

import { Button } from './Button';

/**
 * Componente unificado para estados de loading / error / empty.
 *
 * Uso:
 * ```tsx
 * <ScreenState query={userQuery}>
 *   {(data) => <UserProfile user={data} />}
 * </ScreenState>
 * ```
 *
 * Para chequear "empty" cuando la query devolvió data pero está vacía:
 * ```tsx
 * <ScreenState query={postsQuery} isEmpty={(data) => data.length === 0}>
 *   {(data) => <PostList posts={data} />}
 * </ScreenState>
 * ```
 */

type Props<T> = {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
  isEmpty?: (data: T) => boolean;
  emptyMessage?: string;
  loadingComponent?: React.ReactNode;
};

export function ScreenState<T>({
  query,
  children,
  isEmpty,
  emptyMessage,
  loadingComponent,
}: Props<T>) {
  const { t } = useTranslation();

  if (query.isPending) {
    return (
      loadingComponent ?? (
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" />
          <Text className="mt-3 text-base text-neutral-600">{t('common.loading')}</Text>
        </View>
      )
    );
  }

  if (query.isError) {
    const message = getErrorMessage(query.error, t);
    return (
      <View
        accessibilityRole="alert"
        className="flex-1 items-center justify-center gap-3 p-6"
      >
        <Text className="text-center text-base text-neutral-800">{message}</Text>
        <Button onPress={() => query.refetch()} accessibilityLabel={t('common.retry')}>
          {t('common.retry')}
        </Button>
      </View>
    );
  }

  if (isEmpty?.(query.data)) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-base text-neutral-600">{emptyMessage ?? t('common.empty')}</Text>
      </View>
    );
  }

  return <>{children(query.data)}</>;
}

function getErrorMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return t('errors.unauthorized');
    if (error.status === 404) return t('errors.notFound');
    if (error.status >= 500) return t('errors.server');
  }
  // Network errors typically throw TypeError in fetch
  if (error instanceof TypeError) return t('errors.network');
  return t('errors.generic');
}
