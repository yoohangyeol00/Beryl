import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { signup } from '../../../api/authApi';
import { SignupForm } from '../components/SignupForm';
import { SignupIntroPanel } from '../components/SignupIntroPanel';
import { useAuth } from '../AuthContext';

export function SignupPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessRegistrationNo, setBusinessRegistrationNo] = useState('');
  const [supportsBuyer, setSupportsBuyer] = useState(true);
  const [supportsSupplier, setSupportsSupplier] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const session = await signup({
        name,
        email,
        password,
        passwordConfirm,
        company: {
          name: companyName,
          businessRegistrationNo: businessRegistrationNo || undefined,
          supportsBuyer,
          supportsSupplier
        }
      });
      setSession(session);
      navigate('/buyer/dashboard', { replace: true });
    } catch (error) {
      setErrorMessage(getSignupErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <SignupIntroPanel />
      <SignupForm
        name={name}
        email={email}
        password={password}
        passwordConfirm={passwordConfirm}
        companyName={companyName}
        businessRegistrationNo={businessRegistrationNo}
        supportsBuyer={supportsBuyer}
        supportsSupplier={supportsSupplier}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onPasswordConfirmChange={setPasswordConfirm}
        onCompanyNameChange={setCompanyName}
        onBusinessRegistrationNoChange={setBusinessRegistrationNo}
        onSupportsBuyerChange={setSupportsBuyer}
        onSupportsSupplierChange={setSupportsSupplier}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function getSignupErrorMessage(error: unknown) {
  return getApiErrorMessage(error, '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
}
