import React, { useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignupPageProps {
  onSignup: (token: string) => void;
  navigateToLogin: () => void;
}
type SignUpFormProps = SignupPageProps & React.HTMLAttributes<HTMLDivElement>;

const SignupPage: React.FC<SignUpFormProps> = ({
  onSignup,
  navigateToLogin,
  className,
  ...props
}) => {
  // const [username, setUsername] = useState<string>('');
  // const [email, setEmail] = useState<string>('');
  // const [password, setPassword] = useState<string>('');
  // const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError(null);

  //   // Validate passwords match
  //   if (password !== confirmPassword) {
  //     setError('Passwords do not match');
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     // Replace with your actual API call
  //     const response = await fetch('YOUR_API_ENDPOINT/signup', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         username,
  //         email,
  //         password,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.message || 'Registration failed');
  //     }

  //     // Call the onSignup prop with the token
  //     onSignup(data.token);
  //   } catch (error) {
  //     console.error('Registration error:', error);
  //     setError('Registration failed. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // For demo/development purposes only - remove in production

  const handleDemoSignup = () => {
    onSignup('demo-token-123');
  };

  return (
    <>
      <div className="md:hidden">
        {/* <img
          src="/assets/shad.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        /> */}
      </div>
      <div className="container relative hidden h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <button
          onClick={navigateToLogin}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'absolute right-4 top-4 md:right-8 md:top-8'
          )}
        >
          Login
        </button>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Acme Inc
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>
            <div className={cn('grid gap-6', className)} {...props}>
              <form onSubmit={handleDemoSignup}>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label className="sr-only" htmlFor="email">
                      Email
                    </Label>
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                    />
                  </div>
                  <Button disabled={isLoading}>
                    {/* {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )} */}
                    Sign In with Email
                  </Button>
                </div>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button variant="outline" type="button" disabled={isLoading}>
                {/* {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.gitHub className="mr-2 h-4 w-4" />
                )}{' '} */}
                GitHub
              </Button>
            </div>{' '}
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <a
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
