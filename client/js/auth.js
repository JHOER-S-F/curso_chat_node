// Función para iniciar sesión
async function login(usernameInput, passwordInput) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput }),
    });
  
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al iniciar sesión');
    }
  
    return await res.json(); // { id }
  }
  
  // Función para registrarse
  async function register(usernameInput, passwordInput) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usernameInput,
        password: passwordInput,
      }),
    });
  
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al registrar');
    }
  
    return await res.json(); // { id }
  }
  
  // Función para autenticar (login o registro)
  export async function authenticate() {
    const usernameInput = prompt('Ingresa tu nombre de usuario:');
    const passwordInput = prompt('Ingresa tu contraseña:');
  
    if (!usernameInput || !passwordInput) {
      alert('Nombre de usuario y contraseña son requeridos');
      return false;
    }
  
    try {
      // Intentamos iniciar sesión
      const data = await login(usernameInput, passwordInput);
      localStorage.setItem('username', usernameInput);
      localStorage.setItem('userId', data.id);
      return true;
    } catch (err) {
      console.warn('⚠️ Login falló:', err.message);
      const confirmRegister = confirm('Usuario no encontrado o contraseña incorrecta. ¿Deseas registrarte?');
      if (!confirmRegister) return false;
  
      try {
        const regData = await register(usernameInput, passwordInput);
        localStorage.setItem('username', usernameInput);
        localStorage.setItem('userId', regData.id);
        return true;
      } catch (regErr) {
        alert('❌ Error al registrarse: ' + regErr.message);
        return false;
      }
    }
  }
  