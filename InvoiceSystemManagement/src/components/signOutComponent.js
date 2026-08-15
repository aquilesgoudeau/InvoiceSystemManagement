import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Context as AuthContext } from '../contexts/authContext';


const SignOutComponent = () => {
  const { signOut } = useContext(AuthContext);

  return (
    <TouchableOpacity
      onPress={signOut}
      className="p-2 rounded-full bg-slate-200"
      accessibilityLabel="Cerrar sesión"
      accessibilityRole="button"
    >
      <Ionicons name="log-out-outline" size={22} color="#334155" />
    </TouchableOpacity>
  );
};

export default SignOutComponent;