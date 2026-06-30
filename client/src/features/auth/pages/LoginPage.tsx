import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { login } from '../../../api/authApi';
import { useAuth } from '../AuthContext';
import { LoginForm } from '../components/LoginForm';
import { LoginIntroPanel } from '../components/LoginIntroPanel';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const session = await login({
        email,
        password
      });
      setSession(session);
      navigate(getRedirectPath(location.state), { replace: true });
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <LoginIntroPanel />
      <LoginForm
        email={email}
        password={password}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function getLoginErrorMessage(error: unknown) {
  return getApiErrorMessage(error, '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
}

function getRedirectPath(state: unknown) {
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from?: { pathname?: string } }).from;

    if (from?.pathname && from.pathname !== '/login' && from.pathname !== '/signup') {
      return from.pathname;
    }
  }

  return '/buyer/dashboard';
}
