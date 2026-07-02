import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { signup } from '../../../api/authApi';
import { verifyBusinessRegistrationStatus } from '../../../api/businessVerificationsApi';
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
  const [businessRegistrationNoVerified, setBusinessRegistrationNoVerified] = useState(false);
  const [businessVerificationMessage, setBusinessVerificationMessage] = useState('');
  const [isBusinessVerifying, setIsBusinessVerifying] = useState(false);
  const [supportsBuyer, setSupportsBuyer] = useState(true);
  const [supportsSupplier, setSupportsSupplier] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    const normalizedBusinessRegistrationNo = normalizeBusinessRegistrationNo(businessRegistrationNo);
    if (!normalizedBusinessRegistrationNo) {
      setErrorMessage('사업자등록번호를 입력하고 인증을 완료해주세요.');
      return;
    }

    if (!businessRegistrationNoVerified) {
      setErrorMessage('사업자등록번호 인증을 완료해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await signup({
        name,
        email,
        password,
        passwordConfirm,
        company: {
          name: companyName,
          businessRegistrationNo: normalizedBusinessRegistrationNo || undefined,
          businessRegistrationNoVerified,
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

  function handleBusinessRegistrationNoChange(value: string) {
    setBusinessRegistrationNo(value);
    setBusinessRegistrationNoVerified(false);
    setBusinessVerificationMessage('');
  }

  async function handleVerifyBusinessRegistrationNo() {
    if (isSubmitting || isBusinessVerifying) return;

    const normalizedBusinessRegistrationNo = normalizeBusinessRegistrationNo(businessRegistrationNo);
    if (normalizedBusinessRegistrationNo.length !== 10) {
      setBusinessRegistrationNoVerified(false);
      setBusinessVerificationMessage('사업자등록번호는 숫자 10자리로 입력해주세요.');
      return;
    }

    setIsBusinessVerifying(true);
    setBusinessVerificationMessage('');
    setErrorMessage('');

    try {
      const result = await verifyBusinessRegistrationStatus(normalizedBusinessRegistrationNo);
      setBusinessRegistrationNo(result.businessNumber || normalizedBusinessRegistrationNo);
      setBusinessRegistrationNoVerified(result.verified);
      setBusinessVerificationMessage(
        result.verified
          ? `인증 완료: ${result.statusMessage || '계속사업자'}`
          : result.statusMessage || '사업자등록 상태를 확인할 수 없습니다.'
      );
    } catch (error) {
      setBusinessRegistrationNoVerified(false);
      setBusinessVerificationMessage(getApiErrorMessage(error, '사업자등록번호 인증 중 오류가 발생했습니다.'));
    } finally {
      setIsBusinessVerifying(false);
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
        businessRegistrationNoVerified={businessRegistrationNoVerified}
        businessVerificationMessage={businessVerificationMessage}
        isBusinessVerifying={isBusinessVerifying}
        supportsBuyer={supportsBuyer}
        supportsSupplier={supportsSupplier}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onPasswordConfirmChange={setPasswordConfirm}
        onCompanyNameChange={setCompanyName}
        onBusinessRegistrationNoChange={handleBusinessRegistrationNoChange}
        onVerifyBusinessRegistrationNo={handleVerifyBusinessRegistrationNo}
        onSupportsBuyerChange={setSupportsBuyer}
        onSupportsSupplierChange={setSupportsSupplier}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function normalizeBusinessRegistrationNo(value: string) {
  return value.replace(/\D/g, '');
}

function getSignupErrorMessage(error: unknown) {
  return getApiErrorMessage(error, '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
}
