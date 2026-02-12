import { useContext, useState, useEffect } from 'react';
import { AppContext } from 'context/AppContext';
import { useNavigate } from 'react-router-dom'

export function useRoot() {

  const [state, setState] = useState({ loading: true });
  const app = useContext(AppContext);
  const navigate = useNavigate();

  const updateState = (value) => {
    setState((s) => ({ ...s, ...value }));
  }

  useEffect(() => {
    if (app.state.session === true) {
      updateState({ loading: false, session: true });
      navigate('/session');
    }
    if (app.state.session === false) {
      updateState({ loading: false, session: false });
      navigate('/login');
    }
  }, [app.state]);

  const actions = {
  };

  return { state, actions };
}

