import { signup } from './actions';
import { login } from './actions';

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <button formAction={login}>Log in</button>{' '}
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <button formAction={signup}>Sign up</button>
    </form>
  );
}
