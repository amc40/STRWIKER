import { login } from './actions';
import { Button, Field, Input, Label } from '@headlessui/react';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          action={login}
          className="space-y-6 block text-sm font-medium text-gray-700"
        >
          <Field>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </Field>
          <Button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primaryhover focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Log in
          </Button>
        </form>
      </div>
    </div>
  );
}
