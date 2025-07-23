declare global {
  namespace NodeJS {
    interface ProcessEnv extends Dict<string> {
      /**
       * Can be used to change the default timezone at runtime
       */
      TZ?: string;
    }
    interface Process extends EventEmitter {
      env: ProcessEnv;
    }
  }

  let __RELOADED__: boolean | undefined;

  type ArgumentTypes<F extends Function> = F extends (
    ...args: infer A
  ) => unknown
    ? A
    : never;

  type ExtractArgumentTypes<T> = T extends (...args: infer A) => unknown
    ? {
        [K in keyof A]: A[K] extends (...args: unknown) => unknown
          ? ExtractArgumentTypes<A[K]>
          : A[K];
      }
    : never;

  type Entries<T> = {
    [K in keyof T]: [K, T[K]];
  }[keyof T];

  type RangeType = {
    min: string;
    max: string;
  };

  type PageProps = {
    params?: unknown;
    searchParams?: unknown;
  };

  type LayoutProps = {
    children?: React.ReactNode;
    params?: Promise<Record<string, string>> | undefined;
  };

  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends (...args: never[]) => never
      ? T[P]
      : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
  };

  type SmartImageProps = {
    src: string;
    alt?: string;
    className?: string;
    blurPath?: string;
    width?: number;
    height?: number;
  };
}
