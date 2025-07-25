// somewhere.d.ts — расширяем типы Axios
import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** true → не добавлять Authorization и не перехватывать 401 */
    skipAuth?: boolean;
    /** служебный флаг «повторно запускаю запрос» */
    __isRetry?: boolean;
  }
}
