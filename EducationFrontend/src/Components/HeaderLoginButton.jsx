import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/HeaderLoginButton.css';

export default function HeaderLoginButton() {
  const navigate = useNavigate();
  useEffect(() => {
    const contactButton = document.querySelector('.navbar .contact-btn');
    if (!contactButton || document.querySelector('.navbar-login-btn')) return undefined;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'navbar-login-btn';
    button.innerHTML = '<span aria-hidden="true">&#128274;</span> Login';
    button.addEventListener('click', () => navigate('/login'));
    contactButton.insertAdjacentElement('afterend', button);
    return () => button.remove();
  }, [navigate]);
  return null;
}
