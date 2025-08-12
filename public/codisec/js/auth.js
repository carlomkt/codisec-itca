(function(){
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      const user = document.getElementById('username').value.trim();
      const pass = document.getElementById('password').value.trim();

      // Datos ficticios de ejemplo
      const usuarios = [
        {usuario: 'admin', pass: '1234', rol: 'administrador'},
        {usuario: 'editor', pass: '1234', rol: 'editor'},
        {usuario: 'viewer', pass: '1234', rol: 'visualizador'}
      ];

      const encontrado = usuarios.find(u => u.usuario === user && u.pass === pass);

      if(encontrado){
        sessionStorage.setItem('rol', encontrado.rol);
        window.location.href = 'dashboard.html';
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    });
  }
})();
